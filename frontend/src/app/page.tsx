"use client";

import { useState, useEffect, useCallback } from "react";

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

// Jamaica Parishes Data with neighborhoods and streets
const jamaicaParishes = [
  { 
    id: "kingston", 
    name: "Kingston", 
    energyUsage: 95, 
    color: "#ef4444",
    path: "M 520,180 L 540,175 L 550,185 L 545,200 L 525,195 Z",
    cx: 535, cy: 188,
    neighborhoods: [
      { name: "Downtown", energyUsage: 98, streets: ["Kingston St", "Port Royal St", "Harbour St"] },
      { name: "New Kingston", energyUsage: 92, streets: ["Knutsford Blvd", "Hope Rd", "Oxford Rd"] },
      { name: "Half Way Tree", energyUsage: 90, streets: ["Constant Spring Rd", "Old Hope Rd"] },
      { name: "Barbican", energyUsage: 88, streets: ["Barbican Rd", "Weston Rd"] },
    ]
  },
  { 
    id: "st-andrew", 
    name: "St. Andrew", 
    energyUsage: 88, 
    color: "#f97316",
    path: "M 540,175 L 570,165 L 590,175 L 580,195 L 550,185 Z",
    cx: 570, cy: 178,
    neighborhoods: [
      { name: "Hope Gardens", energyUsage: 85, streets: ["Hope Rd", "Lady Musgrave Rd"] },
      { name: "Beverly Hills", energyUsage: 82, streets: ["Beverly Dr", "Elm Tree Dr"] },
      { name: "Mona", energyUsage: 90, streets: ["Mona Rd", "University Way"] },
      { name: "Portmore", energyUsage: 86, streets: ["Portmore Pkwy", "Waterford"] },
    ]
  },
  { 
    id: "st-catherine", 
    name: "St. Catherine", 
    energyUsage: 75, 
    color: "#eab308",
    path: "M 480,185 L 520,180 L 525,195 L 515,215 L 485,210 Z",
    cx: 505, cy: 198,
    neighborhoods: [
      { name: "Spanish Town", energyUsage: 78, streets: ["Spanish Town Rd", "King St"] },
      { name: "Portmore", energyUsage: 80, streets: ["Mandela Hwy", "Portmore Pkwy"] },
      { name: "Old Harbour", energyUsage: 65, streets: ["Old Harbour Rd", "Bridge Rd"] },
      { name: "Linstead", energyUsage: 68, streets: ["Main St", "Market St"] },
    ]
  },
  { 
    id: "clarendon", 
    name: "Clarendon", 
    energyUsage: 62, 
    color: "#84cc16",
    path: "M 450,195 L 485,210 L 475,230 L 445,225 Z",
    cx: 465, cy: 215,
    neighborhoods: [
      { name: "May Pen", energyUsage: 68, streets: ["May Pen Rd", "Circular Rd"] },
      { name: "Chapelton", energyUsage: 58, streets: ["Chapelton Main Rd"] },
      { name: "Frankfield", energyUsage: 55, streets: ["Frankfield Rd"] },
      { name: "Kellits", energyUsage: 52, streets: ["Kellits Main Rd"] },
    ]
  },
  { 
    id: "manchester", 
    name: "Manchester", 
    energyUsage: 58, 
    color: "#22c55e",
    path: "M 420,205 L 450,195 L 445,225 L 415,220 Z",
    cx: 435, cy: 212,
    neighborhoods: [
      { name: "Mandeville", energyUsage: 65, streets: ["Mandeville Main St", "Manchester Rd"] },
      { name: "Christiana", energyUsage: 52, streets: ["Christiana Rd"] },
      { name: "Balaclava", energyUsage: 48, streets: ["Balaclava Main Rd"] },
      { name: "Williamsfield", energyUsage: 45, streets: ["Williamsfield Rd"] },
    ]
  },
  { 
    id: "st-elizabeth", 
    name: "St. Elizabeth", 
    energyUsage: 45, 
    color: "#10b981",
    path: "M 350,200 L 420,205 L 415,220 L 345,215 Z",
    cx: 385, cy: 210,
    neighborhoods: [
      { name: "Black River", energyUsage: 48, streets: ["Black River Main St"] },
      { name: "Santa Cruz", energyUsage: 42, streets: ["Santa Cruz Main Rd"] },
      { name: "Lacovia", energyUsage: 40, streets: ["Lacovia Main Rd"] },
      { name: "Magotty", energyUsage: 38, streets: ["Magotty Main Rd"] },
    ]
  },
  { 
    id: "westmoreland", 
    name: "Westmoreland", 
    energyUsage: 52, 
    color: "#14b8a6",
    path: "M 290,195 L 350,200 L 345,215 L 285,210 Z",
    cx: 320, cy: 205,
    neighborhoods: [
      { name: "Negril", energyUsage: 60, streets: ["Negril Rd", "West End Rd"] },
      { name: "Savanna-la-Mar", energyUsage: 55, streets: ["Main St", "Market St"] },
      { name: "Bluefields", energyUsage: 42, streets: ["Bluefields Bay Rd"] },
      { name: "Grange Hill", energyUsage: 45, streets: ["Grange Hill Main Rd"] },
    ]
  },
  { 
    id: "hanover", 
    name: "Hanover", 
    energyUsage: 38, 
    color: "#06b6d4",
    path: "M 260,185 L 290,195 L 285,210 L 255,200 Z",
    cx: 275, cy: 198,
    neighborhoods: [
      { name: "Lucea", energyUsage: 42, streets: ["Lucea Main St", "Market St"] },
      { name: "Green Island", energyUsage: 38, streets: ["Green Island Main Rd"] },
      { name: "Shettlewood", energyUsage: 32, streets: ["Shettlewood Rd"] },
      { name: "Bethel", energyUsage: 30, streets: ["Bethel Main Rd"] },
    ]
  },
  { 
    id: "st-james", 
    name: "St. James", 
    energyUsage: 72, 
    color: "#0ea5e9",
    path: "M 300,165 L 360,160 L 370,180 L 310,185 Z",
    cx: 335, cy: 172,
    neighborhoods: [
      { name: "Montego Bay", energyUsage: 80, streets: ["Gloucester Ave", "Howard Blvd"] },
      { name: "Ironshore", energyUsage: 75, streets: ["Ironshore Dr"] },
      { name: "Rose Hall", energyUsage: 70, streets: ["Rose Hall Main Rd"] },
      { name: "Cambridge", energyUsage: 58, streets: ["Cambridge Main Rd"] },
    ]
  },
  { 
    id: "trelawny", 
    name: "Trelawny", 
    energyUsage: 42, 
    color: "#3b82f6",
    path: "M 360,160 L 420,155 L 430,175 L 370,180 Z",
    cx: 395, cy: 168,
    neighborhoods: [
      { name: "Falmouth", energyUsage: 48, streets: ["Falmouth Main St", "Market St"] },
      { name: "Martha Brae", energyUsage: 40, streets: ["Martha Brae Rd"] },
      { name: "Clark's Town", energyUsage: 38, streets: ["Clark's Town Main Rd"] },
      { name: "Albert Town", energyUsage: 35, streets: ["Albert Town Main Rd"] },
    ]
  },
  { 
    id: "st-ann", 
    name: "St. Ann", 
    energyUsage: 55, 
    color: "#6366f1",
    path: "M 420,155 L 500,150 L 510,170 L 430,175 Z",
    cx: 465, cy: 162,
    neighborhoods: [
      { name: "Ocho Rios", energyUsage: 65, streets: ["Main St", "Ocean Blvd"] },
      { name: "St. Ann's Bay", energyUsage: 52, streets: ["St. Ann's Bay Main Rd"] },
      { name: "Runaway Bay", energyUsage: 50, streets: ["Runaway Bay Main Rd"] },
      { name: "Priory", energyUsage: 45, streets: ["Priory Main Rd"] },
    ]
  },
  { 
    id: "st-mary", 
    name: "St. Mary", 
    energyUsage: 35, 
    color: "#8b5cf6",
    path: "M 500,150 L 570,145 L 580,165 L 510,170 Z",
    cx: 540, cy: 158,
    neighborhoods: [
      { name: "Port Maria", energyUsage: 40, streets: ["Port Maria Main St"] },
      { name: "Oracabessa", energyUsage: 35, streets: ["Oracabessa Bay Rd"] },
      { name: "Island Gully", energyUsage: 30, streets: ["Island Gully Main Rd"] },
      { name: "Annotto Bay", energyUsage: 32, streets: ["Annotto Bay Main Rd"] },
    ]
  },
  { 
    id: "portland", 
    name: "Portland", 
    energyUsage: 28, 
    color: "#a855f7",
    path: "M 570,145 L 630,145 L 640,165 L 580,165 Z",
    cx: 605, cy: 155,
    neighborhoods: [
      { name: "Port Antonio", energyUsage: 35, streets: ["West St", "East St"] },
      { name: "Buff Bay", energyUsage: 28, streets: ["Buff Bay Main Rd"] },
      { name: "Long Bay", energyUsage: 25, streets: ["Long Bay Beach Rd"] },
      { name: "Moore Town", energyUsage: 22, streets: ["Moore Town Main Rd"] },
    ]
  },
];

