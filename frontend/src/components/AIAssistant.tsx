"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Send, X, Sparkles, ChevronRight, Zap, Thermometer,
  Droplets, TrendingUp, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  options?: string[];
  type?: "greeting" | "analytics" | "building" | "control" | "general";
  controlResult?: ControlResult;
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

interface ControlResult {
  success: boolean;
  resourcesAffected: string[];
  previousValues: Record<string, number>;
  newValues: Record<string, number>;
  estimatedImpact?: string;
}

interface AIAssistantProps {
  buildingName?: string;
  currentFloor?: number | null;
  totalFloors?: number;
  onControlExecuted?: (result: ControlResult) => void;
  className?: string;
  inline?: boolean;
}

export default function AIAssistant({
  buildingName = "Synclo Tower",
  currentFloor = null,
  totalFloors = 10,
  onControlExecuted,
  className = "",
  inline = false,
}: AIAssistantProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      setTimeout(() => {
        addBotMessage(
          `Hello! I'm your AI building assistant. 🏢\n\nI can help you control resources using natural language. Try saying things like:\n\n• "Limit water usage on floor 2 to 60%"\n• "Turn off lights on floor 5"\n• "Set HVAC to 22°C on all floors"\n• "Optimize electricity"\n\nWhat would you like to do?`,
          "greeting",
          ["Show analytics", "Optimize all floors", "What can you do?"]
        );
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (
    content: string,
    type: ChatMessage["type"] = "general",
    options?: string[],
    extras?: Partial<ChatMessage>
  ) => {
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
    processMessage(option);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    addUserMessage(inputValue);
    processMessage(inputValue);
    setInputValue("");
  };

  const processMessage = async (message: string) => {
    setIsTyping(true);

    try {
      // Send to natural language control endpoint
      const response = await fetch(`${apiUrl}/api/control/natural`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context: {
            building_name: buildingName,
            current_floor: currentFloor,
            total_floors: totalFloors,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process command");
      }

      const data = await response.json();

      setIsTyping(false);

      // Check if clarification is needed
      if (data.needs_clarification) {
        addBotMessage(
          data.clarification_question || "Could you please clarify?",
          "general",
          ["Floor 1", "Floor 2", "Floor 3", "All floors"]
        );
        return;
      }

      // Build the response message
      const controlResult: ControlResult = {
        success: data.success,
        resourcesAffected: data.resources_affected || [],
        previousValues: data.previous_values || {},
        newValues: data.new_values || {},
        estimatedImpact: data.estimated_impact,
      };

      addBotMessage(
        data.message,
        "control",
        data.success ? ["Show changes", "More actions"] : ["Try again", "Help"],
        { controlResult }
      );

      // Notify parent component
      if (data.success && onControlExecuted) {
        onControlExecuted(controlResult);
      }

    } catch (error) {
      setIsTyping(false);
      addBotMessage(
        "I'm sorry, I couldn't process that command. Please try again or check if the backend is running.",
        "general",
        ["Help", "Try again"]
      );
    }

    scrollToBottom();
  };

  const renderControlResult = (result: ControlResult) => {
    if (!result.success) return null;

    return (
      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            Changes Applied
          </span>
        </div>
        <div className="space-y-1 text-sm">
          {Object.entries(result.newValues).slice(0, 3).map(([resourceId, newValue]) => {
            const prevValue = result.previousValues[resourceId] || 0;
            const change = newValue - prevValue;
            const changeSymbol = change < 0 ? "↓" : change > 0 ? "↑" : "→";
            return (
              <div key={resourceId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{resourceId.replace(/_/g, " ")}</span>
                <span>
                  {prevValue.toFixed(1)} → {newValue.toFixed(1)} {changeSymbol}
                </span>
              </div>
            );
          })}
        </div>
        {result.estimatedImpact && (
          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            📊 {result.estimatedImpact}
          </p>
        )}
      </div>
    );
  };

  // Floating button mode
  if (!inline) {
    return (
      <>
        {/* Floating button */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all",
            "bg-gradient-to-br from-green-600 to-green-400 text-white",
            "hover:shadow-xl hover:scale-105",
            isOpen && "hidden",
            className
          )}
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        {/* Chat window */}
        {isOpen && (
          <div
            className="fixed bottom-6 right-6 w-96 bg-background rounded-2xl shadow-2xl border z-50 flex flex-col"
            style={{ maxHeight: "600px" }}
            role="dialog"
            aria-label="AI Assistant Chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">{buildingName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
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

                    {/* Control result visualization */}
                    {message.controlResult && renderControlResult(message.controlResult)}

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
                  placeholder="e.g., 'limit water on floor 2 to 60%'"
                  className="flex-1 px-4 py-2.5 rounded-full border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
                  aria-label="Chat input"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </>
    );
  }

  // Inline mode (embedded in page)
  return (
    <div className={cn("bg-background rounded-2xl border flex flex-col", className)} style={{ minHeight: "400px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold">AI Building Assistant</h3>
          <p className="text-xs text-muted-foreground">Control resources with natural language</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                message.role === "user" ? "bg-green-600 text-white" : "bg-muted"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {message.controlResult && renderControlResult(message.controlResult)}

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
            placeholder="e.g., 'limit water on floor 2 to 60%'"
            className="flex-1 px-4 py-2.5 rounded-full border bg-background focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full transition-colors"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}