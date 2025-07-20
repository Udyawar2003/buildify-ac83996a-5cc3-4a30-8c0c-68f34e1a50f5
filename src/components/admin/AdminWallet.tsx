
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowDown, ArrowUp, Wallet, RefreshCw } from 'lucide-react';
import { PaymentMethod } from '@/types';

interface WalletData {
  id: string;
  balance: number;
  withdrawable_profit: number;
  business_growth_fund: number;
  expense_coverage: number;
  last_updated: string;
}

const AdminWallet: React.FC = () => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'googlepay',
    upi_id: '',
  });
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet data
        const { data: walletData, error: walletError } = await supabase
          .from('wallet')
          .select('*')
          .single();

        if (walletError) throw walletError;

        // Fetch payment methods
        const { data: methodsData, error: methodsError } = await supabase
          .from('payment_methods')
          .select('*');

        if (methodsError) throw methodsError;

        setWallet(walletData);
        setPaymentMethods(methodsData || []);
        
        if (methodsData && methodsData.length > 0) {
          const defaultMethod = methodsData.find(method => method.is_default);
          setSelectedPaymentMethod(defaultMethod?.id || methodsData[0].id);
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        toast({
          title: 'Failed to load wallet data',
          description: 'There was an error loading your wallet information. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [toast]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: 'Payment method required',
        description: 'Please select a payment method for withdrawal.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    if (amount > (wallet?.withdrawable_profit || 0)) {
      toast({
        title: 'Insufficient funds',
        description: 'Withdrawal amount exceeds available profit.',
        variant: 'destructive',
      });
      return;
    }

    setWithdrawing(true);

    try {
      const { data, error } = await supabase.rpc('withdraw_from_wallet', {
        p_amount: amount,
        p_payment_method_id: selectedPaymentMethod
      });

      if (error) throw error;

      if (data) {
        // Refresh wallet data
        const { data: walletData } = await supabase
          .from('wallet')
          .select('*')
          .single();

        setWallet(walletData);
        setWithdrawAmount('');

        toast({
          title: 'Withdrawal successful',
          description: `₹${amount.toLocaleString()} has been withdrawn to your selected payment method.`,
        });
      }
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      toast({
        title: 'Withdrawal failed',
        description: 'There was an error processing your withdrawal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.upi_id) {
      toast({
        title: 'UPI ID required',
        description: 'Please enter a valid UPI ID.',
        variant: 'destructive',
      });
      return;
    }

    setAddingPaymentMethod(true);

    try {
      // Check if this is the first payment method
      const isDefault = paymentMethods.length === 0;

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          type: newPaymentMethod.type,
          upi_id: newPaymentMethod.upi_id,
          is_default: isDefault
        })
        .select();

      if (error) throw error;

      if (data) {
        setPaymentMethods([...paymentMethods, data[0]]);
        setNewPaymentMethod({ type: 'googlepay', upi_id: '' });
        
        if (isDefault) {
          setSelectedPaymentMethod(data[0].id);
        }

        toast({
          title: 'Payment method added',
          description: 'Your new payment method has been added successfully.',
        });
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      toast({
        title: 'Failed to add payment method',
        description: 'There was an error adding your payment method. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingPaymentMethod(false);
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      // First, reset all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .neq('id', 'none');

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        is_default: method.id === id
      }));
      
      setPaymentMethods(updatedMethods);
      
      toast({
        title: 'Default payment method updated',
        description: 'Your default payment method has been updated successfully.',
      });
    } catch (err) {
      console.error('Error setting default payment method:', err);
      toast({
        title: 'Failed to update default payment method',
        description: 'There was an error updating your default payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      
      // If the deleted method was selected, select another one
      if (selectedPaymentMethod === id) {
        const defaultMethod = updatedMethods.find(method => method.is_default);
        setSelectedPaymentMethod(defaultMethod?.id || (updatedMethods[0]?.id || ''));
      }
      
      toast({
        title: 'Payment method deleted',
        description: 'Your payment method has been deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting payment method:', err);
      toast({
        title: 'Failed to delete payment method',
        description: 'There was an error deleting your payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[100px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500">Wallet data not available. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" /> Wallet Overview
          </CardTitle>
          <CardDescription>
            Manage your business funds and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Balance</div>
                <div className="text-2xl font-bold">₹{wallet.balance.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(wallet.last_updated).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">Withdrawable Profit</div>
                <div className="text-2xl font-bold">₹{wallet.withdrawable_profit.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((wallet.withdrawable_profit / wallet.balance) * 100)}% of total
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Business Growth Fund</div>
                <div className="text-2xl font-bold">₹{wallet.business_growth_fund.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((wallet.business_growth_fund / wallet.balance) * 100)}% of total
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Expense Coverage</div>
                <div className="text-2xl font-bold">₹{wallet.expense_coverage.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((wallet.expense_coverage / wallet.balance) * 100)}% of total
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Withdraw Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Withdrawal Amount (₹)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Available: ₹{wallet.withdrawable_profit.toLocaleString()}
                      </p>
                    </div>

                    {paymentMethods.length > 0 ? (
                      <div className="space-y-2">
                        <Label>Select Payment Method</Label>
                        <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={method.id} id={method.id} />
                                <Label htmlFor={method.id} className="flex items-center cursor-pointer">
                                  <span className="capitalize">{method.type}</span>
                                  <span className="ml-2 text-gray-500">({method.upi_id})</span>
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                {!method.is_default && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setDefaultPaymentMethod(method.id)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deletePaymentMethod(method.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No payment methods available. Please add one below.
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
                    onClick={handleWithdraw}
                    disabled={withdrawing || !selectedPaymentMethod || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet.withdrawable_profit}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-2 h-4 w-4" />
                        Withdraw Funds
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <RadioGroup 
                        value={newPaymentMethod.type} 
                        onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, type: value as any})}
                      >
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="googlepay" id="googlepay" />
                          <Label htmlFor="googlepay">Google Pay</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="phonepay" id="phonepay" />
                          <Label htmlFor="phonepay">PhonePe</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="paytm" id="paytm" />
                          <Label htmlFor="paytm">Paytm</Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                          <RadioGroupItem value="mobikwik" id="mobikwik" />
                          <Label htmlFor="mobikwik">Mobikwik</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="upi-id">UPI ID</Label>
                      <Input
                        id="upi-id"
                        placeholder="Enter UPI ID"
                        value={newPaymentMethod.upi_id}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, upi_id: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleAddPaymentMethod}
                    disabled={addingPaymentMethod || !newPaymentMethod.upi_id}
                  >
                    {addingPaymentMethod ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" /> Automatic Fund Distribution
          </CardTitle>
          <CardDescription>
            How your income is automatically split across different funds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Withdrawable Profit (60%)</Label>
                <span className="text-sm font-medium">₹{(wallet.balance * 0.6).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-green-500" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-gray-500">
                Available for withdrawal to your personal accounts
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Business Growth Fund (30%)</Label>
                <span className="text-sm font-medium">₹{(wallet.balance * 0.3).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-500" style={{ width: '30%' }} />
              </div>
              <p className="text-xs text-gray-500">
                Reserved for business expansion, marketing, and improvements
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Expense Coverage (10%)</Label>
                <span className="text-sm font-medium">₹{(wallet.balance * 0.1).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: '10%' }} />
              </div>
              <p className="text-xs text-gray-500">
                Set aside for operational expenses and unexpected costs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWallet;