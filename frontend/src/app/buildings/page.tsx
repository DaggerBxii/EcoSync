"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Sun, Moon, Activity, ArrowRight, Server, Hospital, GraduationCap, Factory } from "lucide-react";
import { useTheme } from "next-themes";

const buildingTypes = [
  {
    id: "office",
    name: "Office Tower",
    icon: Building2,
    description: "Multi-floor commercial office spaces with HVAC and lighting optimization",
    floors: "8-15",
    tenants: "50-500",
    primaryResource: "electricity",
  },
  {
    id: "datacenter",
    name: "Data Center",
    icon: Server,
    description: "High-density compute facilities with cooling and PUE monitoring",
    floors: "3-6",
    tenants: "1-5",
    primaryResource: "hvac",
  },
  {
    id: "hospital",
    name: "Hospital",
    icon: Hospital,
    description: "24/7 critical care facilities with complex resource demands",
    floors: "10-15",
    tenants: "1",
    primaryResource: "airQuality",
  },
  {
    id: "campus",
    name: "University Campus",
    icon: GraduationCap,
    description: "Distributed buildings with varying occupancy patterns",
    floors: "4-8 per building",
    tenants: "1000+",
    primaryResource: "lighting",
  },
  {
    id: "factory",
    name: "Manufacturing",
    icon: Factory,
    description: "Industrial facilities with heavy machinery and process loads",
    floors: "3-5",
    tenants: "1-10",
    primaryResource: "electricity",
  },
];

export default function BuildingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Synclo</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/chatbot">
                <button className="px-4 py-2 text-sm font-medium hover:text-green-600 transition-colors">
                  AI Assistant
                </button>
              </Link>
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
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Select Building Type
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose a building type to explore the Synclo visualization dashboard
            </p>
          </div>

          {/* Building Type Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {buildingTypes.map((building, i) => (
              <Link
                key={building.id}
                href={`/buildings/${building.id}`}
                className="group bg-background rounded-3xl p-8 shadow-lg border-2 border-border hover:border-green-600 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <building.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{building.name}</h2>
                <p className="text-muted-foreground mb-6">{building.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Floors</div>
                    <div className="font-semibold">{building.floors}</div>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Tenants</div>
                    <div className="font-semibold">{building.tenants}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Primary Resource</div>
                    <div className="font-medium text-green-600 capitalize">{building.primaryResource}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
