"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, TrendingUp, Zap, Thermometer, Droplets, Lightbulb, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function GreetingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("User");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Get user data from localStorage
    const storedUser = localStorage.getItem("synclo_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
    }
    
    // Start the greeting sequence
    const timers = [
      setTimeout(() => setStep(1), 500),      // Show welcome
      setTimeout(() => setStep(2), 2500),     // Show analytics prompt
      setTimeout(() => setStep(3), 4500),     // Show metrics preview
      setTimeout(() => setStep(4), 7000),     // Show benefits
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [router]);

  const handleViewAnalytics = () => {
    router.push("/buildings/office");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-pulse text-green-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Synclo</span>
            </Link>
            
            <button
              onClick={() => router.push("/buildings")}
              className="text-sm text-muted-foreground hover:text-green-600 transition-colors"
            >
              Skip to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div
            className={`transition-all duration-1000 ${
              step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Welcome to Synclo
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  {userName}
                </span>
                !
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Your building management dashboard is ready
              </p>
            </div>
          </div>

          {/* Analytics Prompt */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-background rounded-3xl p-8 shadow-2xl border-2 border-green-200 dark:border-green-800 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">
                  Would you like to see today's analytics?
                </h2>
                <p className="text-muted-foreground">
                  Get real-time insights into your building's performance
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleViewAnalytics}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 text-lg"
                >
                  <TrendingUp className="w-6 h-6" />
                  Yes, Show Analytics
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => router.push("/buildings")}
                  className="px-8 py-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-full transition-all border-2 border-border"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Preview */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: Zap,
                  label: "Electricity",
                  value: "1,247 kW",
                  change: "-12%",
                  color: "text-yellow-600",
                  bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                },
                {
                  icon: Thermometer,
                  label: "HVAC",
                  value: "22.5°C",
                  change: "-8%",
                  color: "text-red-600",
                  bgColor: "bg-red-100 dark:bg-red-900/30",
                },
                {
                  icon: Droplets,
                  label: "Water",
                  value: "342 L/min",
                  change: "-15%",
                  color: "text-blue-600",
                  bgColor: "bg-blue-100 dark:bg-blue-900/30",
                },
                {
                  icon: Lightbulb,
                  label: "Lighting",
                  value: "68%",
                  change: "-22%",
                  color: "text-green-600",
                  bgColor: "bg-green-100 dark:bg-green-900/30",
                },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="bg-background rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center mb-4`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
                  <div className="text-2xl font-bold mb-2">{metric.value}</div>
                  <div className="text-sm text-green-600 font-medium">{metric.change} vs yesterday</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl p-8 border-2 border-green-300 dark:border-green-700">
              <h3 className="text-2xl font-bold mb-6 text-center">
                What you'll see in the analytics dashboard
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: TrendingUp,
                    title: "Resource Usage",
                    description: "Real-time monitoring of electricity, water, HVAC, and lighting across all floors",
                  },
                  {
                    icon: Activity,
                    title: "3D Building Model",
                    description: "Interactive visualization with color-coded floors showing resource consumption",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Smart Alerts",
                    description: "AI-powered anomaly detection with automated remediation suggestions",
                  },
                ].map((benefit, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleViewAnalytics}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  View Full Analytics Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-12 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  step >= i ? "w-8 bg-green-600" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
