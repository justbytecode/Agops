"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plug, 
  Key, 
  Rocket,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Github,
  MessageSquare,
  Cloud,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Step = "website" | "integrations" | "ai" | "launch";

interface SetupData {
  websiteUrl: string;
  websiteName: string;
  websiteId?: string;
  verificationToken?: string;
  connectedIntegrations: string[];
  aiProvider: string;
  aiKey: string;
}

const POPULAR_INTEGRATIONS = [
  { id: "github", name: "GitHub", icon: Github, description: "Connect your code repositories" },
  { id: "slack", name: "Slack", icon: MessageSquare, description: "Get alerts in your workspace" },
  { id: "aws", name: "AWS", icon: Cloud, description: "Manage cloud infrastructure" },
];

export default function SetupWizardPage() {
  const [step, setStep] = useState<Step>("website");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SetupData>({
    websiteUrl: "",
    websiteName: "",
    connectedIntegrations: [],
    aiProvider: "openai",
    aiKey: "",
  });

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: "website", label: "Add Website", icon: Globe },
    { id: "integrations", label: "Connect Tools", icon: Plug },
    { id: "ai", label: "Setup AI", icon: Key },
    { id: "launch", label: "Launch", icon: Rocket },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  const addWebsite = async () => {
    if (!data.websiteUrl || !data.websiteName) {
      toast.error("Please enter both website name and URL");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.websiteName, url: data.websiteUrl }),
      });

      const result = await res.json();
      if (res.ok) {
        setData({
          ...data,
          websiteId: result.website.id,
          verificationToken: result.website.verificationToken,
        });
        toast.success("Website added successfully!");
        setStep("integrations");
      } else {
        toast.error(result.error || "Failed to add website");
      }
    } catch (error) {
      toast.error("Failed to add website");
    } finally {
      setIsLoading(false);
    }
  };

  const connectIntegration = async (provider: string) => {
    try {
      const res = await fetch(`/api/integrations/${provider}/connect`);
      const result = await res.json();
      
      if (result.authUrl) {
        window.open(result.authUrl, "_blank", "width=600,height=700");
        toast.info(`Complete ${provider} authorization in the popup window`);
      } else {
        toast.error(result.error || "Failed to start connection");
      }
    } catch (error) {
      toast.error("Failed to connect integration");
    }
  };

  const saveAIConfig = async () => {
    if (!data.aiKey) {
      toast.error("Please enter an API key");
      return;
    }

    setIsLoading(true);
    try {
      const body: any = { defaultProvider: data.aiProvider };
      if (data.aiProvider === "openai") body.openaiKey = data.aiKey;
      if (data.aiProvider === "anthropic") body.anthropicKey = data.aiKey;
      if (data.aiProvider === "gemini") body.geminiKey = data.aiKey;

      const res = await fetch("/api/settings/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("AI configuration saved!");
        setStep("launch");
      } else {
        toast.error("Failed to save configuration");
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const launchAgents = async () => {
    setIsLoading(true);
    try {
      if (data.websiteId) {
        await fetch("/api/agent-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentType: "MONITORING",
            name: "Initial health check",
            trigger: "setup",
            websiteId: data.websiteId,
          }),
        });
      }

      toast.success("🚀 AI Agents are now active and monitoring your infrastructure!");
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      toast.error("Failed to launch agents");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        </div>

      <div className="w-full max-w-3xl z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                Setup AI DevOps
            </h1>
            <p className="text-[#808080]">Configure your Autonomous DevOps Environment in minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isCompleted = i < currentStepIndex;
            
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center ${i > 0 ? "ml-8" : ""}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-2 ring-violet-500/50 ring-offset-2 ring-offset-[#111]" 
                      : isCompleted 
                        ? "bg-[#222] text-green-400 border border-green-500/30" 
                        : "bg-[#1a1a1a] text-[#555] border border-[#333]"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-3 font-medium tracking-wide ${isActive ? "text-white" : "text-[#555]"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-[2px] mx-4 rounded-full ${
                    i < currentStepIndex ? "bg-gradient-to-r from-violet-600 to-indigo-600" : "bg-[#222]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[2rem] p-8 shadow-2xl shadow-black/50"
          >
            {step === "website" && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                    <Globe className="w-8 h-8 text-violet-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Add Your Website</h2>
                  <p className="text-[#808080] mt-2">
                    Enter your website details so our AI agents can start monitoring it 24/7
                  </p>
                </div>
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">Website Name</Label>
                    <Input
                      id="name"
                      placeholder="My Business Website"
                      value={data.websiteName}
                      onChange={(e) => setData({ ...data, websiteName: e.target.value })}
                      className="bg-[#222] border-[#333] text-white h-12 rounded-xl focus:ring-violet-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-white">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={data.websiteUrl}
                      onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                      className="bg-[#222] border-[#333] text-white h-12 rounded-xl focus:ring-violet-500/50"
                    />
                  </div>
                  <Button 
                    onClick={addWebsite} 
                    className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-200 mt-4 text-base font-medium" 
                    disabled={isLoading}
                   >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </>
            )}

            {step === "integrations" && (
                <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    <Plug className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Connect Your Tools</h2>
                  <p className="text-[#808080] mt-2">
                    Connect your DevOps tools so AI agents can take automated actions
                  </p>
                </div>
                <div className="space-y-4 max-w-lg mx-auto">
                  {POPULAR_INTEGRATIONS.map((integration) => {
                    const Icon = integration.icon;
                    const isConnected = data.connectedIntegrations.includes(integration.id);
                    
                    return (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-5 border border-[#333] bg-[#222] rounded-2xl hover:border-violet-500/30 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center border border-[#333] group-hover:bg-[#2a2a2a] transition-colors">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg">{integration.name}</p>
                            <p className="text-sm text-[#808080]">{integration.description}</p>
                          </div>
                        </div>
                        {isConnected ? (
                          <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1">
                            <CheckCircle className="w-3 h-3 mr-1" /> Connected
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => connectIntegration(integration.id)}
                            className="bg-transparent border-[#444] text-white hover:bg-[#333]"
                          >
                            Connect
                            <ExternalLink className="w-3 h-3 ml-2 text-[#808080]" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  
                  <p className="text-sm text-center text-[#666] pt-4">
                    You can connect more tools later from the Integrations page
                  </p>
                  
                  <div className="flex gap-3 mt-8">
                    <Button 
                        variant="outline" 
                        onClick={() => setStep("website")} 
                        className="flex-1 h-12 rounded-xl bg-transparent border-[#333] text-white hover:bg-[#222]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                        onClick={() => setStep("ai")} 
                        className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-gray-200"
                    >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                </div>
                </>
            )}

            {step === "ai" && (
                <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                    <Sparkles className="w-8 h-8 text-violet-300" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Configure AI Brain</h2>
                  <p className="text-[#808080] mt-2">
                    Add your AI API key to power intelligent automation
                  </p>
                </div>
                <div className="space-y-8 max-w-md mx-auto">
                  <div className="space-y-4">
                    <Label className="text-white">Select AI Provider</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "openai", name: "OpenAI", placeholder: "sk-..." },
                        { id: "anthropic", name: "Claude", placeholder: "sk-ant-..." },
                        { id: "gemini", name: "Gemini", placeholder: "AIza..." },
                      ].map((provider) => (
                        <div
                          key={provider.id}
                          onClick={() => setData({ ...data, aiProvider: provider.id, aiKey: "" })}
                          className={`cursor-pointer rounded-xl p-4 text-center border transition-all ${
                            data.aiProvider === provider.id 
                                ? "bg-violet-600/20 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]" 
                                : "bg-[#222] border-[#333] text-[#808080] hover:border-[#555] hover:text-white"
                          }`}
                        >
                          <div className="font-semibold">{provider.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-white">
                      {data.aiProvider === "openai" ? "OpenAI" : data.aiProvider === "anthropic" ? "Anthropic" : "Google"} API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={
                        data.aiProvider === "openai" ? "sk-..." :
                        data.aiProvider === "anthropic" ? "sk-ant-..." : "AIza..."
                      }
                      value={data.aiKey}
                      onChange={(e) => setData({ ...data, aiKey: e.target.value })}
                      className="bg-[#222] border-[#333] text-white h-12 rounded-xl focus:ring-violet-500/50 font-mono"
                    />
                    <div className="flex items-center gap-2 mt-2">
                         <div className="h-1 w-1 bg-green-500 rounded-full"></div>
                        <p className="text-xs text-[#666]">
                        Your API key is encrypted and stored securely
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setStep("integrations")} 
                        className="flex-1 h-12 rounded-xl bg-transparent border-[#333] text-white hover:bg-[#222]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                        onClick={saveAIConfig} 
                        className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-gray-200" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                        <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                   </div>
                </div>
                </>
            )}

            {step === "launch" && (
                <>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <Rocket className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">You're All Set! 🎉</h2>
                  <p className="text-[#808080]">
                    Your AI DevOps team is ready to start working
                  </p>
                </div>
    
                <div className="max-w-md mx-auto space-y-6">
                  <div className="p-6 bg-[#222] rounded-2xl border border-[#333] space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-[#d0d0d0]">Website <strong>{data.websiteName}</strong> added and monitored</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-[#d0d0d0]">AI Provider configured and ready</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-[#d0d0d0]">6 AI Agents standing by</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/20">
                     <div className="flex items-center gap-2 mb-2 text-violet-300 font-medium">
                        <Zap className="w-4 h-4" />
                        <span>What happens next:</span>
                     </div>
                     <ul className="text-sm text-[#a0a0a0] space-y-1 ml-6 list-disc">
                        <li>Monitoring Agent will check your website every 5 minutes</li>
                        <li>Incident Agent will detect and alert you to problems</li>
                        <li>RCA Agent will analyze issues automatically</li>
                        <li>Remediation Agent will suggest fixes</li>
                     </ul>
                  </div>

                  <Button 
                    onClick={launchAgents} 
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-semibold shadow-lg shadow-green-900/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Launching...</>
                    ) : (
                      <>Launch AI Agents <Rocket className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </div>
                </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Skip Link */}
        <div className="text-center mt-8">
          <Link href="/dashboard">
            <Button variant="link" className="text-[#666] hover:text-[#bbb] transition-colors">
              Skip setup, I'll do this later
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
