"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EcoSyncWebSocket from "./EcoSyncWebSocket";

// Energy Resource Icons
const SolarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="12" r="5" fill="currentColor" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const WindIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WaterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" fill="currentColor" opacity="0.8" />
    <path d="M12 22a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const InternetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2" />
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M8 5v14l11-7z" fill="currentColor" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ZoomInIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EcoSyncLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="25%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="75%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" opacity="0.1" />
    <circle cx="50" cy="50" r="20" fill="url(#logoGradient)" />
    <path d="M50 25 L60 45 L50 42 L40 45 Z" fill="white" opacity="0.9" />
    <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="2" fill="none" />
  </svg>
);

// Jamaica parishes with energy data
const jamaicaParishes = [
  { name: 'Kingston', energy: 92, areas: ['New Kingston', 'Half Way Tree', 'Downtown', 'Kingston 5'] },
  { name: 'St. Andrew', energy: 85, areas: ['Portmore', 'Spanish Town', 'Mandela', 'Linstead'] },
  { name: 'St. Catherine', energy: 78, areas: ['Spanish Town', 'Portmore', 'Old Harbour', 'Bog Walk'] },
  { name: 'Clarendon', energy: 65, areas: ['May Pen', 'Frankfield', 'Chapelton', 'Milk River'] },
  { name: 'Manchester', energy: 58, areas: ['Mandeville', 'Christiana', 'Williamsfield', 'Porus'] },
  { name: 'St. Elizabeth', energy: 52, areas: ['Black River', 'Santa Cruz', 'Lacovia', 'Junction'] },
  { name: 'Westmoreland', energy: 62, areas: ['Negril', 'Savanna-la-Mar', 'Grange Hill', 'Bluefields'] },
  { name: 'Hanover', energy: 48, areas: ['Lucea', 'Hopewell', 'Bethel', 'Green Island'] },
  { name: 'St. James', energy: 75, areas: ['Montego Bay', 'Irons Shore', 'Cambridge', 'Reading'] },
  { name: 'Trelawny', energy: 50, areas: ['Falmouth', 'Martha Brae', 'Clark\'s Town', 'Duncans'] },
  { name: 'St. Ann', energy: 58, areas: ['Ocho Rios', 'St. Ann\'s Bay', 'Runaway Bay', 'Discovery Bay'] },
  { name: 'St. Mary', energy: 45, areas: ['Port Maria', 'Oracabessa', 'Island Head', 'Boscobel'] },
  { name: 'Portland', energy: 40, areas: ['Port Antonio', 'Buff Bay', 'Long Bay', 'Boston'] },
  { name: 'St. Thomas', energy: 42, areas: ['Morant Bay', 'Bath', 'Yallahs', 'Seaforth'] },
];

