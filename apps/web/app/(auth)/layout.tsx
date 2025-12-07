import { AuthAnimation } from "@/components/auth/auth-animation";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* Left Side - Form Area */}
      <div className="relative flex items-center justify-center p-8 lg:p-12 overflow-hidden">
        {/* Subtle mobile background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 lg:hidden" />
        
        <div className="relative z-10 w-full max-w-sm space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-foreground w-fit transition-opacity hover:opacity-80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="tracking-tight">AgentOps</span>
          </Link>
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-8">
            <p className="px-8 leading-relaxed">
              By clicking continue, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animation Area */}
      <div className="hidden lg:block bg-[#050505] p-4 lg:p-8 relative overflow-hidden">
        <AuthAnimation />
      </div>
    </div>
  );
}
