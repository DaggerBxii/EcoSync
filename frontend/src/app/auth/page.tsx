"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Sun, Moon, Building2, TrendingUp, DollarSign, Clock, Users, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    role: "",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate authentication - in production, this would call your auth API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Store user session (simplified for demo)
      localStorage.setItem("synclo_user", JSON.stringify({
        email: formData.email,
        name: formData.name || formData.email.split("@")[0],
        company: formData.company || "Demo Company",
        loggedIn: true,
      }));

      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.05]">
          <source src="https://videos.pexels.com/video-files/2882118/2882118-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Synclo</span>
              </Link>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <Link href="/">
                  <button className="px-4 py-2 text-sm font-medium hover:text-green-600 transition-colors">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Login Form */}
              <div className="order-2 lg:order-1">
                <div className="bg-background rounded-3xl p-8 shadow-2xl border">
                  <div className="mb-8">
                    <h1 className="text-3xl font-extrabold mb-2">
                      {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground">
                      {isLogin 
                        ? "Sign in to access your building dashboard" 
                        : "Start optimizing your building's resource usage"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label htmlFor="company" className="block text-sm font-medium mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="Acme Inc."
                          />
                        </div>

                        <div>
                          <label htmlFor="role" className="block text-sm font-medium mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="Facilities Manager"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600" />
                          <span className="text-sm text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-green-600 hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                      <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-green-600 font-medium hover:underline"
                      >
                        {isLogin ? "Sign up" : "Sign in"}
                      </button>
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-center text-muted-foreground mb-4">
                      Or continue with demo access
                    </p>
                    <button
                      onClick={() => {
                        localStorage.setItem("synclo_user", JSON.stringify({
                          email: "demo@synclo.com",
                          name: "Demo User",
                          company: "Synclo Demo",
                          loggedIn: true,
                        }));
                        toast.success("Demo mode activated!");
                        router.push("/dashboard");
                      }}
                      className="w-full py-3 rounded-full border border-green-600 text-green-600 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                    >
                      Try Demo Mode
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Building Model Preview & Value Prop */}
              <div className="order-1 lg:order-2 space-y-6">
                {/* Green Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-700 text-white text-xs font-medium">
                  For commercial properties
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Synchronize operations with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                    real resource windows
                  </span>
                </h2>

                <p className="text-lg text-muted-foreground">
                  Built for commercial properties — facilities, campuses, hospitals, and data centers.
                  Reduce energy costs by up to 40% with AI-powered optimization.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "40%", label: "Avg. Resource Savings", icon: TrendingUp },
                    { value: "500+", label: "Buildings Managed", icon: Building2 },
                    { value: "$2M+", label: "Annual Savings", icon: DollarSign },
                    { value: "99.9%", label: "Uptime SLA", icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="bg-background rounded-2xl p-6 shadow-lg border">
                      <stat.icon className="w-8 h-8 mx-auto mb-3 text-green-600" />
                      <div className="text-3xl font-bold text-green-600 mb-1 text-center">{stat.value}</div>
                      <div className="text-sm text-muted-foreground text-center">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Building Visualization Preview */}
                <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 dark:from-green-900/20 dark:to-blue-900/20 rounded-3xl p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Live Building Overview</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                      Real-time
                    </div>
                  </div>
                  
                  {/* Mini Building Visualization */}
                  <div className="flex flex-col-reverse gap-1 items-center mb-4">
                    {[7, 6, 5, 4, 3, 2, 1].map((floor) => (
                      <div
                        key={floor}
                        className="rounded-lg shadow-md overflow-hidden transition-all hover:scale-105"
                        style={{
                          width: `${200 + (7 - floor) * 12}px`,
                          height: "40px",
                          background: `linear-gradient(90deg, 
                            hsl(${142 + floor * 5}, 76%, ${35 + floor * 3}%) 0%, 
                            hsl(${142 + floor * 3}, 76%, ${40 + floor * 2}%) 100%)`
                        }}
                      >
                        <div className="h-full flex items-center px-3">
                          <span className="text-white font-bold text-sm drop-shadow-lg">{floor}F</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Monitor all floors in real-time
                    </p>
                    <Link href="/buildings">
                      <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                        Explore Buildings
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Trusted by 500+ commercial properties worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
