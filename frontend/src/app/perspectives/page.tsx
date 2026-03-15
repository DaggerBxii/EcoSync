"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PerspectivesPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Video */}
      <div className="bg-video">
        <video autoPlay loop muted playsInline>
          <source src="https://videos.pexels.com/video-files/2882118/2882118-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 2 5 4.5 5 8c0 2.5 1.5 4.5 3.5 5.5C8 15 7 17 7 19c0 2.5 2.5 3 5 3s5-.5 5-3c0-2-1-4-1.5-5.5C17.5 12.5 19 10.5 19 8c0-3.5-3.5-6-7-6zm0 2c2.5 0 5 1.5 5 4 0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-3-3.5-3s-3 1.5-3.5 3C7.5 10.5 7 9.5 7 8c0-2.5 2.5-4 5-4z"/>
                  <ellipse cx="12" cy="18" rx="4" ry="2" opacity="0.6"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EcoSync</span>
            </Link>
            <Link href="/" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <div className="text-6xl mb-4 float">🌿</div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-gray-900 dark:text-white">Choose Your </span>
            <span className="text-green-600">Perspective</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Select the dashboard that matches your energy management needs
          </p>
        </div>
      </section>

      {/* Perspective Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Consumer Card */}
          <Link 
            href="/consumer" 
            className="group relative bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-green-200 dark:border-green-800 hover:shadow-3xl transition-all card-hover overflow-hidden"
            onMouseEnter={() => setHoveredCard('consumer')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Icon */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Title */}
            <h2 className="relative text-3xl font-bold text-gray-900 dark:text-white mb-2">Consumer</h2>
            <p className="relative text-green-600 font-semibold mb-6">Home & Residential</p>

            {/* Pie Chart Visualization */}
            <div className="relative mb-6 flex justify-center">
              <div className="w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_20s_linear_infinite]">
                  {/* Solar - 35% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20"
                    strokeDasharray="88 168" strokeDashoffset="0" />
                  {/* HVAC - 30% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20"
                    strokeDasharray="75 168" strokeDashoffset="-88" />
                  {/* Appliances - 25% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20"
                    strokeDasharray="63 168" strokeDashoffset="-163" />
                  {/* Other - 10% */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20"
                    strokeDasharray="25 168" strokeDashoffset="-226" />
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                    <div className="text-xs text-gray-500">Energy</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="relative grid grid-cols-2 gap-2 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Solar 35%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">HVAC 30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">Appliances 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Other 10%</span>
              </div>
            </div>

            {/* Features */}
            <ul className="relative space-y-3 mb-8">
              {['Real-time monitoring', 'Solar optimization', 'Smart scheduling', 'Carbon tracking'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 fade-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <div className="relative w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-full text-center group-hover:shadow-xl transition-all group-hover:scale-105">
              Enter Consumer Dashboard →
            </div>
          </Link>

          {/* Enterprise Card */}
          <Link 
            href="/enterprise" 
            className="group relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-blue-200 dark:border-blue-800 hover:shadow-3xl transition-all card-hover overflow-hidden"
            onMouseEnter={() => setHoveredCard('enterprise')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 className="relative text-3xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h2>
            <p className="relative text-blue-600 font-semibold mb-6">Commercial Buildings</p>

            {/* Pie Chart */}
            <div className="relative mb-6 flex justify-center">
              <div className="w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_20s_linear_infinite]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="100 168" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="63 168" strokeDashoffset="-100" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="38 168" strokeDashoffset="-163" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="25 168" strokeDashoffset="-201" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                    <div className="text-xs text-gray-500">Energy</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-2 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">HVAC 60%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Lighting 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">Equipment 15%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Other 10%</span>
              </div>
            </div>

            <ul className="relative space-y-3 mb-8">
              {['Zone management', 'HVAC optimization', 'Compliance tracking', 'Multi-building'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 fade-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full text-center group-hover:shadow-xl transition-all group-hover:scale-105">
              Enter Enterprise Dashboard →
            </div>
          </Link>

          {/* Data Center Card */}
          <Link 
            href="/datacenter" 
            className="group relative bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-purple-200 dark:border-purple-800 hover:shadow-3xl transition-all card-hover overflow-hidden"
            onMouseEnter={() => setHoveredCard('datacenter')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all shadow-xl">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 6h.01M10 6h.01M6 18h.01M10 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            <h2 className="relative text-3xl font-bold text-gray-900 dark:text-white mb-2">Data Center</h2>
            <p className="relative text-purple-600 font-semibold mb-6">Compute Facilities</p>

            {/* Pie Chart */}
            <div className="relative mb-6 flex justify-center">
              <div className="w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_20s_linear_infinite]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="75 168" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="50 168" strokeDashoffset="-75" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="38 168" strokeDashoffset="-125" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="25 168" strokeDashoffset="-163" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
                    <div className="text-xs text-gray-500">Load</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-2 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Compute 45%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Cooling 30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Network 15%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">Other 10%</span>
              </div>
            </div>

            <ul className="relative space-y-3 mb-8">
              {['PUE monitoring', 'Renewable scheduling', 'GPU tracking', 'Carbon-aware compute'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 fade-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-full text-center group-hover:shadow-xl transition-all group-hover:scale-105">
              Enter Data Center Dashboard →
            </div>
          </Link>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Compare <span className="text-green-600">Perspectives</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              <thead className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Feature</th>
                  <th className="px-6 py-4 text-center font-bold">Consumer</th>
                  <th className="px-6 py-4 text-center font-bold">Enterprise</th>
                  <th className="px-6 py-4 text-center font-bold">Data Center</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  { feature: 'Primary Focus', consumer: 'Home Energy', enterprise: 'Building Efficiency', datacenter: 'Compute Optimization' },
                  { feature: 'Key Metric', consumer: 'kWh Usage', enterprise: 'Zone Efficiency', datacenter: 'PUE Rating' },
                  { feature: 'AI Insights', consumer: 'Appliance Tips', enterprise: 'HVAC Control', datacenter: 'Job Scheduling' },
                  { feature: 'Monitoring', consumer: 'Real-time', enterprise: 'Zone-based', datacenter: 'Cluster-level' },
                  { feature: 'Savings Potential', consumer: '20-40%', enterprise: '15-30%', datacenter: '25-50%' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{row.consumer}</td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{row.enterprise}</td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{row.datacenter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 animated-gradient">
        <div className="max-w-4xl mx-auto text-center fade-in-up">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Choose your perspective and start optimizing today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consumer" className="px-8 py-4 bg-white text-green-600 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all">
              Consumer Dashboard
            </Link>
            <Link href="/enterprise" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all">
              Enterprise Dashboard
            </Link>
            <Link href="/datacenter" className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all">
              Data Center Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 2 5 4.5 5 8c0 2.5 1.5 4.5 3.5 5.5C8 15 7 17 7 19c0 2.5 2.5 3 5 3s5-.5 5-3c0-2-1-4-1.5-5.5C17.5 12.5 19 10.5 19 8c0-3.5-3.5-6-7-6zm0 2c2.5 0 5 1.5 5 4 0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-3-3.5-3s-3 1.5-3.5 3C7.5 10.5 7 9.5 7 8c0-2.5 2.5-4 5-4z"/>
                <ellipse cx="12" cy="18" rx="4" ry="2" opacity="0.6"/>
              </svg>
            </div>
            <span className="text-xl font-bold">EcoSync</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 EcoSync Jamaica. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
