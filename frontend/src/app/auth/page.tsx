"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Sun, Moon, Building2, TrendingUp, DollarSign, Clock, Users, ArrowRight, Mail, Lock, User, Building } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { authenticateUser, HARDCODED_USERS, USER_PASSWORDS, DEFAULT_CREDENTIALS, type User as AuthUser } from "@/lib/credentials";

export default function AuthPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    role: "facilities_manager",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const user = authenticateUser(formData.email, formData.password);
      
      if (!user) {
        toast.error("Invalid email or password. Try demo@ecosync.com / demo123");
        setIsLoading(false);
        return;
      }

      // Store user session
      localStorage.setItem("synclo_user", JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        permissions: user.permissions,
        defaultBuilding: user.defaultBuilding,
        loggedIn: true,
      }));

      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect to greeting page
      router.push("/greeting");
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // For demo purposes, create a temporary user session
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        role: formData.role as any,
        company: formData.company,
        permissions: ["view", "control"],
        defaultBuilding: "ecosync_tower",
      };

      // Store user session
      localStorage.setItem("synclo_user", JSON.stringify(newUser));

      toast.success(`Account created successfully! Welcome, ${newUser.name}!`);
      
      // Redirect to greeting page
      router.push("/greeting");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = HARDCODED_USERS.find(u => u.email === DEFAULT_CREDENTIALS.email);
    if (demoUser) {
      localStorage.setItem("synclo_user", JSON.stringify({
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        company: demoUser.company,
        permissions: demoUser.permissions,
        defaultBuilding: demoUser.defaultBuilding,
        loggedIn: true,
      }));
      
      toast.success("Demo mode activated!");
      router.push("/greeting");
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
              {/* Left: Auth Form */}
              <div className="order-2 lg:order-1">
                <div className="bg-background rounded-3xl p-8 shadow-2xl border">
                  {/* Tab Switcher */}
                  <div className="flex rounded-2xl bg-muted p-1 mb-8">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        authMode === "login"
                          ? "bg-white dark:bg-gray-800 text-green-600 shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("register")}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        authMode === "register"
                          ? "bg-white dark:bg-gray-800 text-green-600 shadow-md"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Login Form */}
                  {authMode === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">
                          Sign in to access your building dashboard
                        </p>
                      </div>

                      <div>
                        <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            id="login-email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="password"
                            id="login-password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600" />
                          <span className="text-sm text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-green-600 hover:underline">
                          Forgot password?
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Activity className="w-5 h-5 animate-spin" />
                            Signing in...
                          </span>
                        ) : (
                          "Sign In"
                        )}
                      </button>

                      {/* Demo Credentials Box - More Prominent */}
                      <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-5 border-2 border-green-300 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-green-900 dark:text-green-100">Demo Login Credentials</h3>
                            <p className="text-xs text-green-700 dark:text-green-300">Use any of these accounts to explore</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-green-600 text-sm">demo@ecosync.com</div>
                                <div className="text-xs text-muted-foreground">Demo User (Viewer)</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-green-600 text-sm bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">demo123</div>
                                <div className="text-xs text-muted-foreground">Password</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-blue-600 text-sm">admin@ecosync.com</div>
                                <div className="text-xs text-muted-foreground">Administrator</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-blue-600 text-sm bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">admin123</div>
                                <div className="text-xs text-muted-foreground">Password</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-green-200 dark:border-green-800">
                              <div className="font-bold text-purple-600 text-xs">facilities@ecosync.com</div>
                              <div className="font-mono text-purple-600 text-xs bg-purple-100 dark:bg-purple-900/50 px-1 py-0.5 rounded mt-1">facilities123</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-green-200 dark:border-green-800">
                              <div className="font-bold text-orange-600 text-xs">tech@ecosync.com</div>
                              <div className="font-mono text-orange-600 text-xs bg-orange-100 dark:bg-orange-900/50 px-1 py-0.5 rounded mt-1">tech123</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handleDemoLogin}
                          className="w-full py-3 rounded-full border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Quick Demo Mode (No Login Required)
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Registration Form */}
                  {authMode === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="text-center mb-6">
                        <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
                        <p className="text-muted-foreground">
                          Start optimizing your building's resource usage
                        </p>
                      </div>

                      <div>
                        <label htmlFor="register-name" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            id="register-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            id="register-email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="password"
                            id="register-password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            placeholder="••••••••"
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="register-company" className="block text-sm font-medium mb-2">
                            Company
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                              type="text"
                              id="register-company"
                              required
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                              placeholder="Acme Inc."
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="register-role" className="block text-sm font-medium mb-2">
                            Role
                          </label>
                          <select
                            id="register-role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="facilities_manager">Facilities Manager</option>
                            <option value="technician">Technician</option>
                            <option value="administrator">Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                        />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          I agree to the{" "}
                          <a href="#" className="text-green-600 hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-green-600 hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Activity className="w-5 h-5 animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </button>

                      <div className="mt-6 pt-6 border-t">
                        <p className="text-xs text-center text-muted-foreground mb-4">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setAuthMode("login")}
                            className="text-green-600 font-medium hover:underline"
                          >
                            Sign in
                          </button>
                        </p>
                      </div>
                    </form>
                  )}
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