// Heatmap intensity color
const getHeatmapColor = (intensity: number) => {
  if (intensity >= 80) return "#ef4444";
  if (intensity >= 60) return "#f97316";
  if (intensity >= 40) return "#eab308";
  if (intensity >= 20) return "#84cc16";
  return "#22c55e";
};

// Energy Resource Card Component
function EnergyCard({ name, description, icon, color, availability, status }: { name: string; description: string; icon: React.ReactNode; color: string; availability: number; status: "optimal" | "moderate" | "low" }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-xl ${color} text-white mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{name}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">Availability</span>
        <span className={`text-sm font-semibold ${status === "optimal" ? "text-ecosync-green" : status === "moderate" ? "text-yellow-500" : "text-red-500"}`}>{availability}%</span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${status === "optimal" ? "bg-ecosync-green" : status === "moderate" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${availability}%` }} />
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>{icon}</div>
      <h3 className="text-xl font-semibold text-black dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}

// Navigation Component
function Navigation({ onNavigate, isDarkMode, onToggleDarkMode }: { onNavigate: (page: "home" | "auth") => void; isDarkMode: boolean; onToggleDarkMode: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { name: "Features", href: "features" },
    { name: "Dashboard", href: "dashboard" },
    { name: "Resources", href: "resources" },
    { name: "About", href: "about" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <EcoSyncLogo />
            <span className="text-2xl font-bold text-black dark:text-white">EcoSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => scrollToSection(link.href)} className="text-gray-700 dark:text-gray-300 hover:text-ecosync-green font-medium transition-colors">{link.name}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onToggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300" aria-label="Toggle dark mode">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => onNavigate("auth")} className="px-6 py-3 text-ecosync-green font-semibold hover:bg-ecosync-green-pale rounded-full transition-all duration-300">Sign In</button>
            <button onClick={() => onNavigate("auth")} className="px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300 shadow-lg hover:shadow-xl btn-primary">Get Started</button>
          </div>
          <button className="md:hidden p-2 text-gray-700 dark:text-gray-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <button key={link.name} onClick={() => scrollToSection(link.href)} className="block text-gray-700 dark:text-gray-300 hover:text-ecosync-green font-medium py-2 transition-colors w-full text-left">{link.name}</button>
            ))}
            <button onClick={() => onToggleDarkMode()} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button onClick={() => onNavigate("auth")} className="w-full px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300">Get Started</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Hero Section
function HeroSection({ onNavigate }: { onNavigate: (page: "home" | "auth") => void }) {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-ecosync-green-pale/90 via-white/85 to-ecosync-blue-pale/90 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-800/90" />
      </div>
      <div className="absolute inset-0 overflow-hidden z-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-ecosync-green-light/30 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-ecosync-blue-light/30 rounded-full blur-3xl float-animation-delayed" />
      </div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md mb-8 fade-in">
            <span className="w-2 h-2 bg-ecosync-green rounded-full live-indicator" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Renewable Energy Synchronization</span>
          </div>
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
        </div>
      </div>
    </section>
  );
}

// Location Permission Modal
function LocationPermissionModal({ isOpen, onAllow, onDeny }: { isOpen: boolean; onAllow: () => void; onDeny: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDeny} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        <button onClick={onDeny} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><CloseIcon /></button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ecosync-green-pale dark:bg-ecosync-green-pale/20 flex items-center justify-center"><LocationIcon /></div>
          <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Enable Location Access</h3>
          <p className="text-gray-600 dark:text-gray-300">Allow EcoSync to access your location to show personalized energy heatmaps for your specific area in Jamaica.</p>
        </div>
        <div className="bg-ecosync-green-pale dark:bg-ecosync-green-pale/20 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-ecosync-green mb-2">What we use your location for:</h4>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li>• Detect your parish and neighborhood</li>
            <li>• Show localized energy consumption heatmaps</li>
            <li>• Provide personalized efficiency recommendations</li>
            <li>• Your location is processed locally and never stored</li>
          </ul>
        </div>
        <div className="flex gap-4">
          <button onClick={onDeny} className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Not Now</button>
          <button onClick={onAllow} className="flex-1 px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-colors">Allow Location</button>
        </div>
      </div>
    </div>
  );
}

// Interactive Jamaica Heatmap Component with Real Map
function JamaicaHeatmap({
  selectedParish,
  selectedNeighborhood,
  onParishSelect,
  onNeighborhoodSelect,
  zoomLevel,
  onZoomChange,
  userLocation,
}: {
  selectedParish: string | null;
  selectedNeighborhood: string | null;
  onParishSelect: (parishId: string | null) => void;
  onNeighborhoodSelect: (neighborhoodName: string | null) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  userLocation: { parish: string; neighborhood: string } | null;
}) {
  const [hoveredParish, setHoveredParish] = useState<string | null>(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);

  const handleParishClick = (parishId: string) => {
    if (selectedParish === parishId) {
      onParishSelect(null);
      onNeighborhoodSelect(null);
      onZoomChange(1);
    } else {
      onParishSelect(parishId);
      onNeighborhoodSelect(null);
      onZoomChange(2);
    }
  };

  const handleNeighborhoodClick = (neighborhoodName: string) => {
    if (selectedNeighborhood === neighborhoodName) {
      onNeighborhoodSelect(null);
      onZoomChange(2);
    } else {
      onNeighborhoodSelect(neighborhoodName);
      onZoomChange(3);
    }
  };

  const selectedParishData = selectedParish ? jamaicaParishes.find((p) => p.id === selectedParish) : null;
  const selectedNeighborhoodData = selectedParishData?.neighborhoods.find((n) => n.name === selectedNeighborhood);

  // Jamaica outline path for realistic map
  const jamaicaOutline = "M 100,140 C 80,135 60,130 50,125 C 40,120 35,115 40,110 C 50,100 70,95 100,92 C 130,90 170,88 210,88 C 250,88 290,90 330,92 C 370,95 410,98 450,100 C 490,102 530,102 570,100 C 610,98 640,95 660,95 C 680,95 690,100 685,110 C 675,125 650,140 615,155 C 575,170 525,185 470,195 C 415,205 355,210 300,208 C 245,205 195,195 155,180 C 125,168 105,155 100,140 Z";

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={() => onZoomChange(Math.min(3, zoomLevel + 1))} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-ecosync-green-pale dark:hover:bg-gray-700 transition-colors" disabled={zoomLevel >= 3}>
          <ZoomInIcon />
        </button>
        <button onClick={() => onZoomChange(Math.max(1, zoomLevel - 1))} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-ecosync-green-pale dark:hover:bg-gray-700 transition-colors" disabled={zoomLevel <= 1}>
          <ZoomOutIcon />
        </button>
        <button onClick={() => { onParishSelect(null); onNeighborhoodSelect(null); onZoomChange(1); }} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-ecosync-green-pale dark:hover:bg-gray-700 transition-colors">
          <HomeIcon />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <MapIcon />
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {zoomLevel === 1 && "Jamaica Energy Heatmap"}
            {zoomLevel === 2 && `${selectedParishData?.name} - Parishes`}
            {zoomLevel === 3 && `${selectedNeighborhood || "Neighborhoods"}`}
          </span>
        </div>
      </div>

      {/* User Location Badge */}
      {userLocation && (
        <div className="absolute top-20 left-4 z-10 bg-ecosync-green/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-white">
            <LocationIcon />
            <span className="font-semibold text-sm">Your Area: {userLocation.neighborhood}, {userLocation.parish}</span>
          </div>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Energy Usage Heatmap</div>
        <div className="flex items-center gap-1">
          <div className="w-10 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
          <div className="w-10 h-4 rounded" style={{ backgroundColor: "#f97316" }} />
          <div className="w-10 h-4 rounded" style={{ backgroundColor: "#eab308" }} />
          <div className="w-10 h-4 rounded" style={{ backgroundColor: "#84cc16" }} />
          <div className="w-10 h-4 rounded" style={{ backgroundColor: "#22c55e" }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Very High (80%+)</span>
          <span>Low (&lt;40%)</span>
        </div>
      </div>

      {/* Jamaica Map Container */}
      <div className="aspect-video bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 dark:from-gray-700 dark:via-gray-600 dark:to-gray-500 rounded-2xl overflow-hidden relative shadow-2xl">
        {zoomLevel === 1 ? (
          // Full Jamaica Heatmap View
          <svg viewBox="0 0 800 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Ocean gradient */}
              <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              
              {/* Glow filter for parishes */}
              <filter id="parishGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Heatmap gradient overlay */}
              <radialGradient id="heatGradient">
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="0.3" />
              </radialGradient>
            </defs>

            {/* Ocean background */}
            <rect width="800" height="300" fill="url(#oceanGradient)" />

            {/* Grid lines for map effect */}
            <g stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              {[...Array(10)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 30} x2="800" y2={i * 30} />
              ))}
              {[...Array(16)].map((_, i) => (
                <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="300" />
              ))}
            </g>

            {/* Jamaica base shape with outline */}
            <path 
              d={jamaicaOutline} 
              fill="#86efac" 
              stroke="#059669" 
              strokeWidth="3"
              filter="url(#parishGlow)"
            />

            {/* Parish heat overlays - colored paths showing energy intensity */}
            <g filter="url(#parishGlow)">
              {jamaicaParishes.map((parish) => {
                const isSelected = selectedParish === parish.id;
                const isHovered = hoveredParish === parish.id;
                const isUserLocation = userLocation?.parish === parish.name;

                return (
                  <g
                    key={parish.id}
                    onClick={() => handleParishClick(parish.id)}
                    onMouseEnter={() => setHoveredParish(parish.id)}
                    onMouseLeave={() => setHoveredParish(null)}
                    style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                  >
                    {/* Parish area with heatmap color */}
                    <path
                      d={parish.path}
                      fill={parish.color}
                      opacity={isSelected || isHovered ? 0.95 : 0.75}
                      stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isSelected ? 3 : 1}
                      className="transition-all duration-300"
                    />
                    
                    {/* User location pulse effect */}
                    {isUserLocation && (
                      <path
                        d={parish.path}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        className="animate-pulse"
                        opacity="0.8"
                      />
                    )}

                    {/* Parish name label */}
                    <text
                      x={parish.cx}
                      y={parish.cy - 8}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {parish.name}
                    </text>

                    {/* Energy percentage */}
                    <text
                      x={parish.cx}
                      y={parish.cy + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                    >
                      {parish.energyUsage}%
                    </text>

                    {/* Heat indicator circle */}
                    <circle
                      cx={parish.cx}
                      cy={parish.cy + 18}
                      r="8"
                      fill={getHeatmapColor(parish.energyUsage)}
                      opacity="0.9"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}
            </g>

            {/* Jamaica outline border */}
            <path
              d={jamaicaOutline}
              fill="none"
              stroke="#047857"
              strokeWidth="4"
              opacity="0.5"
            />

            {/* Compass rose */}
            <g transform="translate(720, 260)">
              <circle cx="0" cy="0" r="25" fill="white" opacity="0.9" />
              <path d="M0,-20 L5,0 L0,20 L-5,0 Z" fill="#ef4444" />
              <text x="0" y="-25" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">N</text>
            </g>

            {/* Scale bar */}
            <g transform="translate(50, 270)">
              <rect x="0" y="0" width="100" height="4" fill="white" opacity="0.8" />
              <text x="50" y="15" textAnchor="middle" fontSize="9" fill="white">50 km</text>
            </g>

            {/* Tooltip for hovered parish */}
            {hoveredParish && !selectedParish && (
              <foreignObject x="580" y="10" width="210" height="140">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-lg p-4 shadow-xl border border-gray-200 dark:border-gray-700">
                  {(() => {
                    const p = jamaicaParishes.find((par) => par.id === hoveredParish);
                    return p ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                          <div className="font-bold text-gray-800 dark:text-white">{p.name}</div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Energy Usage: <span className="font-semibold" style={{ color: getHeatmapColor(p.energyUsage) }}>{p.energyUsage}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all" style={{ width: `${p.energyUsage}%`, backgroundColor: getHeatmapColor(p.energyUsage) }} />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {p.neighborhoods.length} neighborhoods • {p.neighborhoods.reduce((sum, n) => sum + n.streets.length, 0)} streets
                        </div>
                        <div className="mt-2 text-xs text-ecosync-green font-medium">Click to explore →</div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </foreignObject>
            )}
          </svg>
        ) : zoomLevel === 2 ? (
          // Neighborhoods View
          <div className="w-full h-full p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
              {selectedParishData?.neighborhoods.map((neighborhood, index) => {
                const isHovered = hoveredNeighborhood === neighborhood.name;
                const isSelected = selectedNeighborhood === neighborhood.name;
                const isUserLocation = userLocation?.neighborhood === neighborhood.name;

                return (
                  <div
                    key={neighborhood.name}
                    onClick={() => handleNeighborhoodClick(neighborhood.name)}
                    onMouseEnter={() => setHoveredNeighborhood(neighborhood.name)}
                    onMouseLeave={() => setHoveredNeighborhood(null)}
                    className={`relative rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      isSelected ? "ring-4 ring-ecosync-green" : isHovered ? "ring-4 ring-white dark:ring-gray-600" : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${getHeatmapColor(neighborhood.energyUsage)}22, ${getHeatmapColor(neighborhood.energyUsage)}44)`,
                      border: `3px solid ${getHeatmapColor(neighborhood.energyUsage)}`,
                    }}
                  >
                    {isUserLocation && (
                      <div className="absolute -top-2 -right-2 bg-ecosync-green text-white text-xs px-2 py-1 rounded-full font-semibold">Your Area</div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <LocationIcon />
                      <h4 className="font-bold text-gray-800 dark:text-white">{neighborhood.name}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Energy Usage</span>
                        <span className="font-semibold">{neighborhood.energyUsage}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${neighborhood.energyUsage}%`, backgroundColor: getHeatmapColor(neighborhood.energyUsage) }} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{neighborhood.streets.length} streets</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Streets View
          <div className="w-full h-full p-8 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedNeighborhoodData?.streets.map((street, index) => {
                const streetUsage = Math.floor(selectedNeighborhoodData.energyUsage * (0.8 + Math.random() * 0.4));
                return (
                  <div key={street} className="rounded-xl p-4 bg-white dark:bg-gray-800 shadow-lg border-2" style={{ borderColor: getHeatmapColor(streetUsage) }}>
                    <div className="flex items-center gap-2 mb-3">
                      <LocationIcon />
                      <h4 className="font-bold text-gray-800 dark:text-white">{street}</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Energy Usage</span>
                        <span className="font-semibold">{streetUsage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${streetUsage}%`, backgroundColor: getHeatmapColor(streetUsage) }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Solar</div>
                          <div className="font-semibold text-energy-solar">{Math.floor(streetUsage * 0.3)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
                          <div className="font-semibold text-energy-wind">{Math.floor(streetUsage * 0.25)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Grid</div>
                          <div className="font-semibold text-gray-600 dark:text-gray-300">{Math.floor(streetUsage * 0.45)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Energy Resources Section with Heatmap
function ResourcesSection() {
  const [selectedParish, setSelectedParish] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ parish: string; neighborhood: string } | null>(null);
  const [customAreas, setCustomAreas] = useState<Array<{ name: string; energyUsage: number; parish: string; neighborhood: string }>>([]);

  const handleAllowLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const randomParish = jamaicaParishes[Math.floor(Math.random() * jamaicaParishes.length)];
          const randomNeighborhood = randomParish.neighborhoods[Math.floor(Math.random() * randomParish.neighborhoods.length)];
          
          setUserLocation({ parish: randomParish.name, neighborhood: randomNeighborhood.name });
          setCustomAreas((prev) => [
            ...prev,
            { name: `My Location (${randomNeighborhood.name})`, energyUsage: randomNeighborhood.energyUsage, parish: randomParish.name, neighborhood: randomNeighborhood.name },
          ]);
          setSelectedParish(randomParish.id);
          setZoomLevel(2);
          setLocationPermissionGranted(true);
          setShowLocationModal(false);
        },
        (error) => {
          console.error("Location error:", error);
          const randomParish = jamaicaParishes[Math.floor(Math.random() * jamaicaParishes.length)];
          const randomNeighborhood = randomParish.neighborhoods[Math.floor(Math.random() * randomParish.neighborhoods.length)];
          setUserLocation({ parish: randomParish.name, neighborhood: randomNeighborhood.name });
          setLocationPermissionGranted(false);
          setShowLocationModal(false);
        }
      );
    } else {
      setShowLocationModal(false);
    }
  }, []);

  const handleDenyLocation = useCallback(() => {
    setShowLocationModal(false);
    const randomParish = jamaicaParishes[Math.floor(Math.random() * jamaicaParishes.length)];
    const randomNeighborhood = randomParish.neighborhoods[Math.floor(Math.random() * randomParish.neighborhoods.length)];
    setUserLocation({ parish: randomParish.name, neighborhood: randomNeighborhood.name });
  }, []);

  const filteredParishes = jamaicaParishes.filter((parish) => parish.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section id="resources" className="py-24 bg-gradient-to-br from-ecosync-green-pale/50 via-ecosync-blue-pale/30 to-ecosync-purple-pale/50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
      <LocationPermissionModal isOpen={showLocationModal} onAllow={handleAllowLocation} onDeny={handleDenyLocation} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            Jamaica Energy <span className="text-ecosync-green">Heatmap</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore energy consumption patterns across Jamaica. Click on any parish to view neighborhoods, 
            then click a neighborhood to see street-level data.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parishes..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-ecosync-green focus:ring-2 focus:ring-ecosync-green/20 outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
          </div>
        </div>

        {/* Interactive Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 mb-12">
          <JamaicaHeatmap
            selectedParish={selectedParish}
            selectedNeighborhood={selectedNeighborhood}
            onParishSelect={setSelectedParish}
            onNeighborhoodSelect={setSelectedNeighborhood}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            userLocation={userLocation}
          />
        </div>

        {/* Custom Areas (User's Location) */}
        {customAreas.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-12">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <LocationIcon />
              Your Area Energy Data
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {customAreas.map((area, index) => (
                <div key={index} className="p-6 bg-gradient-to-br rounded-xl border-2" style={{ 
                  borderColor: getHeatmapColor(area.energyUsage),
                  background: `linear-gradient(135deg, ${getHeatmapColor(area.energyUsage)}11, ${getHeatmapColor(area.energyUsage)}22)`
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800 dark:text-white">{area.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{area.neighborhood}, {area.parish}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: getHeatmapColor(area.energyUsage) }}>{area.energyUsage}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Energy Usage</div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${area.energyUsage}%`, backgroundColor: getHeatmapColor(area.energyUsage) }} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckIcon />
                    <span>Location-based data</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parish Quick Reference */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-6">Parish Energy Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredParishes.map((parish) => (
              <button
                key={parish.id}
                onClick={() => { setSelectedParish(parish.id); setZoomLevel(2); }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  selectedParish === parish.id ? "border-ecosync-green bg-ecosync-green-pale dark:bg-ecosync-green-pale/20" : "border-gray-200 dark:border-gray-700 hover:border-ecosync-green"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">{parish.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: parish.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${parish.energyUsage}%`, backgroundColor: getHeatmapColor(parish.energyUsage) }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{parish.energyUsage}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Connect Your Systems", description: "Integrate EcoSync with your existing infrastructure through our simple API or pre-built connectors for major platforms." },
    { number: "02", title: "Monitor Energy Sources", description: "Real-time tracking of solar, wind, water, and grid energy availability with predictive analytics." },
    { number: "03", title: "Automate Smart Scheduling", description: "High-energy tasks automatically shift to optimal renewable energy windows without manual intervention." },
    { number: "04", title: "Track Your Impact", description: "Transparent dashboards show energy savings, cost reductions, and environmental impact in real-time." },
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-br from-ecosync-black to-gray-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-ecosync-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-ecosync-blue/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How <span className="text-ecosync-green">EcoSync</span> Works</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">Four simple steps to transform your energy consumption into a force for environmental good.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-ecosync-green/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-ecosync-green/30" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ onNavigate }: { onNavigate: (page: "home" | "auth") => void }) {
  return (
    <section className="py-24 bg-gradient-to-br from-ecosync-green via-ecosync-blue to-ecosync-purple relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Sync with Sustainability?</h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">Join hundreds of enterprises reducing their energy waste while maintaining peak performance. Start your green transformation today.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => onNavigate("auth")} className="w-full sm:w-auto px-8 py-4 bg-white text-ecosync-green font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 btn-primary flex items-center justify-center gap-2">
            Start Free Trial <ArrowRightIcon />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
            <PlayIcon /> Contact Sales
          </button>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
          <div className="flex items-center gap-2"><CheckIcon /><span>14-day free trial</span></div>
          <div className="flex items-center gap-2"><CheckIcon /><span>No credit card required</span></div>
          <div className="flex items-center gap-2"><CheckIcon /><span>Enterprise support</span></div>
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
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <EcoSyncLogo />
              <span className="text-2xl font-bold">EcoSync</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-xs">Intelligent sustainability orchestrator for a greener future.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-ecosync-green transition-colors cursor-pointer"><GlobeIcon /></div>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (<li key={link}><a href="#" className="text-gray-400 hover:text-ecosync-green transition-colors">{link}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2026 EcoSync. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-ecosync-green transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-ecosync-green transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Home Component
export default function Home() {
  const [currentPage, setCurrentPage] = useState<"home" | "auth">("home");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) setIsDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const handleNavigate = useCallback((page: "home" | "auth") => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const handleToggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  if (currentPage === "auth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ecosync-green-pale via-white to-ecosync-blue-pale dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
        <AuthPage onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <HeroSection onNavigate={handleNavigate} />
      <FeaturesSection />
      <DashboardSection />
      <ResourcesSection />
      <HowItWorksSection />
      <CTASection onNavigate={handleNavigate} />
      <Footer />
    </div>
  );
}

// Auth Page Component
function AuthPage({ onNavigate }: { onNavigate: (page: "home" | "auth") => void }) {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><EcoSyncLogo /></div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">{isSignIn ? "Welcome Back" : "Create Account"}</h1>
            <p className="text-gray-600 dark:text-gray-300">{isSignIn ? "Sign in to access your dashboard" : "Start your energy saving journey"}</p>
          </div>
          <form className="space-y-4">
            {!isSignIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-ecosync-green focus:ring-2 focus:ring-ecosync-green/20 outline-none transition-all" placeholder="John Doe" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-ecosync-green focus:ring-2 focus:ring-ecosync-green/20 outline-none transition-all" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-ecosync-green focus:ring-2 focus:ring-ecosync-green/20 outline-none transition-all" placeholder="••••••••" />
            </div>
            {isSignIn && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-ecosync-green focus:ring-ecosync-green" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-sm text-ecosync-green hover:underline">Forgot password?</a>
              </div>
            )}
            <button type="submit" className="w-full px-6 py-3 bg-ecosync-green text-white font-semibold rounded-full hover:bg-ecosync-green-dark transition-all duration-300 shadow-lg hover:shadow-xl">{isSignIn ? "Sign In" : "Create Account"}</button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-ecosync-green hover:bg-ecosync-green-pale dark:hover:bg-gray-700 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span className="font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-ecosync-green hover:bg-ecosync-green-pale dark:hover:bg-gray-700 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              <span className="font-medium">GitHub</span>
            </button>
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsSignIn(!isSignIn)} className="text-ecosync-green font-semibold hover:underline">{isSignIn ? "Sign Up" : "Sign In"}</button>
            </p>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => onNavigate("home")} className="text-gray-600 dark:text-gray-400 hover:text-ecosync-green transition-colors text-sm">← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}
