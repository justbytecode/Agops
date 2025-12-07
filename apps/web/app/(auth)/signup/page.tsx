"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Github, Slack, Chrome, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Something went wrong with social signup");
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const registerRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await registerRes.json();

      if (!registerRes.ok) {
        toast.error(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Auto sign-in
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to AgentOps!");
        router.push("/dashboard");
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
          Create an account
        </h1>
        <p className="text-muted-foreground text-base">
          Start automating your infrastructure today
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
          Sign up with Google
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
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
            className="h-12 border-muted-foreground/20 focus-visible:ring-violet-500/30 transition-shadow"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              className="h-12 border-muted-foreground/20 focus-visible:ring-violet-500/30 transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              className="h-12 border-muted-foreground/20 focus-visible:ring-violet-500/30 transition-shadow"
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
        </div>
        
        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-semibold hover:underline underline-offset-4 decoration-violet-500/50 hover:decoration-violet-500 transition-all">
          Sign in
        </Link>
      </div>
    </div>
  );
}
