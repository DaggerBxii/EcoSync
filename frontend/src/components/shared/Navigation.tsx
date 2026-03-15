/**
 * Navigation Component
 * Main navigation with perspective switcher
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
  currentPerspective?: 'consumer' | 'enterprise' | 'datacenter';
}

export function Navigation({ currentPerspective }: NavigationProps) {
  const router = useRouter();
  const [isPerspectiveOpen, setIsPerspectiveOpen] = useState(false);

  const perspectives = [
    {
      id: 'consumer' as const,
      name: 'Consumer',
      description: 'Home & Residential',
      color: 'bg-green-600',
      gradient: 'from-green-600 to-green-400',
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      description: 'Commercial Buildings',
      color: 'bg-blue-600',
      gradient: 'from-blue-600 to-blue-400',
    },
    {
      id: 'datacenter' as const,
      name: 'Data Center',
      description: 'Compute Facilities',
      color: 'bg-purple-600',
      gradient: 'from-purple-600 to-purple-400',
    },
  ];

  const currentPerspectiveData = perspectives.find(p => p.id === currentPerspective);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl animated-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">EcoSync</span>
          </Link>

          {/* Perspective Switcher */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsPerspectiveOpen(!isPerspectiveOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentPerspectiveData?.color || 'bg-gray-600'} text-white font-medium hover:opacity-90 transition-opacity`}
              >
                {currentPerspectiveData?.name || 'Select Perspective'}
                <span>▼</span>
              </button>

              {isPerspectiveOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
                      Select Perspective
                    </p>
                    {perspectives.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          router.push(`/${p.id}`);
                          setIsPerspectiveOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          currentPerspective === p.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                          <span className="text-white text-sm font-bold">{p.name[0]}</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{p.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
