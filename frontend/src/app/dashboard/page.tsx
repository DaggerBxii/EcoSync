"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity, Sun, Moon, Building2, TrendingUp, DollarSign,
  Clock, Users, ArrowRight, MessageSquare, Send, X,
  BarChart3, Zap, Droplets, Thermometer, Wifi
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Label } from "recharts";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
  type?: "greeting" | "analytics" | "building" | "general";
}

interface FloorData {
  floor: number;
  electricity: number;
  hvac: number;
  water: number;
  lighting: number;
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

  useEffect(() => {
    setIsLoaded(true);
    const userData = localStorage.getItem("synclo_user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push("/auth");
    }
  }, [router]);

  useEffect(() => {
    if (isLoaded && user && messages.length === 0) {
      // Start conversation with greeting
      setTimeout(() => {
        addBotMessage(
          `Hello ${user.name.split(" ")[0]}! 👋 Welcome to Synclo. I'm your building intelligence assistant.`,
          "greeting"
        );
      }, 500);

      setTimeout(() => {
        addBotMessage(
          `Would you like to see the analytics for today?`,
          "greeting",
          ["Yes, show me analytics", "Skip to building view"]
        );
      }, 1500);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (content: string, type: ChatMessage["type"] = "general", options?: string[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content,
        timestamp: new Date(),
        type,
        options,
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

  const processUserInput = (input: string) => {
    setIsTyping(true);

    const inputLower = input.toLowerCase();

    // Simulate bot thinking
    setTimeout(() => {
      setIsTyping(false);

      if (currentStep === "greeting") {
        if (inputLower.includes("yes") || inputLower.includes("sure") || inputLower.includes("analytics")) {
          setCurrentStep("analytics");
          addBotMessage(
            "Great! Let me show you today's building performance metrics.",
            "analytics"
          );
          setTimeout(() => {
            addBotMessage(
              `These are the initial metrics for ${buildingData.name}:`,
              "analytics"
            );
          }, 800);
          setTimeout(() => {
            addBotMessage(
              `📊 **Electricity**: ${buildingData.floors.reduce((sum, f) => sum + f.electricity, 0)} kW total\n` +
              `🌡️ **HVAC**: ${Math.round(buildingData.floors.reduce((sum, f) => sum + f.hvac, 0) / buildingData.floors.length)}°C average\n` +
              `💧 **Water**: ${buildingData.floors.reduce((sum, f) => sum + f.water, 0)} L/min\n` +
              `💡 **Lighting**: ${Math.round(buildingData.floors.reduce((sum, f) => sum + f.lighting, 0) / buildingData.floors.length)}% brightness`,
              "analytics"
            );
          }, 1600);
          setTimeout(() => {
            addBotMessage(
              `And these are the metrics after using Synclo:\n\n` +
              `✅ Energy consumption reduced by **32%**\n` +
              `✅ HVAC efficiency improved by **28%**\n` +
              `✅ Water usage optimized by **24%**\n` +
              `✅ Lighting costs reduced by **35%**\n\n` +
              `Would you like to explore the building visualization?`,
              "analytics",
              ["Show building view", "More details"]
            );
          }, 2400);
        } else if (inputLower.includes("skip") || inputLower.includes("building")) {
          setCurrentStep("building");
          addBotMessage(
            `Sure! Let me show you the ${buildingData.name} visualization.`,
            "building"
          );
          setTimeout(() => {
            addBotMessage(
              `What floor would you like to examine?`,
              "building"
            );
          }, 800);
        } else {
          addBotMessage(
            "I can help you with building analytics, resource optimization, or show you the live building visualization. What would you like to explore?",
            "general",
            ["Show analytics", "Show building view"]
          );
        }
      } else if (currentStep === "analytics") {
        if (inputLower.includes("building") || inputLower.includes("show") || inputLower.includes("explore")) {
          setCurrentStep("building");
          addBotMessage(
            `Here's the real-time visualization of ${buildingData.name}.`,
            "building"
          );
          setTimeout(() => {
            addBotMessage(
              `What floor would you like to examine? Click on any floor or select from the list.`,
              "building"
            );
          }, 800);
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
    }, 600 + Math.random() * 400);
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
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className={`p-2 rounded-lg transition-colors ${showChatbot ? "bg-green-600 text-white" : "hover:bg-muted"}`}
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
                { icon: Zap, label: "Electricity", value: `${buildingData.floors.reduce((sum, f) => sum + f.electricity, 0)} kW`, change: "-32%", color: "text-yellow-600" },
                { icon: Thermometer, label: "HVAC", value: `${Math.round(buildingData.floors.reduce((sum, f) => sum + f.hvac, 0) / buildingData.floors.length)}°C`, change: "+28%", color: "text-red-600" },
                { icon: Droplets, label: "Water", value: `${buildingData.floors.reduce((sum, f) => sum + f.water, 0)} L/min`, change: "-24%", color: "text-blue-600" },
                { icon: Wifi, label: "Network", value: "847 Mbps", change: "+12%", color: "text-purple-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-background rounded-2xl p-5 shadow-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    <span className={`text-xs font-semibold ${stat.change.startsWith("-") ? "text-green-600" : "text-green-600"}`}>
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
                      className={`relative rounded-lg shadow-md overflow-hidden transition-all hover:scale-105 ${isSelected ? "ring-2 ring-green-600 scale-105" : ""}`}
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
                <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700">
                  <h4 className="text-lg font-bold mb-4">Floor {selectedFloor} - Detailed Metrics</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    {(Object.entries(buildingData.floors.find((f) => f.floor === selectedFloor) || {})).map(([key, value]) => {
                      if (key === "floor") return null;
                      const icons: Record<string, any> = {
                        electricity: Zap,
                        hvac: Thermometer,
                        water: Droplets,
                        lighting: TrendingUp,
                      };
                      const units: Record<string, string> = {
                        electricity: "kW",
                        hvac: "°C",
                        water: "L/min",
                        lighting: "%",
                      };
                      const Icon = icons[key] || Zap;
                      return (
                        <div key={key} className="bg-background rounded-xl p-4 shadow-md">
                          <Icon className="w-5 h-5 text-green-600 mb-2" />
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                          <div className="text-xl font-bold">{value} {units[key]}</div>
                        </div>
                      );
                    })}
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
                <MessageSquare className="w-5 h-5 text-white" />
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
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.options && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
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
