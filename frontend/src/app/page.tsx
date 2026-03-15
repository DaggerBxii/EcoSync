"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Sun, Moon, Activity, ArrowRight, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const [showDemoButton, setShowDemoButton] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        const sectionTop = featuresSection.offsetTop - 800;
        setShowDemoButton(window.scrollY < sectionTop);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.05]">
          <source src="https://videos.pexels.com/video-files/2882118/2882118-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-background">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Synclo</span>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <a href="#demo" className="text-sm font-medium hover:text-green-600 transition-colors">Demo</a>
                <a href="#solutions" className="text-sm font-medium hover:text-green-600 transition-colors">Solutions</a>
                <a href="#docs" className="text-sm font-medium hover:text-green-600 transition-colors">Docs</a>
                <a href="#contact" className="text-sm font-medium hover:text-green-600 transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-3">
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
                <Link href="/buildings">
                  <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105">
                    Live Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              {/* Green Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-700 text-white text-xs font-medium mb-6">
                For commercial properties
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                Synchronize high-demand operations
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
                  with real resource windows
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Built for commercial properties — facilities, campuses, hospitals, and data centers.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/buildings">
                  <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                    Live Demo
                  </button>
                </Link>
                <a href="#impact">
                  <button className="px-8 py-4 rounded-full border font-medium hover:bg-muted transition-all">
                    Calculate your savings
                  </button>
                </a>
              </div>
            </div>

            {/* Trust Stats */}
            <div className="max-w-4xl mx-auto mb-16">
              <p className="text-center text-sm text-muted-foreground mb-6">Trusted by 500+ commercial properties</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "40%", label: "Avg. Resource Savings", icon: TrendingUp },
                  { value: "500+", label: "Buildings Managed", icon: Building2 },
                  { value: "$2M+", label: "Annual Savings", icon: DollarSign },
                  { value: "99.9%", label: "Uptime SLA", icon: Clock },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                Built for <span className="text-green-600">Commercial Success</span>
              </h2>
              <p className="text-xl text-muted-foreground">Everything you need to manage resources across your building portfolio</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "🏢", title: "Multi-Building Portfolio", description: "Manage resources across all your properties from a single dashboard." },
                { icon: "📊", title: "Real-Time Monitoring", description: "Live HVAC, lighting, electrical, water, and network data from every building." },
                { icon: "🤖", title: "AI Optimization", description: "Machine learning algorithms automatically identify waste and recommend savings." },
                { icon: "📋", title: "Compliance Reporting", description: "Automated LEED, Energy Star, and regulatory compliance reports." },
                { icon: "💰", title: "ROI Tracking", description: "See exactly how much you're saving with detailed cost analysis." },
                { icon: "👥", title: "Tenant Portals", description: "Give tenants visibility into their usage with branded portals." },
              ].map((feature, i) => (
                <div key={i} className="bg-background rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section - Before/After */}
        <section id="impact" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                Impact of <span className="text-green-600">Synclo</span>
              </h2>
              <p className="text-xl text-muted-foreground">See the difference intelligent synchronization makes</p>
            </div>

            <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Before Synclo */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-4">Before Synclo</h3>
                  <div className="relative h-64 bg-muted rounded-2xl overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-muted-foreground/50 transition-all duration-1000" style={{ height: "38%" }} />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="text-4xl font-bold text-muted-foreground">38%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Load-window alignment</p>
                </div>

                {/* After Synclo */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-600 mb-4">After Synclo</h3>
                  <div className="relative h-64 bg-muted rounded-2xl overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" style={{ height: "76%" }} />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="text-4xl font-bold text-green-600">76%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Load-window alignment</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg mb-6">
                  Synclo increased load-window alignment from <span className="font-bold">38%</span> to <span className="font-bold text-green-600">76%</span>
                </p>
                <Link href="/buildings">
                  <button className="px-6 py-3 rounded-full border border-green-600 text-green-600 font-medium hover:bg-green-50 transition-all">
                    See it in action →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-20 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
                Solutions by <span className="text-green-600">Building Type</span>
              </h2>
              <p className="text-xl text-muted-foreground">Tailored resource management for every commercial property type</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { type: "Office Buildings", icon: "🏬", savings: "35-45%" },
                { type: "Data Centers", icon: "💻", savings: "25-35%" },
                { type: "Hospitals", icon: "🏥", savings: "20-30%" },
                { type: "Manufacturing", icon: "🏭", savings: "30-40%" },
              ].map((solution, i) => (
                <div key={i} className="bg-background rounded-2xl p-6 shadow-lg border">
                  <div className="text-4xl mb-4">{solution.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{solution.type}</h3>
                  <div className="text-2xl font-bold text-green-600 mb-4">{solution.savings} Savings</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Section */}
        <section id="contact" className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              Ready to <span className="text-green-600">Get Started?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Register your interest and our team will reach out within 24 hours
            </p>
            <Link href="#register">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                Register Interest
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Synclo</span>
                </div>
                <p className="text-gray-400 text-sm">Synchronize operations with resource windows</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                  <li><a href="#solutions" className="hover:text-white transition-colors">Solutions</a></li>
                  <li><a href="#docs" className="hover:text-white transition-colors">Docs</a></li>
                  <li><a href="/buildings" className="hover:text-white transition-colors">Live Demo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">SLA</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 Synclo. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Floating Demo Button */}
        {showDemoButton && (
          <Link href="/buildings">
            <button className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center gap-3">
              <Activity className="w-6 h-6" />
              Live Demo
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
