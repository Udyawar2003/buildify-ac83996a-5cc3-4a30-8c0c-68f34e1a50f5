
import React, { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import SettingsDialog from '../components/settings/SettingsDialog';
import AuthForm from '../components/auth/AuthForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingBag, BarChart3, Wallet, FileText } from 'lucide-react';

const AmeenApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // For demo purposes, set a dummy user ID
    setUserId('00000000-0000-0000-0000-000000000000');
  };

  const handleConversationChange = (newConversationId: string) => {
    setConversationId(newConversationId);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-4 flex-grow overflow-hidden">
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Chat with Ameen</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Digital Products</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Sales Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-grow overflow-hidden">
            <ChatWindow
              conversationId={conversationId}
              userId={userId}
              onOpenSettings={() => setSettingsOpen(true)}
              voiceEnabled={voiceEnabled}
              onConversationChange={handleConversationChange}
            />
          </TabsContent>
          
          <TabsContent value="products" className="flex-grow overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Product Management</CardTitle>
                  <CardDescription>Create and manage your digital products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Ameen can help you create and manage various digital products:</p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Ready-made logos</li>
                    <li>Poster templates</li>
                    <li>eBook templates</li>
                    <li>Digital planners</li>
                    <li>Study notes</li>
                    <li>UI/UX mockups</li>
                    <li>Quranic journals</li>
                  </ul>
                  <Button className="w-full">Create New Product</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Automated Marketing</CardTitle>
                  <CardDescription>Auto-generate marketing content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Ameen automatically generates marketing content for your products:</p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Blog posts</li>
                    <li>Social media updates</li>
                    <li>Email campaigns</li>
                    <li>Website listings</li>
                  </ul>
                  <Button className="w-full">View Marketing Content</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sales" className="flex-grow overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Sales Dashboard</CardTitle>
                <CardDescription>Track your digital product sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Total Sales</h3>
                    <p className="text-2xl font-bold">₹24,500</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Products Sold</h3>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Conversion Rate</h3>
                    <p className="text-2xl font-bold">8.5%</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">Ameen automatically processes sales, handles currency conversion, and delivers products to customers.</p>
                <Button className="w-full">View Detailed Reports</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet" className="flex-grow overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Management</CardTitle>
                <CardDescription>Track and withdraw your earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Withdrawable Profit</h3>
                    <p className="text-2xl font-bold">₹14,700</p>
                    <p className="text-xs text-gray-400">60% of total earnings</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Business Growth Fund</h3>
                    <p className="text-2xl font-bold">₹7,350</p>
                    <p className="text-xs text-gray-400">30% of total earnings</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-1">Expense Coverage</h3>
                    <p className="text-2xl font-bold">₹2,450</p>
                    <p className="text-xs text-gray-400">10% of total earnings</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4">Ameen automatically splits your earnings and can transfer withdrawable profit to your UPI accounts.</p>
                <div className="flex gap-2">
                  <Button className="flex-1">Withdraw to UPI</Button>
                  <Button variant="outline" className="flex-1">Transaction History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default AmeenApp;

export default AmeenApp;