export default function HomePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [showMapButton, setShowMapButton] = useState(false);

  // Navigation handler
  const onNavigate = useCallback((page: string) => {
    router.push(`/${page}`);
  }, [router]);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setIsLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Scroll handler for floating map button
  useEffect(() => {
    const handleScroll = () => {
      const dashboardSection = document.getElementById('dashboard');
      if (dashboardSection) {
        const sectionTop = dashboardSection.offsetTop - 800;
        setShowMapButton(window.scrollY < sectionTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const getHeatColor = (energy: number) => {
    if (energy >= 80) return '#ef4444';
    if (energy >= 60) return '#f97316';
    if (energy >= 40) return '#facc15';
    return '#22c55e';
  };

  const getHeatGradient = (energy: number) => {
    if (energy >= 80) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(239, 68, 68, 0.6))';
    if (energy >= 60) return 'linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(249, 115, 22, 0.6))';
    if (energy >= 40) return 'linear-gradient(135deg, rgba(250, 204, 21, 0.9), rgba(250, 204, 21, 0.6))';
    return 'linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(34, 197, 94, 0.6))';
  };

  const selectedParishData = jamaicaParishes.find(p => p.name === selectedParish);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Video */}
      <div className="bg-video">
        <video autoPlay loop muted playsInline>
          <source src="https://videos.pexels.com/video-files/2882118/2882118-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/1526904/1526904-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen bg-white dark:bg-black transition-colors duration-300">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 fade-in-down">
                <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.5 2 5 4.5 5 8c0 2.5 1.5 4.5 3.5 5.5C8 15 7 17 7 19c0 2.5 2.5 3 5 3s5-.5 5-3c0-2-1-4-1.5-5.5C17.5 12.5 19 10.5 19 8c0-3.5-3.5-6-7-6zm0 2c2.5 0 5 1.5 5 4 0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-3-3.5-3s-3 1.5-3.5 3C7.5 10.5 7 9.5 7 8c0-2.5 2.5-4 5-4z"/>
                    <ellipse cx="12" cy="18" rx="4" ry="2" opacity="0.6"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">EcoSync</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1 fade-in-down stagger-1">
                {['Features', 'Dashboard', 'Resources', 'About'].map((item) => (
                  <button
                    key={item}
                    onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-all hover-lift"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 fade-in-down stagger-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all hover:scale-110"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                
                <Link
                  href="/auth"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 fade-in-delay-1">
            Synchronize with<br />
            <span className="text-ecosync-green">Nature&apos;s</span>{" "}
            <span className="text-ecosync-blue">Rhythm</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 fade-in-delay-2">
            EcoSync intelligently orchestrates your energy consumption to match renewable energy availability. 
            Reduce energy waste by syncing with solar, wind, water, and digital resources.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in-delay-3">
            <button onClick={() => onNavigate("auth")} className="w-full sm:w-auto px-8 py-4 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 btn-primary flex items-center justify-center gap-2">
              Start Saving Energy Today <ArrowRightIcon />
            </button>
            <button onClick={() => scrollToSection("features")} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-ecosync-green font-semibold rounded-full border-2 border-ecosync-green hover:bg-ecosync-green-pale transition-all duration-300 flex items-center justify-center gap-2">
              <PlayIcon /> Watch Demo
            </button>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 fade-in-delay-4">
            {[
              { value: "45%", label: "Energy Waste Reduction" },
              { value: "24/7", label: "Real-time Monitoring" },
              { value: "99.9%", label: "System Uptime" },
              { value: "500+", label: "Enterprise Clients" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-ecosync-green mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

        <FeaturesSection />
        <DashboardSection />
      </div>
    </div>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    { icon: <BoltIcon />, title: "Renewable Synchronization", description: "Track real-time data from solar, wind, and water sources to trigger energy-heavy processes only when green energy is at peak production.", color: "bg-ecosync-amber text-white" },
    { icon: <ChartIcon />, title: "Predictive Load Balancing", description: "Use historical weather and demand data to prepare for energy dips, ensuring system stability without relying on dirty grid power.", color: "bg-ecosync-blue text-white" },
    { icon: <ShieldIcon />, title: "SPAIN Framework", description: "Built on Stability, Performance, Availability, Integrity, and Novelty principles for enterprise-grade sustainability orchestration.", color: "bg-ecosync-purple text-white" },
    { icon: <GlobeIcon />, title: "Transparency Dashboard", description: "Visualize energy savings and current energy integrity scores in real-time with our intuitive React/Next.js interface.", color: "bg-ecosync-cyan text-white" },
  ];

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-ecosync-green-pale/50 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ecosync-blue-pale/50 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">Why Choose <span className="text-ecosync-green">EcoSync</span>?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Move beyond passive energy saving to active green-syncing. Use energy at the right time, when renewable sources are at their peak.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (<FeatureCard key={index} {...feature} />))}
        </div>
      </div>
    </section>
  );
}

// Dashboard Section
function DashboardSection() {
  const [currentLoad, setCurrentLoad] = useState(67);
  const [renewablePercentage, setRenewablePercentage] = useState(82);
  const [energySaved, setEnergySaved] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoad((prev) => Math.min(100, Math.max(30, prev + (Math.random() * 10 - 5))));
      setRenewablePercentage((prev) => Math.min(100, Math.max(60, prev + (Math.random() * 6 - 3))));
      setEnergySaved((prev) => prev + Math.random() * 0.1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="dashboard" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ecosync-amber-pale/30 via-transparent to-ecosync-cyan-pale/30 dark:from-gray-800/30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">Live <span className="text-ecosync-green">Dashboard</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Monitor your energy integrity and efficiency gains in real-time. Full transparency, full control.</p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden glow-effect">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-ecosync-green rounded-full live-indicator" />
              <span className="text-white font-semibold">Live Monitoring</span>
            </div>
            <span className="text-gray-400 text-sm">Last updated: Just now</span>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">Current Load</div>
              <div className="text-4xl font-bold text-white mb-4">{currentLoad.toFixed(1)}%</div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-ecosync-green rounded-full transition-all duration-500" style={{ width: `${currentLoad}%` }} />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">Renewable Mix</div>
              <div className="text-4xl font-bold text-white mb-4">{renewablePercentage.toFixed(1)}%</div>
              <div className="flex items-center gap-2 text-ecosync-green"><span className="text-sm font-medium">↑ 12% vs last week</span></div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-gray-400 text-sm mb-2">Energy Saved</div>
              <div className="text-4xl font-bold text-white mb-4">{energySaved.toFixed(0)} kWh</div>
              <div className="flex items-center gap-2 text-ecosync-green"><span className="text-sm font-medium">≈ 56 trees planted</span></div>
            </div>
          </div>
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
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Live EcoSync Data from Backend */}
          <div className="mt-8">
            <EcoSyncWebSocket />
          </div>
        </div>
      </div>
    </section>
  );
}
                          style={{ 
                            background: getHeatGradient(areaEnergy),
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          <div className="text-white text-left">
                            <div className="font-semibold">{area}</div>
                            <div className="text-2xl font-bold">{areaEnergy}%</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedArea && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 fade-in-up">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedArea} - Street Level</h4>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((street) => {
                          const streetEnergy = Math.floor(40 + Math.random() * 50);
                          return (
                            <div key={street} className="flex items-center gap-4 fade-in-right">
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-20">Street {street}</span>
                              <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all shimmer" style={{ width: `${streetEnergy}%`, background: getHeatColor(streetEnergy) }} />
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">{streetEnergy}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm fade-in-up">
              <div className="flex items-center gap-2 hover-lift">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(25) }} />
                <span className="text-gray-600 dark:text-gray-400">Low Usage</span>
              </div>
              <div className="flex items-center gap-2 hover-lift">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(50) }} />
                <span className="text-gray-600 dark:text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-2 hover-lift">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(85) }} />
                <span className="text-gray-600 dark:text-gray-400">High Usage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Why Choose <span className="text-green-600">EcoSync</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '📊', title: 'Real-Time Tracking', description: 'Monitor your energy usage as it happens with live data' },
                { icon: '🤖', title: 'AI Recommendations', description: 'Get personalized tips to reduce waste and save money' },
                { icon: '💰', title: 'Cost Savings', description: 'Track your bills and discover ways to cut costs' },
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg card-hover border border-gray-200 dark:border-gray-800 gradient-border fade-in-up">
                  <div className="text-4xl mb-4 float">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="py-20 px-4 bg-green-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Learning <span className="text-green-600">Resources</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Energy Saving Guide', desc: 'Comprehensive tips for every room', icon: '📖' },
                { title: 'Renewable Options', desc: 'Solar, wind, and more for your home', icon: '☀️' },
                { title: 'Rebate Programs', desc: 'Find incentives in your area', icon: '💵' },
              ].map((resource, i) => (
                <a key={i} href="#" className="bg-white dark:bg-black rounded-2xl overflow-hidden shadow-lg card-hover border border-gray-200 dark:border-gray-800 group fade-in-up">
                  <div className="h-48 bg-green-50 dark:bg-gray-900 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform bounce-slow">{resource.icon}</div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{resource.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="fade-in-left">
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                  Our <span className="text-green-600">Mission</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  EcoSync empowers communities to reduce energy waste through data-driven insights and actionable recommendations.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Together, we can build a more sustainable future by making informed decisions about our energy consumption.
                </p>
              </div>
              <div className="bg-white dark:bg-black rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 text-center fade-in-right">
                <div className="text-6xl mb-4 float">🌍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">One Planet. One Future.</h3>
                <p className="text-gray-600 dark:text-gray-400">Join the conservation movement today</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-green-600 animated-gradient">
          <div className="max-w-4xl mx-auto text-center fade-in-up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your energy conservation journey today
            </p>
            <Link href="/auth/register" className="inline-block px-8 py-4 bg-white text-green-600 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all">
              Get Started Free →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.5 2 5 4.5 5 8c0 2.5 1.5 4.5 3.5 5.5C8 15 7 17 7 19c0 2.5 2.5 3 5 3s5-.5 5-3c0-2-1-4-1.5-5.5C17.5 12.5 19 10.5 19 8c0-3.5-3.5-6-7-6zm0 2c2.5 0 5 1.5 5 4 0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-3-3.5-3s-3 1.5-3.5 3C7.5 10.5 7 9.5 7 8c0-2.5 2.5-4 5-4z"/>
                      <ellipse cx="12" cy="18" rx="4" ry="2" opacity="0.6"/>
                    </svg>
                  </div>
                  <span className="text-xl font-bold">EcoSync</span>
                </div>
                <p className="text-gray-400 text-sm">Empowering sustainable energy choices</p>
              </div>
              <div className="fade-in-up stagger-1">
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="#resources" className="hover:text-white transition-colors">Resources</Link></li>
                </ul>
              </div>
              <div className="fade-in-up stagger-2">
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div className="fade-in-up stagger-3">
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 EcoSync Jamaica. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Floating Map Button */}
        {showMapButton && (
          <a
            href="#dashboard"
            className="fixed bottom-8 right-8 z-[9999] px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center gap-3 animate-bounce-slow"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            View Energy Map
          </a>
        )}
      </div>
    </div>
  );
}
