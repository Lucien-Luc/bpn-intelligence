import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { type Message } from "@shared/schema";

export default function ChatGPTInterface() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
      setIsTyping(true);
      
      // Simulate AI response delay
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00728e] to-[#005a70] rounded-full flex items-center justify-center">
            <i className="fas fa-brain text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">BPN Intelligence</h1>
            <p className="text-sm text-gray-500">Business AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00728e] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to BPN Intelligence
              </h2>
              <p className="text-gray-600">
                Your Business AI Assistant is ready to help you analyze documents, 
                generate insights, and support strategic decision-making.
              </p>
            </div>
          </div>
        ) : (
          <>
            {sortedMessages.map((msg: Message) => (
              <div key={msg.id} className="chat-message">
                <div className={`flex items-start space-x-3 ${
                  msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" 
                      ? "bg-[#00728e] text-white" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {msg.role === "user" ? (
                      <span className="text-sm font-medium">
                        {authService.getInitials()}
                      </span>
                    ) : (
                      <i className="fas fa-brain text-sm"></i>
                    )}
                  </div>
                  <div className={`chat-bubble max-w-2xl ${
                    msg.role === "user" 
                      ? "bg-[#00728e] text-white" 
                      : "bg-gray-50 text-gray-800"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="chat-message">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-brain text-gray-600 text-sm"></i>
                  </div>
                  <div className="chat-bubble bg-gray-50 text-gray-800 max-w-2xl">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Message BPN Intelligence..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
            className="flex-1 chat-input"
          />
          <Button
            type="submit"
            disabled={sendMessageMutation.isPending || !message.trim()}
            className="bg-[#00728e] hover:bg-[#005a70] text-white px-4 py-2 rounded-lg transition-colors"
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}