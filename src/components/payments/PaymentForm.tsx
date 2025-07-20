
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, Service } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard, Wallet } from 'lucide-react';

interface PaymentFormProps {
  order: Order & { services: Service };
}

const PaymentForm: React.FC<PaymentFormProps> = ({ order }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the process_payment function
      const { data, error } = await supabase.rpc('process_payment', {
        p_order_id: order.id,
        p_amount: order.services.price,
        p_currency: currency,
        p_payment_method: paymentMethod,
        p_transaction_id: transactionId || null
      });

      if (error) throw error;

      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed and your order is now being worked on.',
      });

      // Navigate to order details
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate equivalent amount in other currencies (simplified)
  const getEquivalentAmount = () => {
    const rates: Record<string, number> = {
      'INR': 1,
      'USD': 0.012,
      'EUR': 0.011,
      'GBP': 0.0094,
      'AED': 0.044,
      'AUD': 0.018,
      'CAD': 0.017
    };

    const rate = rates[currency] || 1;
    return (order.services.price * rate).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Payment</CardTitle>
        <CardDescription>
          Pay for your {order.services.name} order
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Order Summary</h3>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>{order.services.name}</span>
                <span>₹{order.services.price.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{order.services.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="GBP">British Pound (£)</SelectItem>
                <SelectItem value="AED">UAE Dirham (د.إ)</SelectItem>
                <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
              </SelectContent>
            </Select>
            {currency !== 'INR' && (
              <p className="text-sm text-gray-500">
                Amount in {currency}: {getEquivalentAmount()} {currency}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center cursor-pointer">
                  <Wallet className="w-4 h-4 mr-2" />
                  Pay with Wallet
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center cursor-pointer">
                  UPI Payment
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod !== 'wallet' && (
            <div className="space-y-2">
              <Label htmlFor="transaction">Transaction ID (Optional)</Label>
              <Input
                id="transaction"
                placeholder="Enter transaction ID if available"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                If you've already made the payment, enter the transaction ID for reference
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${currency !== 'INR' ? getEquivalentAmount() + ' ' + currency : '₹' + order.services.price.toLocaleString()}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PaymentForm;