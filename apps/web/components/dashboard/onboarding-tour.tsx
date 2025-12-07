"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Plug, 
  Settings, 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: {
    label: string;
    href: string;
  };
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to AgentOps! 🎉",
    description: "Let's set up your AI-powered DevOps platform in just a few minutes. Our setup wizard will guide you through connecting your website and tools.",
    icon: Sparkles,
  },
  {
    id: "setup-wizard",
    title: "Quick Setup Wizard",
    description: "We've made it super easy! Just follow our 4-step wizard to:\n\n• Add your business website\n• Connect your DevOps tools (GitHub, Slack, AWS)\n• Configure AI (OpenAI, Claude, or Gemini)\n• Launch your AI agents",
    icon: Zap,
    action: {
      label: "Start Setup Wizard",
      href: "/setup",
    },
  },
  {
    id: "agents-work",
    title: "AI Agents Do The Work",
    description: "Once configured, our AI agents will automatically:\n\n• Monitor your website 24/7\n• Detect and analyze incidents\n• Perform root cause analysis\n• Suggest and execute fixes",
    icon: Bot,
  },
  {
    id: "complete",
    title: "You're Ready!",
    description: "That's it! Your AI DevOps team will handle the rest. You can always access settings and add more websites or tools from the dashboard.",
    icon: CheckCircle,
  },
];

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    // Check if user has seen the tour
    const tourSeen = localStorage.getItem("agentops-tour-completed");
    if (!tourSeen) {
      setHasSeenTour(false);
      // Delay showing tour for a smoother experience
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem("agentops-tour-completed", "true");
    setIsOpen(false);
    setHasSeenTour(true);
  }, []);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (hasSeenTour && !isOpen) {
    // Show a small "Restart Tour" button
    return (
      <button
        onClick={restartTour}
        className="fixed bottom-4 right-4 z-50 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
        title="Restart Onboarding Tour"
      >
        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={skipTour}
          />

          {/* Tour Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <Card className="w-full max-w-lg pointer-events-auto bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
              {/* Progress Bar */}
              <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <motion.div
                      key={step.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className={cn(
                        "p-3 rounded-xl",
                        step.id === "complete" 
                          ? "bg-green-500/10" 
                          : "bg-violet-500/10"
                      )}
                    >
                      <Icon className={cn(
                        "w-6 h-6",
                        step.id === "complete" ? "text-green-500" : "text-violet-500"
                      )} />
                    </motion.div>
                    <div>
                      <motion.h3
                        key={`title-${step.id}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-bold"
                      >
                        {step.title}
                      </motion.h3>
                      <p className="text-xs text-muted-foreground">
                        Step {currentStep + 1} of {tourSteps.length}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={skipTour} className="rounded-full">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <motion.p
                  key={`desc-${step.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground mb-6 leading-relaxed"
                >
                  {step.description}
                </motion.p>

                {/* Action Button */}
                {step.action && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <Link href={step.action.href} onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2">
                        {step.action.label}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {tourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentStep 
                          ? "w-6 bg-violet-500" 
                          : index < currentStep 
                            ? "bg-violet-500/50" 
                            : "bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <Button variant="ghost" onClick={skipTour} className="text-muted-foreground">
                    Skip Tour
                  </Button>

                  <Button onClick={nextStep} className="gap-2">
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        Get Started
                        <CheckCircle className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
