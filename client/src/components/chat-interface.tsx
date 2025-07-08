import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "@/lib/auth";
import { Message } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatInterfaceProps {
  height?: string;
  showHeader?: boolean;
}

export default function ChatInterface({ height = "h-96", showHeader = true }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/messages");
      return (await response.json()) as Message[];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await authenticatedFetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, role: "user" }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Card className={`flex flex-col ${height}`}>
      {showHeader && (
        <CardHeader className="border-b border-gray-200 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Document Assistant
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[#a8cb63] rounded-full"></div>
              <span className="text-sm text-gray-600">Ready</span>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 bpn-turquoise rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-white text-xl"></i>
              </div>
              <p className="text-gray-600">
                Hello! I'm your corporate document assistant. I can help you find information from your documents, answer questions, and provide insights. What would you like to know?
              </p>
            </div>
          </div>
        ) : (
          sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === "user" ? "bpn-green" : "bpn-turquoise"
              }`}>
                {msg.role === "user" ? (
                  <span className="text-white text-xs font-medium">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                ) : (
                  <i className="fas fa-robot text-white text-sm"></i>
                )}
              </div>
              <div className={`flex-1 max-w-md ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
              } rounded-lg px-4 py-3`}>
                <p className={`text-sm ${
                  msg.role === "user" ? "text-white" : "text-gray-800"
                }`}>
                  {msg.content}
                </p>
                {msg.sources && (
                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <i className="fas fa-file-pdf mr-1"></i>
                    Source: {Array.isArray(msg.sources) ? msg.sources.join(", ") : msg.sources}
                  </div>
                )}
                <div className={`mt-2 text-xs ${
                  msg.role === "user" ? "text-white text-opacity-70" : "text-gray-500"
                }`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask a question about your documents..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={sendMessageMutation.isPending || !message.trim()}
            className="bpn-turquoise hover:opacity-90"
          >
            <i className="fas fa-paper-plane"></i>
          </Button>
        </form>
      </div>
    </Card>
  );
}
