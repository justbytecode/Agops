"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Key, 
  CreditCard, 
  Shield, 
  Copy, 
  Eye, 
  EyeOff,
  CheckCircle,
  RefreshCw,
  Plus,
  Trash2,
  Bot,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

interface LLMConfig {
  openaiKey: string;
  anthropicKey: string;
  geminiKey: string;
  defaultProvider: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingLLM, setIsSavingLLM] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    slackNotifications: true,
    incidentAlerts: true,
    weeklyReports: false,
    agentUpdates: true,
  });
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  
  // LLM Configuration State
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    openaiKey: "",
    anthropicKey: "",
    geminiKey: "",
    defaultProvider: "openai",
  });
  const [llmKeyVisibility, setLlmKeyVisibility] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
  });
  const [llmStatus, setLlmStatus] = useState({
    openai: { configured: false, valid: false },
    anthropic: { configured: false, valid: false },
    gemini: { configured: false, valid: false },
  });

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        company: "",
      });
    }
    fetchApiKeys();
    fetchLLMConfig();
  }, [session]);

  const fetchApiKeys = async () => {
    setApiKeys([
      {
        id: "1",
        name: "Production API",
        key: "agentops_live_sk_1234567890abcdef",
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      },
    ]);
  };

  const fetchLLMConfig = async () => {
    try {
      const res = await fetch("/api/settings/llm");
      if (res.ok) {
        const data = await res.json();
        setLlmConfig({
          openaiKey: data.openaiKey || "",
          anthropicKey: data.anthropicKey || "",
          geminiKey: data.geminiKey || "",
          defaultProvider: data.defaultProvider || "openai",
        });
        setLlmStatus({
          openai: { configured: !!data.openaiKey, valid: data.openaiValid || false },
          anthropic: { configured: !!data.anthropicKey, valid: data.anthropicValid || false },
          gemini: { configured: !!data.geminiKey, valid: data.geminiValid || false },
        });
      }
    } catch (error) {
      console.error("Error fetching LLM config:", error);
    }
  };

  const saveLLMConfig = async () => {
    setIsSavingLLM(true);
    try {
      const res = await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(llmConfig),
      });
      
      if (res.ok) {
        const data = await res.json();
        setLlmStatus({
          openai: { configured: !!llmConfig.openaiKey, valid: data.openaiValid || false },
          anthropic: { configured: !!llmConfig.anthropicKey, valid: data.anthropicValid || false },
          gemini: { configured: !!llmConfig.geminiKey, valid: data.geminiValid || false },
        });
        toast.success("AI Agent configuration saved successfully");
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSavingLLM(false);
    }
  };

  const testLLMConnection = async (provider: string) => {
    toast.info(`Testing ${provider} connection...`);
    try {
      const res = await fetch(`/api/settings/llm/test?provider=${provider}`);
      if (res.ok) {
        toast.success(`${provider} API key is valid!`);
        setLlmStatus(prev => ({
          ...prev,
          [provider.toLowerCase()]: { configured: true, valid: true }
        }));
      } else {
        toast.error(`${provider} API key is invalid`);
        setLlmStatus(prev => ({
          ...prev,
          [provider.toLowerCase()]: { configured: true, valid: false }
        }));
      }
    } catch (error) {
      toast.error(`Failed to test ${provider} connection`);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName) {
      toast.error("Please enter a name for the API key");
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `agentops_live_sk_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setShowNewKeyDialog(false);
    toast.success("API key created");
  };

  const deleteApiKey = (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success("API key deleted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    return key.slice(0, 10) + "..." + key.slice(-4);
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
          <p className="text-[#808080]">Manage your account and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Custom Tabs */}
        <div className="flex p-1 bg-[#222] rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-[#333] text-white" : "text-[#808080] hover:text-white"}`}
          >
            <User className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "notifications" ? "bg-[#333] text-white" : "text-[#808080] hover:text-white"}`}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "api" ? "bg-[#333] text-white" : "text-[#808080] hover:text-white"}`}
          >
            <Key className="h-4 w-4" /> API Keys
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "billing" ? "bg-[#333] text-white" : "text-[#808080] hover:text-white"}`}
          >
            <CreditCard className="h-4 w-4" /> Billing
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                <p className="text-[#808080] text-sm">Update your personal information and profile settings.</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border border-[#333]">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Change Avatar</Button>
                    <p className="text-xs text-[#606060] mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="h-px bg-[#2a2a2a]" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#808080]">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-[#222] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#808080]">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-[#222] border-[#333] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#808080]">Company Name</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      placeholder="Your company"
                      className="bg-[#222] border-[#333] text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-start">
                  <Button onClick={saveProfile} disabled={isLoading} className="bg-white text-black hover:bg-gray-100">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Password & Security</h3>
                <p className="text-[#808080] text-sm">Manage your password and security settings.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Password</p>
                    <p className="text-sm text-[#808080]">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Change Password</Button>
                </div>
                <div className="h-px bg-[#2a2a2a]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-[#808080]">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
              <p className="text-[#808080] text-sm">Configure how you receive alerts and updates.</p>
            </div>
            <div className="space-y-6">
              {[
                { label: "Email Alerts", desc: "Receive critical incident alerts via email.", key: "emailAlerts" },
                { label: "Slack Notifications", desc: "Send updates to connected Slack channels.", key: "slackNotifications" },
                { label: "Incident Alerts", desc: "Get notified immediately when incidents occur.", key: "incidentAlerts" },
                { label: "AI Agent Updates", desc: "Receive updates about AI agent actions.", key: "agentUpdates" },
                { label: "Weekly Reports", desc: "Get a summary of your infrastructure health.", key: "weeklyReports" }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">{item.label}</Label>
                      <p className="text-sm text-[#808080]">{item.desc}</p>
                    </div>
                    <Switch 
                      checked={notifications[item.key as keyof typeof notifications]} 
                      onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    />
                  </div>
                  {i < 4 && <div className="h-px bg-[#2a2a2a] my-4" />}
                </div>
              ))}
              <div className="pt-4">
                <Button onClick={saveNotifications} disabled={isLoading} className="bg-white text-black hover:bg-gray-100">
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">API Keys</h3>
                  <p className="text-[#808080] text-sm">Manage API keys for programmatic access.</p>
                </div>
                <Button onClick={() => setShowNewKeyDialog(true)} className="bg-white text-black hover:bg-gray-100">
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </div>
              
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-[#808080]">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-4 border border-[#333] rounded-xl bg-[#222]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{apiKey.name}</p>
                          <Badge variant="secondary" className="bg-[#333] text-green-400">Live</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-[#111] px-2 py-1 rounded text-[#a0a0a0] font-mono border border-[#333]">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            className="hover:bg-[#333]"
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff className="h-4 w-4 text-[#808080]" />
                            ) : (
                              <Eye className="h-4 w-4 text-[#808080]" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => copyToClipboard(apiKey.key)}
                            className="hover:bg-[#333]"
                          >
                            <Copy className="h-4 w-4 text-[#808080]" />
                          </Button>
                        </div>
                        <p className="text-xs text-[#606060]">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="hover:bg-[#333]"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showNewKeyDialog && (
                <div className="mt-4 p-4 border border-[#333] rounded-xl bg-[#222]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">API Key Name</Label>
                      <Input
                        placeholder="e.g., Production API"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="bg-[#1a1a1a] border-[#333] text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createApiKey} className="bg-white text-black hover:bg-gray-100">Create Key</Button>
                      <Button variant="outline" onClick={() => setShowNewKeyDialog(false)} className="bg-transparent border-[#333] text-[#808080]">Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Agent LLM Configuration */}
            <div className="bg-[#1a1a1a] border border-violet-500/30 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <Bot className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">AI Agent Configuration</h3>
                  <p className="text-[#808080] text-sm">Configure LLM providers for your AI agents.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* OpenAI */}
                <div className="space-y-3 p-4 border border-[#333] rounded-xl bg-[#222]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border border-[#333]">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div>
                        <Label className="text-base font-medium text-white">OpenAI API Key</Label>
                        <p className="text-xs text-[#808080]">GPT-4 powered analysis</p>
                      </div>
                    </div>
                    {llmStatus.openai.configured && (
                      <Badge variant="outline" className={`gap-1 ${llmStatus.openai.valid ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                        {llmStatus.openai.valid ? (
                          <><CheckCircle className="w-3 h-3" /> Connected</>
                        ) : (
                          <><AlertCircle className="w-3 h-3" /> Invalid</>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type={llmKeyVisibility.openai ? "text" : "password"}
                        placeholder="sk-..." 
                        className="font-mono pr-10 bg-[#1a1a1a] border-[#333] text-white"
                        value={llmConfig.openaiKey}
                        onChange={(e) => setLlmConfig({ ...llmConfig, openaiKey: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-[#333]"
                        onClick={() => setLlmKeyVisibility({ ...llmKeyVisibility, openai: !llmKeyVisibility.openai })}
                      >
                        {llmKeyVisibility.openai ? <EyeOff className="h-4 w-4 text-[#808080]" /> : <Eye className="h-4 w-4 text-[#808080]" />}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={() => testLLMConnection("OpenAI")} className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Test</Button>
                  </div>
                </div>

                {/* Anthropic (Claude) */}
                <div className="space-y-3 p-4 border border-[#333] rounded-xl bg-[#222]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#d97757] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <div>
                        <Label className="text-base font-medium text-white">Anthropic API Key</Label>
                        <p className="text-xs text-[#808080]">Claude-powered agents</p>
                      </div>
                    </div>
                    {llmStatus.anthropic.configured && (
                      <Badge variant="outline" className={`gap-1 ${llmStatus.anthropic.valid ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                        {llmStatus.anthropic.valid ? (
                          <><CheckCircle className="w-3 h-3" /> Connected</>
                        ) : (
                          <><AlertCircle className="w-3 h-3" /> Invalid</>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type={llmKeyVisibility.anthropic ? "text" : "password"}
                        placeholder="sk-ant-..." 
                        className="font-mono pr-10 bg-[#1a1a1a] border-[#333] text-white"
                        value={llmConfig.anthropicKey}
                        onChange={(e) => setLlmConfig({ ...llmConfig, anthropicKey: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-[#333]"
                        onClick={() => setLlmKeyVisibility({ ...llmKeyVisibility, anthropic: !llmKeyVisibility.anthropic })}
                      >
                        {llmKeyVisibility.anthropic ? <EyeOff className="h-4 w-4 text-[#808080]" /> : <Eye className="h-4 w-4 text-[#808080]" />}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={() => testLLMConnection("Anthropic")} className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Test</Button>
                  </div>
                </div>

                {/* Google Gemini */}
                <div className="space-y-3 p-4 border border-[#333] rounded-xl bg-[#222]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <Label className="text-base font-medium text-white">Google Gemini API Key</Label>
                        <p className="text-xs text-[#808080]">Multi-modal analysis</p>
                      </div>
                    </div>
                    {llmStatus.gemini.configured && (
                      <Badge variant="outline" className={`gap-1 ${llmStatus.gemini.valid ? "text-green-400 border-green-500/30 bg-green-500/10" : "text-red-400 border-red-500/30 bg-red-500/10"}`}>
                        {llmStatus.gemini.valid ? (
                          <><CheckCircle className="w-3 h-3" /> Connected</>
                        ) : (
                          <><AlertCircle className="w-3 h-3" /> Invalid</>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        type={llmKeyVisibility.gemini ? "text" : "password"}
                        placeholder="AIza..." 
                        className="font-mono pr-10 bg-[#1a1a1a] border-[#333] text-white"
                        value={llmConfig.geminiKey}
                        onChange={(e) => setLlmConfig({ ...llmConfig, geminiKey: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-[#333]"
                        onClick={() => setLlmKeyVisibility({ ...llmKeyVisibility, gemini: !llmKeyVisibility.gemini })}
                      >
                        {llmKeyVisibility.gemini ? <EyeOff className="h-4 w-4 text-[#808080]" /> : <Eye className="h-4 w-4 text-[#808080]" />}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={() => testLLMConnection("Gemini")} className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Test</Button>
                  </div>
                </div>

                {/* Default Provider Selection */}
                <div className="p-4 border border-[#333] rounded-xl bg-[#222]">
                  <Label className="text-base font-medium text-white">Default AI Provider</Label>
                  <p className="text-sm text-[#808080] mb-3">Select which AI provider to use for agent operations.</p>
                  <div className="flex gap-2">
                    {["openai", "anthropic", "gemini"].map((provider) => (
                      <Button
                        key={provider}
                        variant={llmConfig.defaultProvider === provider ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLlmConfig({ ...llmConfig, defaultProvider: provider })}
                        className={`capitalize ${llmConfig.defaultProvider === provider ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-transparent border-[#333] text-[#808080] hover:text-white"}`}
                      >
                        {provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Claude" : "Gemini"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Button onClick={saveLLMConfig} disabled={isSavingLLM} className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                  {isSavingLLM ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Save AI Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Current Plan</h3>
                <p className="text-[#808080] text-sm">Manage your subscription and billing.</p>
              </div>
              <div className="flex items-center justify-between p-4 border border-violet-500/20 rounded-xl bg-violet-500/5 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
                    <Badge className="bg-violet-500/20 text-violet-400 border-0">Current</Badge>
                  </div>
                  <p className="text-sm text-[#808080] mt-1">
                    Unlimited websites, 10 AI agent runs/day, priority support
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">$49</p>
                  <p className="text-sm text-[#808080]">/month</p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Change Plan</Button>
                <Button variant="outline" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">View Invoices</Button>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Payment Method</h3>
                <p className="text-[#808080] text-sm">Manage your payment information.</p>
              </div>
              <div className="flex items-center justify-between p-4 border border-[#333] rounded-xl bg-[#222]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium text-white">•••• •••• •••• 4242</p>
                    <p className="text-sm text-[#808080]">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]">Update</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
