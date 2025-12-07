"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Github, Slack, Chrome, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      toast.error("Something went wrong with social login");
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Login successful");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-base">
          Enter your email to sign in to your agent workspace
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading} 
          onClick={() => handleOAuthSignIn("google")}
          className="w-full h-12 relative font-medium border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/40 transition-all duration-300"
        >
          <Chrome className="mr-3 h-5 w-5" />
          Continue with Google
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            type="button" 
            disabled={isLoading} 
            onClick={() => handleOAuthSignIn("github")}
            className="w-full h-12 relative font-medium border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/40 transition-all duration-300"
          >
            <Github className="mr-3 h-5 w-5" />
            GitHub
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            disabled={isLoading} 
            onClick={() => handleOAuthSignIn("slack")}
            className="w-full h-12 relative font-medium border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/40 transition-all duration-300"
          >
            <Slack className="mr-3 h-5 w-5" />
            Slack
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
          <span className="bg-background px-4 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
            className="h-12 border-muted-foreground/20 focus-visible:ring-violet-500/30 transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium text-violet-600 hover:text-violet-500 hover:underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isLoading}
            className="h-12 border-muted-foreground/20 focus-visible:ring-violet-500/30 transition-shadow"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-5 w-5" />
              Sign In with Email
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground font-semibold hover:underline underline-offset-4 decoration-violet-500/50 hover:decoration-violet-500 transition-all">
          Create an account
        </Link>
      </div>
    </div>
  );
}
