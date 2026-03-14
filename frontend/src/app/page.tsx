"use client";

import { useState, useEffect } from "react";

// Energy Resource Icons as SVG components
const SolarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path
      d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path
      d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M12 22a8 8 0 100-16 8 8 0 000 16z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const InternetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M12 21c4.97-4.97 7-9 7-14-4.97 0-9 2.03-14 7 0 5 2.03 9.03 7 14z"
      fill="currentColor"
    />
    <path
      d="M12 21V12M12 12C9 9 7 7 7 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M18 20V10M12 20V4M6 20v-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path
      d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M3 12h18M3 6h18M3 18h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Energy Resource Card Component
interface EnergyCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  availability: number;
  status: "optimal" | "moderate" | "low";
}

function EnergyCard({
  name,
  description,
  icon,
  color,
  availability,
  status,
}: EnergyCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-xl ${color} text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-black mb-2">{name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Availability</span>
        <span
          className={`text-sm font-semibold ${
            status === "optimal"
              ? "text-ecosync-green"
              : status === "moderate"
              ? "text-yellow-500"
              : "text-red-500"
          }`}
        >
          {availability}%
        </span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            status === "optimal"
              ? "bg-ecosync-green"
              : status === "moderate"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
          style={{ width: `${availability}%` }}
        />
      </div>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="inline-flex p-3 rounded-xl bg-ecosync-green-pale text-ecosync-green mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-black mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  value: string;
  label: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

function StatCard({ value, label, trend, trendValue }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="text-4xl font-bold text-black mb-2">{value}</div>
      <div className="text-gray-600 mb-2">{label}</div>
      {trend && trendValue && (
        <div
          className={`text-sm font-medium ${
            trend === "up"
              ? "text-ecosync-green"
              : trend === "down"
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
        </div>
      )}
    </div>
  );
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Resources", href: "#resources" },
    { name: "Dashboard", href: "#dashboard" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-ecosync-green text-white">
              <LeafIcon />
            </div>
            <span className="text-2xl font-bold text-black">EcoSync</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-ecosync-green font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-gray-700 hover:text-ecosync-green font-medium py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <button className="w-full px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-ecosync-green-pale via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ecosync-green-light/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8 fade-in">
            <span className="w-2 h-2 bg-ecosync-green rounded-full live-indicator" />
            <span className="text-sm font-medium text-gray-700">
              Real-time Renewable Energy Synchronization
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 fade-in-delay-1">
            Synchronize with{" "}
            <span className="text-transparent bg-clip-text energy-gradient">
              Nature&apos;s Rhythm
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 fade-in-delay-2">
            EcoSync intelligently orchestrates your energy consumption to match
            renewable energy availability. Reduce carbon footprint by syncing
            with solar, wind, water, and digital resources.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-delay-3">
            <button className="w-full sm:w-auto px-8 py-4 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Start Saving Carbon Today
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-ecosync-green font-semibold rounded-full border-2 border-ecosync-green hover:bg-ecosync-green-pale transition-all duration-300">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 fade-in-delay-4">
            {[
              { value: "45%", label: "Carbon Reduction" },
              { value: "24/7", label: "Real-time Monitoring" },
              { value: "99.9%", label: "System Uptime" },
              { value: "500+", label: "Enterprise Clients" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-ecosync-green mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: <BoltIcon />,
      title: "Renewable Synchronization",
      description:
        "Track real-time data from solar, wind, and water sources to trigger energy-heavy processes only when green energy is at peak production.",
    },
    {
      icon: <ChartIcon />,
      title: "Predictive Load Balancing",
      description:
        "Use historical weather and demand data to prepare for energy dips, ensuring system stability without relying on dirty grid power.",
    },
    {
      icon: <ShieldIcon />,
      title: "SPAIN Framework",
      description:
        "Built on Stability, Performance, Availability, Integrity, and Novelty principles for enterprise-grade sustainability orchestration.",
    },
    {
      icon: <GlobeIcon />,
      title: "Transparency Dashboard",
      description:
        "Visualize carbon savings and current energy integrity scores in real-time with our intuitive React/Next.js interface.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Why Choose{" "}
            <span className="text-ecosync-green">EcoSync</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Move beyond passive energy saving to active green-syncing. Use
            energy at the right time, when renewable sources are at their peak.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Energy Resources Section
function ResourcesSection() {
  const resources = [
    {
      name: "Solar Energy",
      description:
        "Harness peak solar production during daylight hours. Perfect for scheduling heavy computational tasks and EV charging.",
      icon: <SolarIcon />,
      color: "bg-energy-solar",
      availability: 87,
      status: "optimal" as const,
    },
    {
      name: "Wind Power",
      description:
        "Utilize wind energy during high-velocity periods. Ideal for industrial cooling and data center load management.",
      icon: <WindIcon />,
      color: "bg-energy-wind",
      availability: 72,
      status: "optimal" as const,
    },
    {
      name: "Hydro Energy",
      description:
        "Leverage consistent water flow for baseline power. Excellent for continuous operations and backup systems.",
      icon: <WaterIcon />,
      color: "bg-energy-water",
      availability: 94,
      status: "optimal" as const,
    },
    {
      name: "Digital Resources",
      description:
        "Optimize internet and network infrastructure usage during low-congestion periods for maximum efficiency.",
      icon: <InternetIcon />,
      color: "bg-energy-internet",
      availability: 68,
      status: "moderate" as const,
    },
  ];

  return (
    <section id="resources" className="py-24 bg-ecosync-green-pale/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Renewable Energy{" "}
            <span className="text-ecosync-green">Resources</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time availability of clean energy sources. EcoSync
            intelligently routes your energy demand to match supply.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <EnergyCard key={index} {...resource} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Dashboard Preview Section
function DashboardSection() {
  const [currentLoad, setCurrentLoad] = useState(67);
  const [renewablePercentage, setRenewablePercentage] = useState(82);
  const [carbonSaved, setCarbonSaved] = useState(1247);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoad((prev) => Math.min(100, Math.max(30, prev + (Math.random() * 10 - 5))));
      setRenewablePercentage((prev) => Math.min(100, Math.max(60, prev + (Math.random() * 6 - 3))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Live{" "}
            <span className="text-ecosync-green">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor your energy integrity and carbon savings in real-time.
            Full transparency, full control.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-ecosync-green rounded-full live-indicator" />
              <span className="text-white font-semibold">Live Monitoring</span>
            </div>
            <span className="text-gray-400 text-sm">
              Last updated: Just now
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">Current Load</div>
              <div className="text-4xl font-bold text-white mb-4">
                {currentLoad.toFixed(1)}%
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ecosync-green rounded-full transition-all duration-500"
                  style={{ width: `${currentLoad}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">Renewable Mix</div>
              <div className="text-4xl font-bold text-white mb-4">
                {renewablePercentage.toFixed(1)}%
              </div>
              <div className="flex items-center gap-2 text-ecosync-green">
                <span className="text-sm font-medium">↑ 12% vs last week</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">CO₂ Saved</div>
              <div className="text-4xl font-bold text-white mb-4">
                {carbonSaved.toLocaleString()} kg
              </div>
              <div className="flex items-center gap-2 text-ecosync-green">
                <span className="text-sm font-medium">≈ 56 trees planted</span>
              </div>
            </div>
          </div>

          {/* Energy Mix Visualization */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <div className="text-white font-semibold mb-4">Energy Mix</div>
            <div className="space-y-4">
              {[
                { name: "Solar", value: 35, color: "bg-energy-solar" },
                { name: "Wind", value: 28, color: "bg-energy-wind" },
                { name: "Hydro", value: 24, color: "bg-energy-water" },
                { name: "Grid (Clean)", value: 13, color: "bg-ecosync-green" },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Connect Your Systems",
      description:
        "Integrate EcoSync with your existing infrastructure through our simple API or pre-built connectors for major platforms.",
    },
    {
      number: "02",
      title: "Monitor Energy Sources",
      description:
        "Real-time tracking of solar, wind, water, and grid energy availability with predictive analytics.",
    },
    {
      number: "03",
      title: "Automate Smart Scheduling",
      description:
        "High-energy tasks automatically shift to optimal renewable energy windows without manual intervention.",
    },
    {
      number: "04",
      title: "Track Your Impact",
      description:
        "Transparent dashboards show carbon savings, cost reductions, and environmental impact in real-time.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-ecosync-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How{" "}
            <span className="text-ecosync-green">EcoSync</span>{" "}
            Works
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Four simple steps to transform your energy consumption into a
            force for environmental good.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-ecosync-green/20 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-ecosync-green/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-ecosync-green to-ecosync-green-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Sync with Sustainability?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join hundreds of enterprises reducing their carbon footprint while
          maintaining peak performance. Start your green transformation today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-ecosync-green font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Start Free Trial
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-all duration-300">
            Contact Sales
          </button>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span>Enterprise support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "API", "Documentation"],
    Company: ["About", "Blog", "Careers", "Press"],
    Resources: ["Case Studies", "Whitepapers", "Webinars", "Support"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="bg-ecosync-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-ecosync-green">
                <LeafIcon />
              </div>
              <span className="text-2xl font-bold">EcoSync</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">
              Intelligent sustainability orchestrator for a greener future.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-ecosync-green transition-colors cursor-pointer">
                <GlobeIcon />
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-ecosync-green transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 EcoSync. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-ecosync-green transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-ecosync-green transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Home Component
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <ResourcesSection />
      <DashboardSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
