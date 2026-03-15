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
  Building2,
  Lightbulb,
  Gauge,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: string;
}

export default function ChatbotPage() {
  const { theme, setTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to initialize chatbot:", error);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! I'm EcoSync Assistant, your building resource management AI. I can help you monitor and optimize energy usage, water consumption, and other building resources. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
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
        console.log("Chatbot response:", data);
        if (data.success) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            type: data.type,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          throw new Error(data.error || "Backend returned success: false");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Chatbot API error:", response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    initializeChatbot();
  };

  // Function to determine icon based on message type
  const getMessageIcon = (type: string | undefined) => {
    switch (type) {
      case 'control':
        return <Building2 className="w-5 h-5" />;
      case 'query':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
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
              <span className="text-xl font-bold">EcoSync</span>
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
                    getMessageIcon(message.type)
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

                  {/* Resource Control Indicators */}
                  {message.type === 'control' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <Gauge className="w-3 h-3" />
                        <span>Resource Control Command Executed</span>
                      </div>
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
                  <span className="text-sm">Processing your request...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

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
                  placeholder="Ask about building resources, efficiency, or control systems (e.g. 'Limit water on floor 2 to 60%')..."
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
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => sendMessage("Show building efficiency")}
                  className="text-xs px-3 py-1.5 rounded-full bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-300 transition-colors"
                >
                  Show efficiency
                </button>
                <button
                  onClick={() => sendMessage("Limit water on floor 2 to 60%")}
                  className="text-xs px-3 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300 transition-colors"
                >
                  Limit water (floor 2)
                </button>
                <button
                  onClick={() => sendMessage("Turn off lights on floor 5")}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 dark:text-purple-300 transition-colors"
                >
                  Turn off lights (floor 5)
                </button>
                <button
                  onClick={() => sendMessage("Set HVAC to 22°C")}
                  className="text-xs px-3 py-1.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 dark:text-orange-300 transition-colors"
                >
                  Set HVAC (22°C)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}