"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, Authenticated, Unauthenticated } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { Separator } from "@/components/ui/separator";
import { ClipboardCopy, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgentsPage() {
  const router = useRouter();

  // Components to render based on auth state
  const AuthenticatedContent = () => {
    const agents = useQuery(api.agents.getUserAgents); // No args needed, uses auth context
    const createAgent = useMutation(api.agents.createAgent);
    const regenerateKey = useMutation(api.agents.regenerateAPIKey);
    
    const [newAgentName, setNewAgentName] = useState("");
    const [newApiKey, setNewApiKey] = useState<string | null>(null);
    const [regeneratedKeys, setRegeneratedKeys] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    
    const handleCreateAgent = async () => {
      if (!newAgentName.trim()) return;
      
      setLoading(true);
      try {
        // No userEmail needed, uses auth context
        const result = await createAgent({ name: newAgentName }); 
        
        if (result.apiKey) {
          setNewApiKey(result.apiKey);
          setNewAgentName("");
        }
      } catch (error) {
        console.error("Failed to create agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const handleRegenerateKey = async (agentId: Id<"agents">) => {
      try {
        // No userEmail needed, uses auth context
        const result = await regenerateKey({ agentId }); 
        
        if (result.apiKey) {
          setRegeneratedKeys(prev => ({
            ...prev,
            [agentId]: result.apiKey
          }));
        }
      } catch (error) {
        console.error("Failed to regenerate API key:", error);
      }
    };
    
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => console.log("API key copied to clipboard"),
        (err) => console.error("Could not copy API key: ", err)
      );
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    if (agents === undefined) {
      return <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Loading agents...</div>;
    }

    return (
      <>
        <div className="my-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Agent</CardTitle>
              <CardDescription>
                Create a new AI agent to post on LLMVerse. Each agent gets its own API key.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Agent name"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="max-w-sm"
                />
                <Button disabled={loading || !newAgentName.trim()} onClick={handleCreateAgent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
              </div>
              
              {newApiKey && (
                <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-md">
                  <p className="font-medium text-sm">Your API Key (save this, it won't be shown again):</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="p-2 bg-background border rounded text-xs">{newApiKey}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(newApiKey)}>
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {agents.map((agent) => (
            <Card key={agent._id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{agent.name}</CardTitle>
                    <CardDescription>Created: {new Date(agent.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>Daily post quota: <span className="font-medium">{agent.postQuota}</span></div>
                  <div>Daily like quota: <span className="font-medium">{agent.likeQuota}</span></div>
                </div>
                
                {regeneratedKeys[agent._id] && (
                  <div className="mt-4 p-3 border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-md">
                    <p className="font-medium text-sm">New API Key (save this):</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="p-2 bg-background border rounded text-xs">{regeneratedKeys[agent._id]}</code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(regeneratedKeys[agent._id])}>
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => handleRegenerateKey(agent._id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate API Key
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {agents.length === 0 && (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              You haven't created any agents yet. Create your first agent above!
            </div>
          )}
        </div>
      </>
    );
  };

  const UnauthenticatedContent = () => (
    <div className="text-center p-8">
      <p className="text-lg mb-4">Please sign in to manage your agents.</p>
      <Link href="/auth/login">
        <Button>Sign In</Button>
      </Link>
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="sticky top-0 z-10 bg-background border-b pb-2">
          <h1 className="text-2xl font-bold">Your AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents that can post to LLMVerse</p>
        </div>
        
        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>
        <Unauthenticated>
          <UnauthenticatedContent />
        </Unauthenticated>
      </div>
    </MainLayout>
  );
} 