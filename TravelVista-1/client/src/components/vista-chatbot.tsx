import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Compass, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

const STARTER_PROMPTS = [
  "How to build custom package?",
  "Recommend a hotel in Bali",
  "Suggest a flight to Paris",
  "Contact and support details"
];

const VistaChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hi! 👋 Welcome to TravelVista! I'm **VistaAI**, your personal travel planner.\n\nI can recommend destinations, hotels, flights, and help you build a custom package (with a 15% discount!). How can I help you today?"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const chatMutation = useMutation({
    mutationFn: async (payload: { message: string; history: any[] }) => {
      const response = await apiRequest("POST", "/api/chat", payload);
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "model",
          text: data.reply
        }
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-error-${Date.now()}`,
          role: "model",
          text: "Sorry, I ran into a connection issue. Please try asking again."
        }
      ]);
    }
  });

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare history format for the API call
    const apiHistory = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    chatMutation.mutate({
      message: textToSend,
      history: apiHistory
    });
  };

  const renderMessageContent = (text: string) => {
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    // Replace bold tags and line breaks for HTML parsing
    let formattedText = text
      .replace(boldRegex, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");

    const parts = [];
    let lastIndex = 0;
    let match;

    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        const textSegment = formattedText.substring(lastIndex, matchIndex);
        parts.push(
          <span 
            key={`text-${lastIndex}`} 
            dangerouslySetInnerHTML={{ __html: textSegment.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "") }} 
          />
        );
      }

      const [fullMatch, linkText, linkUrl] = match;
      if (linkUrl.startsWith("/")) {
        parts.push(
          <Link key={`link-${matchIndex}`} href={linkUrl} onClick={() => setIsOpen(false)} className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5">
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a key={`link-${matchIndex}`} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5">
            {linkText}
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      const remainingText = formattedText.substring(lastIndex);
      if (parts.length === 0) {
        return <span dangerouslySetInnerHTML={{ __html: remainingText }} />;
      }
      parts.push(
        <span 
          key={`text-${lastIndex}`} 
          dangerouslySetInnerHTML={{ __html: remainingText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "") }} 
        />
      );
    }

    return parts;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-travel-blue hover:bg-travel-dark-blue text-white shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 animate-bounce"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <Card className="w-[360px] sm:w-[380px] h-[500px] shadow-2xl rounded-2xl overflow-hidden border border-gray-150 flex flex-col bg-white">
          {/* Chat Header */}
          <CardHeader className="bg-gradient-to-r from-travel-blue to-travel-dark-blue text-white p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2.5">
              <div className="bg-white/20 p-1.5 rounded-xl">
                <Compass className="h-5 w-5 text-white animate-spin-slow" />
              </div>
              <div>
                <CardTitle className="text-sm font-extrabold flex items-center gap-1.5">
                  VistaAI Assistant
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </CardTitle>
                <p className="text-[10px] text-blue-100 font-semibold mt-0.5">Powered by Gemini AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-travel-blue text-white rounded-tr-none font-medium"
                      : "bg-white border border-gray-100 text-gray-800 rounded-tl-none font-medium"
                  }`}
                >
                  {renderMessageContent(msg.text)}
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs shadow-sm flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-travel-blue animate-pulse" />
                  <span>VistaAI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Suggestion Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Common Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] bg-white text-gray-600 hover:text-travel-blue border border-gray-150 hover:border-travel-blue rounded-xl px-2.5 py-1 transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 border-t bg-white flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask about hotels, flights, itineraries..."
              className="flex-grow rounded-xl text-xs border-gray-250 focus:border-travel-blue focus:ring-1 focus:ring-travel-blue"
            />
            <Button
              onClick={() => handleSend(input)}
              disabled={chatMutation.isPending || !input.trim()}
              className="bg-travel-blue hover:bg-travel-dark-blue text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shadow"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VistaChatbot;
