"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OnboardingTour } from "@/components/dashboard/onboarding-tour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a]">
          {children}
        </main>
      </div>
      {/* Onboarding Tour for New Users */}
      <OnboardingTour />
    </div>
  );
}
