"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OpenStreetMap from '@/components/OpenStreetMap';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedParish, setSelectedParish] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [showMapButton, setShowMapButton] = useState(false);

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
            <div className="text-center mb-12 fade-in-up">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                Conserve Energy.<br />
                <span className="text-green-600">Protect Our Future.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Join the movement to reduce energy waste and build a sustainable tomorrow. 
                Track, analyze, and optimize your energy consumption with AI-powered insights.
              </p>
              
              {/* Choose Your Perspective Button */}
              <div className="mb-8 fade-in-up stagger-1">
                <Link
                  href="/perspectives"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Choose Your Perspective →
                </Link>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 fade-in-up stagger-2">
                <Link href="/auth/register" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105">
                  Start Saving Today →
                </Link>
                <button
                  onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-full transition-all hover:scale-105"
                >
                  View Jamaica Energy Map
                </button>
                <a
                  href="#dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Explore Interactive Map
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              {[
                { value: '40%', label: 'Average Energy Savings', icon: '📉' },
                { value: '1M+', label: 'Tons CO₂ Prevented', icon: '🌍' },
                { value: '50K+', label: 'Active Users', icon: '👥' },
                { value: '24/7', label: 'Real-Time Monitoring', icon: '⚡' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl hover-lift">
                  <div className="text-4xl mb-2 float">{stat.icon}</div>
                  <div className="text-3xl font-bold text-green-600 mb-1 scale-in" style={{ animationDelay: `${i * 0.1}s` }}>{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Choose Your Perspective Section */}
          <section id="perspectives" className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 fade-in-up">
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Select Your <span className="text-green-600">Perspective</span>
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Choose the dashboard that matches your energy management needs
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Consumer Card */}
                <Link href="/consumer" className="group bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-lg border-2 border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all card-hover fade-in-up stagger-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform rotate-slow">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Consumer</h3>
                  <p className="text-green-600 font-medium mb-4">Home & Residential</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Optimize your home energy usage with AI-powered insights for HVAC, appliances, and solar panels.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['Real-time monitoring', 'Solar optimization', 'Smart scheduling', 'Carbon tracking'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 fade-in-left">
                        <span className="w-2 h-2 rounded-full bg-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-full text-center group-hover:shadow-lg transition-all">
                    Enter Consumer Dashboard →
                  </div>
                </Link>

                {/* Enterprise Card */}
                <Link href="/enterprise" className="group bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-lg border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all card-hover fade-in-up stagger-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform rotate-slow">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Enterprise</h3>
                  <p className="text-blue-600 font-medium mb-4">Commercial Buildings</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Manage energy across multiple zones with compliance tracking and automated HVAC control.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['Zone management', 'HVAC optimization', 'Compliance tracking', 'Multi-building'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 fade-in-left">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full text-center group-hover:shadow-lg transition-all">
                    Enter Enterprise Dashboard →
                  </div>
                </Link>

                {/* Data Center Card */}
                <Link href="/datacenter" className="group bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-lg border-2 border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all card-hover fade-in-up stagger-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform rotate-slow">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 6h.01M10 6h.01M6 18h.01M10 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Data Center</h3>
                  <p className="text-purple-600 font-medium mb-4">Compute Facilities</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Optimize PUE, schedule jobs based on renewable availability, and reduce carbon footprint.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {['PUE monitoring', 'Renewable scheduling', 'GPU tracking', 'Carbon-aware compute'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 fade-in-left">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-full text-center group-hover:shadow-lg transition-all">
                    Enter Data Center Dashboard →
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </section>

        {/* Jamaica Energy Heatmap Section */}
        <section id="dashboard" className="py-20 px-4 bg-green-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 fade-in-up">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                🇯🇲 Jamaica <span className="text-green-600">Energy Map</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Real-time energy consumption across all 14 parishes
              </p>
            </div>

            {/* Jamaica OpenStreetMap with Heatmap */}
            <div className="fade-in-up">
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <span className="text-2xl">👆</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">Click any parish to zoom in & view street-level energy data</span>
                </div>
              </div>
              <OpenStreetMap 
                selectedParish={selectedParish}
                onParishSelect={setSelectedParish}
              />
            </div>

            {/* Parish Selector */}
            <div className="mb-8 fade-in-down">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center pulse-glow">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Select a Parish:</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {jamaicaParishes.map((parish, i) => (
                    <button
                      key={parish.name}
                      onClick={() => { setSelectedParish(parish.name); setSelectedArea(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover-lift ${
                        selectedParish === parish.name
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      {parish.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Display */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-2xl fade-in-up">
              {!selectedParish ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {jamaicaParishes.map((parish, i) => (
                    <button
                      key={parish.name}
                      onClick={() => { setSelectedParish(parish.name); setSelectedArea(null); }}
                      className="p-6 rounded-2xl heatmap-glow hover:scale-110 transition-all pulse-glow"
                      style={{ 
                        background: getHeatGradient(parish.energy),
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      <div className="text-white">
                        <div className="font-bold text-sm mb-1">{parish.name}</div>
                        <div className="text-2xl font-extrabold">{parish.energy}%</div>
                        <div className="text-xs opacity-80">energy usage</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedParishData?.areas ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white fade-in-left">🇯🇲 {selectedParish} Parish</h3>
                    <button onClick={() => { setSelectedParish(null); setSelectedArea(null); }} className="text-green-600 hover:underline hover:scale-105 transition-transform">
                      ← Back to All Parishes
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedParishData.areas.map((area, i) => {
                      const areaEnergy = Math.floor(50 + Math.random() * 45);
                      return (
                        <button
                          key={area}
                          onClick={() => setSelectedArea(area)}
                          className="p-6 rounded-2xl heatmap-glow hover:scale-105 transition-all"
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
