"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IntegrationProvider, IntegrationConnection } from "@/types/integrations";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: IntegrationProvider | null;
  connection?: IntegrationConnection;
  onConnect: (data: any) => Promise<void>;
}

export function ConnectionModal({ isOpen, onClose, provider, connection, onConnect }: ConnectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!provider) return null;

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect({ apiKey, username, password });
      onClose();
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {provider.name}</DialogTitle>
          <DialogDescription>
            Configure your connection to {provider.name}. You can use OAuth or API keys.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="apikey" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apikey">API Key</TabsTrigger>
            <TabsTrigger value="oauth">OAuth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apikey" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key / Token</Label>
              <Input 
                id="api-key" 
                type="password" 
                placeholder={`Enter your ${provider.name} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can generate an API key in your {provider.name} settings.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="oauth" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <p className="text-center text-sm text-muted-foreground">
                Connect securely using OAuth 2.0. You will be redirected to {provider.name} to authorize access.
              </p>
              <Button variant="outline" className="w-full" onClick={handleConnect} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <div className="mr-2 h-4 w-4">{provider.logo}</div>
                )}
                Connect with {provider.name}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
