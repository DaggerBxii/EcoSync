"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity, Sun, Moon, Building2, TrendingUp, DollarSign,
  Clock, Users, ArrowRight, MessageSquare, Send, X,
  BarChart3, Zap, Droplets, Thermometer, Wifi, ChevronRight, Sparkles
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
  type?: "greeting" | "analytics" | "building" | "control" | "general";
  showMetrics?: boolean;
  showImprovements?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<{ name: string; company: string } | null>(null);
  const [showChatbot, setShowChatbot] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<"greeting" | "analytics" | "building" | "done">("greeting");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [animatingSection, setAnimatingSection] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock building data
  const buildingData = {
    name: "Synclo Tower",
    totalFloors: 10,
    alignmentBefore: 38,
    alignmentAfter: 76,
    floors: Array.from({ length: 10 }, (_, i) => ({
      floor: i + 1,
      electricity: Math.floor(200 + Math.random() * 150),
      hvac: Math.floor(60 + Math.random() * 30),
      water: Math.floor(50 + Math.random() * 100),
      lighting: Math.floor(40 + Math.random() * 40),
    })),
  };

  const beforeAfterData = [
    { name: "Before Synclo", value: buildingData.alignmentBefore, fill: "#94a3b8" },
    { name: "After Synclo", value: buildingData.alignmentAfter, fill: "#10b981" },
  ];

  const totalMetrics = {
    electricity: buildingData.floors.reduce((sum, f) => sum + f.electricity, 0),
    hvac: Math.round(buildingData.floors.reduce((sum, f) => sum + f.hvac, 0) / buildingData.floors.length),
    water: buildingData.floors.reduce((sum, f) => sum + f.water, 0),
    lighting: Math.round(buildingData.floors.reduce((sum, f) => sum + f.lighting, 0) / buildingData.floors.length),
  };

  useEffect(() => {
    setIsLoaded(true);
    const userData = localStorage.getItem("synclo_user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/auth");
    }
  }, [router]);

  // Start greeting animation
  useEffect(() => {
    if (isLoaded && user && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          `Hello ${user.name.split(" ")[0]}! 👋`,
          "greeting"
        );
      }, 500);
      
      setTimeout(() => {
        addBotMessage(
          `Welcome to Synclo. I'm your building intelligence assistant.`,
          "greeting"
        );
      }, 1200);
      
      setTimeout(() => {
        addBotMessage(
          `Would you like to see the analytics for today?`,
          "greeting",
          ["Yes, show me analytics", "Skip to building view"]
        );
      }, 2000);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content: string, type: ChatMessage["type"] = "general", options?: string[], extras?: Partial<ChatMessage>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        role: "assistant",
        content,
        timestamp: new Date(),
        type,
        options,
        ...extras,
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    processUserInput(option);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    processUserInput(inputValue);
    setInputValue("");
  };

  const processUserInput = async (input: string) => {
    setIsTyping(true);
    setAnimatingSection("processing");

    const inputLower = input.toLowerCase();

    // Check if this is a control command
    const controlKeywords = ["limit", "set", "turn off", "turn on", "increase", "decrease", "reduce", "optimize", "adjust"];
    const isControlCommand = controlKeywords.some(keyword => inputLower.includes(keyword));

    if (isControlCommand) {
      // Send to natural language control endpoint
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/control/natural`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            context: {
              building_name: buildingData.name,
              current_floor: selectedFloor,
              total_floors: buildingData.totalFloors,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process command");
        }

        const data = await response.json();
        setIsTyping(false);
        setAnimatingSection(null);

        if (data.needs_clarification) {
          addBotMessage(
            data.clarification_question || "Could you please clarify?",
            "general",
            ["Floor 1", "Floor 2", "All floors"]
          );
        } else {
          addBotMessage(
            data.message,
            "control",
            data.success ? ["Show changes", "More actions"] : ["Try again", "Help"]
          );
        }
        return;
      } catch (error) {
        setIsTyping(false);
        setAnimatingSection(null);
        addBotMessage(
          "I'm sorry, I couldn't process that control command. Please make sure the backend is running.",
          "general",
          ["Help", "Try again"]
        );
        return;
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      setAnimatingSection(null);

      if (currentStep === "greeting") {
        if (inputLower.includes("yes") || inputLower.includes("analytics") || inputLower.includes("show")) {
          showAnalyticsFlow();
        } else if (inputLower.includes("skip") || inputLower.includes("building")) {
          showBuildingFlow();
        } else {
          addBotMessage(
            "I can help you with building analytics, control resources, or show you the live building visualization. What would you like to explore?",
            "general",
            ["Show analytics", "Show building view", "Control resources"]
          );
        }
      } else if (currentStep === "analytics") {
        if (inputLower.includes("building") || inputLower.includes("show") || inputLower.includes("explore")) {
          showBuildingFlow();
        } else if (inputLower.includes("more") || inputLower.includes("detail")) {
          addBotMessage(
            `📈 **Detailed Analytics**:\n\n` +
            `• Peak usage hours: 2-4 PM\n` +
            `• Most efficient floor: Floor 7\n` +
            `• Biggest savings opportunity: HVAC optimization on floors 8-10\n\n` +
            `Synclo increased load-window alignment from **38%** to **76%**.\n\n` +
            `Would you like to see the building visualization?`,
            "analytics",
            ["Show building view", "Back to main menu"]
          );
        } else {
          addBotMessage(
            "Would you like to see the building visualization now?",
            "general",
            ["Show building view", "More analytics"]
          );
        }
      } else if (currentStep === "building") {
        if (inputLower.includes("floor")) {
          const floorMatch = input.match(/(\d+)/);
          if (floorMatch) {
            const floorNum = parseInt(floorMatch[1]);
            if (floorNum >= 1 && floorNum <= buildingData.totalFloors) {
              setSelectedFloor(floorNum);
              const floor = buildingData.floors.find((f) => f.floor === floorNum);
              addBotMessage(
                `📍 **Floor ${floorNum}** Metrics:\n` +
                `⚡ Electricity: ${floor?.electricity} kW\n` +
                `🌡️ HVAC: ${floor?.hvac}°C\n` +
                `💧 Water: ${floor?.water} L/min\n` +
                `💡 Lighting: ${floor?.lighting}%\n\n` +
                `This floor is operating at **${Math.round((floor?.electricity || 0) / 3.5)}%** efficiency.`,
                "building"
              );
            } else {
              addBotMessage(
                `Please select a floor between 1 and ${buildingData.totalFloors}.`,
                "building"
              );
            }
          }
        } else if (inputLower.includes("all") || inputLower.includes("overview")) {
          addBotMessage(
            `🏢 **Building Overview**:\n\n` +
            `• Total Floors: ${buildingData.totalFloors}\n` +
            `• Total Electricity: ${buildingData.floors.reduce((sum, f) => sum + f.electricity, 0)} kW\n` +
            `• Average HVAC: ${Math.round(buildingData.floors.reduce((sum, f) => sum + f.hvac, 0) / buildingData.floors.length)}°C\n` +
            `• Overall Efficiency: **${buildingData.alignmentAfter}%**\n\n` +
            `Click on any floor to see detailed metrics.`,
            "building"
          );
        } else {
          addBotMessage(
            `You can ask me about specific floors (e.g., "Show floor 5") or get an overview.`,
            "building",
            ["Show all floors", "Floor 5", "Floor 10"]
          );
        }
      }

      scrollToBottom();
    }, 800);
  };

  const showAnalyticsFlow = () => {
    setCurrentStep("analytics");
    setAnimatingSection("analytics");
    
    // Step 1: Introduction
    setTimeout(() => {
      addBotMessage(
        `Great! Let me show you today's building performance metrics. 📊`,
        "analytics"
      );
    }, 300);

    // Step 2: Show initial metrics with animation
    setTimeout(() => {
      addBotMessage(
        `Here are the current metrics for ${buildingData.name}:`,
        "analytics",
        undefined,
        { showMetrics: true }
      );
    }, 1000);

    // Step 3: Show improvements
    setTimeout(() => {
      addBotMessage(
        `And here's what Synclo has achieved:`,
        "analytics",
        undefined,
        { showImprovements: true }
      );
    }, 2000);

    // Step 4: Ask about building view
    setTimeout(() => {
      addBotMessage(
        `Would you like to explore the building visualization?`,
        "analytics",
        ["Show building view", "More details"]
      );
      setAnimatingSection(null);
    }, 3200);
  };

  const showBuildingFlow = () => {
    setCurrentStep("building");
    setAnimatingSection("building");
    
    setTimeout(() => {
      addBotMessage(
        `Sure! Let me show you the ${buildingData.name} visualization. 🏢`,
        "building"
      );
    }, 300);

    setTimeout(() => {
      addBotMessage(
        `Click on any floor in the building view to see detailed metrics, or ask me about a specific floor.`,
        "building",
        ["Show all floors", "Floor 5", "Floor 10"]
      );
      setAnimatingSection(null);
    }, 1200);
  };

  if (!isLoaded || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Synclo</span>
                <p className="text-xs text-muted-foreground">{user.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/buildings">
                <button className="px-4 py-2 text-sm font-medium hover:text-green-600 transition-colors">
                  Building Types
                </button>
              </Link>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showChatbot ? "bg-green-600 text-white" : "hover:bg-muted"
                )}
                aria-label="Toggle chatbot"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("synclo_user");
                  router.push("/auth");
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold mb-2">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening at {buildingData.name} today
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Quick Stats */}
            <div className="space-y-4">
              {[
                { icon: Zap, label: "Electricity", value: `${totalMetrics.electricity} kW`, change: "-32%", color: "text-yellow-600" },
                { icon: Thermometer, label: "HVAC", value: `${totalMetrics.hvac}°C`, change: "+28%", color: "text-red-600" },
                { icon: Droplets, label: "Water", value: `${totalMetrics.water} L/min`, change: "-24%", color: "text-blue-600" },
                { icon: Wifi, label: "Network", value: "847 Mbps", change: "+12%", color: "text-purple-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-background rounded-2xl p-5 shadow-lg border hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                    <span className="text-xs font-semibold text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}

              {/* Before/After Chart */}
              <div className="bg-background rounded-2xl p-5 shadow-lg border">
                <h3 className="text-sm font-semibold mb-4">Impact of Synclo</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={beforeAfterData} layout="vertical" barSize={30}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {beforeAfterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Load-window alignment: {buildingData.alignmentBefore}% → {buildingData.alignmentAfter}%
                </p>
              </div>
            </div>

            {/* Center: Building Visualization */}
            <div className="lg:col-span-2 bg-background rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{buildingData.name}</h2>
                  <p className="text-sm text-muted-foreground">{buildingData.totalFloors} floors • Real-time monitoring</p>
                </div>
                <Link href="/buildings/office">
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full transition-all">
                    Full View
                  </button>
                </Link>
              </div>

              {/* Mini Building */}
              <div className="flex flex-col-reverse gap-1 items-center mb-6">
                {buildingData.floors.map((floor) => {
                  const isSelected = selectedFloor === floor.floor;
                  const efficiencyColor = floor.electricity > 300 ? "#ef4444" : floor.electricity > 250 ? "#f59e0b" : "#10b981";
                  return (
                    <button
                      key={floor.floor}
                      onClick={() => setSelectedFloor(isSelected ? null : floor.floor)}
                      className={cn(
                        "relative rounded-lg shadow-md overflow-hidden transition-all hover:scale-105",
                        isSelected ? "ring-2 ring-green-600 scale-105" : ""
                      )}
                      style={{
                        width: `${200 + (10 - floor.floor) * 10}px`,
                        height: "44px",
                        backgroundColor: efficiencyColor,
                      }}
                      aria-label={`Floor ${floor.floor}, Electricity ${floor.electricity} kW`}
                    >
                      <div className="h-full flex items-center justify-between px-4">
                        <span className="text-white font-bold drop-shadow-lg">{floor.floor}F</span>
                        <span className="text-white text-sm font-semibold drop-shadow-lg">{floor.electricity} kW</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Floor Details */}
              {selectedFloor && (
                <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="text-lg font-bold mb-4">Floor {selectedFloor} - Detailed Metrics</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    {(() => {
                      const floor = buildingData.floors.find(f => f.floor === selectedFloor);
                      if (!floor) return null;
                      const metrics = [
                        { key: "electricity", value: floor.electricity, unit: "kW", icon: Zap, color: "text-yellow-600" },
                        { key: "hvac", value: floor.hvac, unit: "°C", icon: Thermometer, color: "text-red-600" },
                        { key: "water", value: floor.water, unit: "L/min", icon: Droplets, color: "text-blue-600" },
                        { key: "lighting", value: floor.lighting, unit: "%", icon: TrendingUp, color: "text-green-600" },
                      ];
                      return metrics.map(m => (
                        <div key={m.key} className="bg-background rounded-xl p-4 shadow-md">
                          <m.icon className={cn("w-5 h-5 mb-2", m.color)} />
                          <div className="text-xs text-muted-foreground capitalize">{m.key}</div>
                          <div className="text-xl font-bold">{m.value} {m.unit}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-background rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="font-bold">Efficiency Score</h3>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">{buildingData.alignmentAfter}%</div>
              <p className="text-sm text-muted-foreground">
                Your building is operating at peak efficiency. Great job!
              </p>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="font-bold">Monthly Savings</h3>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">$12,450</div>
              <p className="text-sm text-muted-foreground">
                Estimated savings compared to last month
              </p>
            </div>

            <div className="bg-background rounded-2xl p-6 shadow-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-green-600" />
                <h3 className="font-bold">Next Optimization</h3>
              </div>
              <div className="text-xl font-bold text-green-600 mb-2">2:00 PM Today</div>
              <p className="text-sm text-muted-foreground">
                Scheduled HVAC optimization for floors 8-10
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      {showChatbot && (
        <div
          className="fixed bottom-6 right-6 w-96 bg-background rounded-2xl shadow-2xl border z-50 flex flex-col"
          style={{ maxHeight: "600px" }}
          role="dialog"
          aria-label="Synclo Assistant Chatbot"
        >
          {/* Chatbot Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Synclo Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: "300px" }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Show metrics card */}
                  {message.showMetrics && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-background/50 rounded-lg p-2">
                        <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                        <div className="text-xs text-muted-foreground">Electricity</div>
                        <div className="font-bold">{totalMetrics.electricity} kW</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2">
                        <Thermometer className="w-4 h-4 text-red-600 mb-1" />
                        <div className="text-xs text-muted-foreground">HVAC</div>
                        <div className="font-bold">{totalMetrics.hvac}°C</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2">
                        <Droplets className="w-4 h-4 text-blue-600 mb-1" />
                        <div className="text-xs text-muted-foreground">Water</div>
                        <div className="font-bold">{totalMetrics.water} L/min</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mb-1" />
                        <div className="text-xs text-muted-foreground">Lighting</div>
                        <div className="font-bold">{totalMetrics.lighting}%</div>
                      </div>
                    </div>
                  )}

                  {/* Show improvements card */}
                  {message.showImprovements && (
                    <div className="mt-3 space-y-2">
                      {[
                        { label: "Energy Reduction", value: "32%", icon: Zap },
                        { label: "HVAC Efficiency", value: "28%", icon: Thermometer },
                        { label: "Water Savings", value: "24%", icon: Droplets },
                        { label: "Lighting Costs", value: "35%", icon: TrendingUp },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-lg p-2">
                          <item.icon className="w-4 h-4 text-green-600" />
                          <span className="text-xs flex-1">{item.label}</span>
                          <span className="font-bold text-green-600">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Options buttons */}
                  {message.options && message.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                            message.role === "user"
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          )}
                        >
                          {option}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about floors, analytics..."
                className="flex-1 px-4 py-2.5 rounded-full border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accessibility: Live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {messages.length > 0 && `New message: ${messages[messages.length - 1].content}`}
      </div>
    </div>
  );
}