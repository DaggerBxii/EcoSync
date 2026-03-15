"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Generic regions for heatmap (not Jamaica-specific)
const regionData = {
  regions: [
    { name: 'North Region', energy: 72, areas: ['Highland', 'Coastal', 'Valley', 'Plains'] },
    { name: 'South Region', energy: 85, areas: ['Industrial', 'Downtown', 'Harbor', 'Eastside'] },
    { name: 'East Region', energy: 45, areas: ['Rural', 'Farmland', 'Forest', 'Lakeside'] },
    { name: 'West Region', energy: 68, areas: ['Suburban', 'Commercial', 'Residential', 'Tech Park'] },
    { name: 'Central Region', energy: 92, areas: ['Metro', 'Business District', 'University', 'Hospital Zone'] },
  ],
};

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const selectedRegionData = regionData.regions.find(r => r.name === selectedRegion);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="bg-image" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen bg-white dark:bg-black transition-colors duration-300">
        
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">EcoSync</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                {['Features', 'Dashboard', 'Resources', 'About'].map((item) => (
                  <button
                    key={item}
                    onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
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
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Energy Conservation Focus */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6">
                Conserve Energy.<br />
                <span className="text-green-600">Protect Our Future.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Join the movement to reduce energy waste and build a sustainable tomorrow. 
                Track, analyze, and optimize your energy consumption with AI-powered insights.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/auth/register" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                  Start Saving Today →
                </Link>
                <button 
                  onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-full transition-all"
                >
                  View Energy Map
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '40%', label: 'Average Energy Savings', icon: '📉' },
                { value: '1M+', label: 'Tons CO₂ Prevented', icon: '🌍' },
                { value: '50K+', label: 'Active Users', icon: '👥' },
                { value: '24/7', label: 'Real-Time Monitoring', icon: '⚡' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Energy Conservation Tips */}
        <section className="py-20 px-4 bg-green-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Simple Ways to <span className="text-green-600">Conserve</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Small changes make a big difference</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '💡',
                  title: 'Switch to LED',
                  description: 'LED bulbs use 75% less energy than traditional incandescent lighting.',
                  savings: 'Save up to $75/year',
                },
                {
                  icon: '🌡️',
                  title: 'Smart Thermostat',
                  description: 'Adjust temperature automatically when you\'re away to reduce HVAC waste.',
                  savings: 'Save 10-15% on heating/cooling',
                },
                {
                  icon: '🔌',
                  title: 'Unplug Devices',
                  description: 'Phantom loads from standby devices can account for 10% of your bill.',
                  savings: 'Save $100-200/year',
                },
                {
                  icon: '🚿',
                  title: 'Efficient Water Heating',
                  description: 'Lower water heater temperature and fix leaks to reduce energy waste.',
                  savings: 'Save 5-10% on water heating',
                },
                {
                  icon: '🏠',
                  title: 'Seal Air Leaks',
                  description: 'Weatherstrip doors and windows to prevent heating/cooling loss.',
                  savings: 'Save 15-25% on HVAC',
                },
                {
                  icon: '☀️',
                  title: 'Use Natural Light',
                  description: 'Open curtains during the day to reduce lighting needs.',
                  savings: 'Save 5-10% on lighting',
                },
              ].map((tip, i) => (
                <div key={i} className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg card-hover border border-gray-200 dark:border-gray-800">
                  <div className="text-5xl mb-4">{tip.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tip.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{tip.description}</p>
                  <div className="text-green-600 font-semibold">{tip.savings}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard/Heatmap Section */}
        <section id="dashboard" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Energy <span className="text-green-600">Heatmap</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Visualize energy consumption in your region</p>
            </div>

            {/* Region Selector */}
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Select a Region:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {regionData.regions.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => { setSelectedRegion(region.name); setSelectedArea(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedRegion === region.name
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800">
              {!selectedRegion ? (
                <div className="grid md:grid-cols-5 gap-4">
                  {regionData.regions.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => { setSelectedRegion(region.name); setSelectedArea(null); }}
                      className="p-6 rounded-2xl heatmap-glow hover:scale-105 transition-all"
                      style={{ background: getHeatGradient(region.energy) }}
                    >
                      <div className="text-white">
                        <div className="font-bold text-lg mb-1">{region.name}</div>
                        <div className="text-3xl font-extrabold">{region.energy}%</div>
                        <div className="text-sm opacity-80">energy usage</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedRegionData?.areas ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRegion}</h3>
                    <button onClick={() => { setSelectedRegion(null); setSelectedArea(null); }} className="text-green-600 hover:underline">
                      ← Back to Regions
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedRegionData.areas.map((area, i) => {
                      const areaEnergy = Math.floor(50 + Math.random() * 45);
                      return (
                        <button
                          key={area}
                          onClick={() => setSelectedArea(area)}
                          className="p-6 rounded-2xl heatmap-glow hover:scale-105 transition-all"
                          style={{ background: getHeatGradient(areaEnergy) }}
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
                    <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedArea} - Street Level</h4>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((street) => {
                          const streetEnergy = Math.floor(40 + Math.random() * 50);
                          return (
                            <div key={street} className="flex items-center gap-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400 w-20">Street {street}</span>
                              <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${streetEnergy}%`, background: getHeatColor(streetEnergy) }} />
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
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(25) }} />
                <span className="text-gray-600 dark:text-gray-400">Low Usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(50) }} />
                <span className="text-gray-600 dark:text-gray-400">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ background: getHeatColor(85) }} />
                <span className="text-gray-600 dark:text-gray-400">High Usage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
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
                <div key={i} className="bg-white dark:bg-black rounded-2xl p-8 shadow-lg card-hover border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
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
                <a key={i} href="#" className="bg-white dark:bg-black rounded-2xl overflow-hidden shadow-lg card-hover border border-gray-200 dark:border-gray-800 group">
                  <div className="h-48 bg-green-50 dark:bg-gray-900 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">{resource.icon}</div>
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
        <section id="about" className="py-20 px-4 bg-green-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
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
              <div className="bg-white dark:bg-black rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">One Planet. One Future.</h3>
                <p className="text-gray-600 dark:text-gray-400">Join the conservation movement today</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-green-600">
          <div className="max-w-4xl mx-auto text-center">
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
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                  <span className="text-xl font-bold">EcoSync</span>
                </div>
                <p className="text-gray-400 text-sm">Empowering sustainable energy choices</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#features" className="hover:text-white">Features</Link></li>
                  <li><Link href="#dashboard" className="hover:text-white">Dashboard</Link></li>
                  <li><Link href="#resources" className="hover:text-white">Resources</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="#about" className="hover:text-white">About</Link></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
              <p>© 2026 EcoSync. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
