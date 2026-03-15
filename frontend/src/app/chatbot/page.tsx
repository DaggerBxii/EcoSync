"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Activity,
  ArrowLeft,
  Send,
  Bot,
  User,
  BarChart3,
  Zap,
  Droplets,
  Thermometer,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  graph?: string;
  options?: string[];
  report_data?: ReportData;
}

interface ReportData {
  date: string;
  electricity_usage: number;
  water_usage: number;
  hvac_usage: number;
  lighting_usage: number;
  electricity_efficiency: number;
  water_efficiency: number;
  hvac_efficiency: number;
  lighting_efficiency: number;
  recommendations: string[];
  peak_hours: Record<string, number>;
}

export default function ChatbotPage() {
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = "chatbot_user_" + (typeof window !== "undefined" ? localStorage.getItem("chatbot_id") || (() => {
    const id = Math.random().toString(36).substring(7);
    localStorage.setItem("chatbot_id", id);
    return id;
  })() : "default");

  useEffect(() => {
    // Initialize chatbot session
    initializeChatbot();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChatbot = async () => {
    try {
      const response = await fetch(`/api/chatbot/init?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: data.response,
              timestamp: new Date(),
              options: data.options,
            },
          ]);
          setCurrentOptions(data.options || []);
        }
      }
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm Synclo Assistant, your building resource management AI. I can help you monitor and optimize energy usage, water consumption, and other building resources. How can I help you today?",
          timestamp: new Date(),
          options: ["Show today's report", "Energy usage", "Efficiency tips", "Optimization recommendations"],
        },
      ]);
      setCurrentOptions(["Show today's report", "Energy usage", "Efficiency tips", "Optimization recommendations"]);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentOptions([]);

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: messageText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            options: data.options,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setCurrentOptions(data.options || []);
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentOptions(["Try again", "Main menu"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    sendMessage(option);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setReportData(null);
    initializeChatbot();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Synclo</span>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={resetChat}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Reset chat"
                title="Reset chat"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
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
      <main className="flex-1 pt-16 flex flex-col">
        <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-4",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl p-4",
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Graph/Image */}
                  {message.graph && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      <img
                        src={`data:image/png;base64,${message.graph}`}
                        alt="Resource usage graph"
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {/* Report Data Visualization */}
                  {message.report_data && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-background/50 rounded-lg p-3">
                        <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                        <div className="text-xs opacity-70">Electricity</div>
                        <div className="font-bold">{message.report_data.electricity_usage} kW</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <Droplets className="w-4 h-4 text-blue-600 mb-1" />
                        <div className="text-xs opacity-70">Water</div>
                        <div className="font-bold">{message.report_data.water_usage} L/min</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <Thermometer className="w-4 h-4 text-red-600 mb-1" />
                        <div className="text-xs opacity-70">HVAC</div>
                        <div className="font-bold">{message.report_data.hvac_usage}°C</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <TrendingUp className="w-4 h-4 text-green-600 mb-1" />
                        <div className="text-xs opacity-70">Lighting</div>
                        <div className="font-bold">{message.report_data.lighting_usage}%</div>
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          disabled={isLoading}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            message.role === "user"
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={cn(
                      "text-xs mt-2 opacity-60",
                      message.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-muted rounded-2xl p-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Current Options Bar (if available) */}
          {currentOptions.length > 0 && !isLoading && (
            <div className="border-t bg-background/50 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-xs text-muted-foreground mb-2">Quick responses:</div>
                <div className="flex flex-wrap gap-2">
                  {currentOptions.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t bg-background/50 backdrop-blur-sm p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about building resources, efficiency, or optimization..."
                  className="flex-1 px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
