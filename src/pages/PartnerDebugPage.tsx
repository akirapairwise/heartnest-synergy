
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInviteDebug } from '@/hooks/partner/useInviteDebug';
import { Loader2 } from 'lucide-react';

const PartnerDebugPage = () => {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [userId1, setUserId1] = useState('');
  const [userId2, setUserId2] = useState('');
  
  const { 
    isLoading, 
    debugResults, 
    checkUserPartnerStatus, 
    checkTokenStatus,
    checkPartnerConnection
  } = useInviteDebug();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Partner Connection Debug Tool</h1>
      
      <Tabs defaultValue="user">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user">Check User</TabsTrigger>
          <TabsTrigger value="token">Check Token</TabsTrigger>
          <TabsTrigger value="connection">Check Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="user" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Partner Status</CardTitle>
              <CardDescription>
                Check a user's partner status and invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">User ID</label>
                  <Input 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                </div>
                <Button 
                  onClick={() => checkUserPartnerStatus(userId)}
                  disabled={isLoading || !userId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : 'Check Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="token" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Token Status</CardTitle>
              <CardDescription>
                Check if a token is valid, expired, or already used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Token</label>
                  <Input 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter invitation token"
                  />
                </div>
                <Button 
                  onClick={() => checkTokenStatus(token)}
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : 'Check Token'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Check Partner Connection</CardTitle>
              <CardDescription>
                Verify if two users are correctly partnered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User ID 1</label>
                  <Input 
                    value={userId1} 
                    onChange={(e) => setUserId1(e.target.value)}
                    placeholder="Enter first user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User ID 2</label>
                  <Input 
                    value={userId2} 
                    onChange={(e) => setUserId2(e.target.value)}
                    placeholder="Enter second user ID"
                  />
                </div>
                <Button 
                  onClick={() => checkPartnerConnection(userId1, userId2)}
                  disabled={isLoading || !userId1 || !userId2}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking connection...
                    </>
                  ) : 'Check Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {debugResults && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartnerDebugPage;
