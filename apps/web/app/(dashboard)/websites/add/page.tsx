"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  CheckCircle, 
  Copy,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type Step = "details" | "verify" | "complete";

interface WebsiteData {
  id?: string;
  name: string;
  url: string;
  domain?: string;
  verificationToken?: string;
}

export default function AddWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [isLoading, setIsLoading] = useState(false);
  const [website, setWebsite] = useState<WebsiteData>({
    name: "",
    url: "",
  });

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: website.name,
          url: website.url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add website");
        setIsLoading(false);
        return;
      }

      setWebsite({
        ...website,
        id: data.website.id,
        domain: data.website.domain,
        verificationToken: data.website.verificationToken,
      });
      setStep("verify");
    } catch (error) {
      toast.error("Failed to add website");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleVerify = async () => {
    setIsLoading(true);
    
    // Simulate verification check - in production this would verify DNS/meta tag
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, mark as verified
    try {
      await fetch(`/api/websites/${website.id}/verify`, {
        method: "POST",
      });
      setStep("complete");
      toast.success("Website verified successfully!");
    } catch (error) {
      toast.error("Verification failed. Please check your DNS settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const skipVerification = () => {
    setStep("complete");
    toast.info("You can verify your website later from the settings.");
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-[#d0d0d0]">
      <div className="flex items-center gap-4">
        <Link href="/websites">
          <Button variant="ghost" size="icon" className="hover:bg-[#333] text-[#808080]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Add Website</h2>
          <p className="text-[#808080]">
            Connect your website for AI-powered monitoring and management
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 py-8">
        {["details", "verify", "complete"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === s ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : 
              ["details", "verify", "complete"].indexOf(step) > i ? "bg-green-500 text-white" : 
              "bg-[#222] text-[#666] border border-[#333]"
            }`}>
              {["details", "verify", "complete"].indexOf(step) > i ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && <div className={`w-20 h-0.5 mx-2 ${
              ["details", "verify", "complete"].indexOf(step) > i ? "bg-green-500" : "bg-[#222]"
            }`} />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        {step === "details" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                <Globe className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Website Details</h3>
              <p className="text-[#808080] text-sm">Enter your website information to get started</p>
            </div>
            <form onSubmit={handleSubmitDetails}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Website Name</Label>
                  <Input
                    id="name"
                    placeholder="My Company Website"
                    value={website.name}
                    onChange={(e) => setWebsite({ ...website, name: e.target.value })}
                    required
                    className="bg-[#222] border-[#333] text-white h-12 rounded-xl focus:ring-violet-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={website.url}
                    onChange={(e) => setWebsite({ ...website, url: e.target.value })}
                    required
                    className="bg-[#222] border-[#333] text-white h-12 rounded-xl focus:ring-violet-500/50"
                  />
                  <p className="text-xs text-[#666]">
                    Enter the full URL including https://
                  </p>
                </div>
              </div>
              <div className="pt-8">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-200 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === "verify" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 shadow-xl">
             <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Verify Ownership</h3>
              <p className="text-[#808080] text-sm">Verify that you own {website.domain} by adding a DNS record</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-[#222] border border-[#333] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">DNS TXT Record</p>
                    <p className="text-xs text-[#808080]">
                      Add this TXT record to your DNS settings
                    </p>
                  </div>
                  <Badge className="bg-violet-500/20 text-violet-400 border-0">Recommended</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-[#111] border border-[#333] rounded-xl text-sm text-[#d0d0d0] font-mono">
                      _agentops-verify.{website.domain}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(`_agentops-verify.${website.domain}`)}
                      className="bg-[#2a2a2a] border-[#333] hover:bg-[#333] text-white h-11 w-11 rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-[#111] border border-[#333] rounded-xl text-sm font-mono text-xs break-all text-[#d0d0d0]">
                      {website.verificationToken}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(website.verificationToken || "")}
                      className="bg-[#2a2a2a] border-[#333] hover:bg-[#333] text-white h-11 w-11 rounded-xl"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-400/80">
                  DNS changes can take up to 48 hours to propagate. You can skip this step and verify later.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-8">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-xl bg-transparent border-[#333] text-white hover:bg-[#222]" 
                onClick={skipVerification}
              >
                Skip for Now
              </Button>
              <Button 
                className="flex-1 h-12 rounded-xl bg-white text-black hover:bg-gray-200" 
                onClick={handleVerify} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Ownership"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 shadow-xl text-center">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Website Added Successfully!</h3>
            <p className="text-[#808080] mb-8">
                {website.name} is now connected to AgentOps
            </p>
            
            <div className="p-6 bg-[#222] border border-[#333] rounded-2xl text-left space-y-3 mb-8">
                <p className="text-sm font-medium text-white">What happens next:</p>
                <ul className="text-sm text-[#808080] space-y-2 ml-1">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> AI agents will start monitoring your website health</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> You'll receive alerts for any detected issues</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-violet-500"/> Connect your DevOps tools for automated remediation</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <Link href="/websites" className="flex-1">
                <Button variant="outline" className="w-full h-12 rounded-xl bg-transparent border-[#333] text-white hover:bg-[#222]">
                    View All Websites
                </Button>
                </Link>
                <Link href="/integrations" className="flex-1">
                <Button className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-200">
                    Connect DevOps Tools
                </Button>
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
