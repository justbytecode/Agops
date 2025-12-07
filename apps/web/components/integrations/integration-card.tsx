"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationProvider, IntegrationConnection } from "@/types/integrations";
import { CheckCircle, ExternalLink, Plus, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  provider: IntegrationProvider;
  connection?: IntegrationConnection;
  onConnect: (provider: IntegrationProvider) => void;
  onConfigure: (connection: IntegrationConnection) => void;
  isConnecting?: boolean;
}

export function IntegrationCard({ provider, connection, onConnect, onConfigure, isConnecting }: IntegrationCardProps) {
  const isConnected = connection?.status === "connected";

  return (
    <Card className={cn("flex flex-col h-full transition-all hover:shadow-md", isConnected && "border-primary/50 bg-primary/5")}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-background p-1">
            {/* Placeholder for logo - in real app use actual logos */}
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-bold uppercase text-muted-foreground">
              {provider.logo.slice(0, 2)}
            </div>
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{provider.name}</CardTitle>
            <CardDescription className="text-xs">{provider.category}</CardDescription>
          </div>
        </div>
        {isConnected && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 py-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {provider.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-0">
        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
            Docs <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
        {isConnected ? (
          <Button size="sm" variant="outline" className="h-8" onClick={() => onConfigure(connection!)}>
            <Settings className="mr-2 h-3 w-3" />
            Configure
          </Button>
        ) : (
          <Button size="sm" className="h-8" onClick={() => onConnect(provider)} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-3 w-3" />
                Connect
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
