import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg" />
                <div className="absolute inset-0.5 bg-slate-900 rounded-md flex items-center justify-center">
                  <span className="font-bold text-white">A</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white">AgentOps</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-md" />
                <div className="absolute inset-0.5 bg-slate-900 rounded flex items-center justify-center">
                  <span className="font-bold text-white text-xs">A</span>
                </div>
              </div>
              <span className="text-slate-400">© 2024 AgentOps. All rights reserved.</span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition">Privacy</Link>
              <Link href="#" className="hover:text-white transition">Terms</Link>
              <Link href="#" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
