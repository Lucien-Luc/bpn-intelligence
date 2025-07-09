import ChatGPTSidebar from "@/components/chatgpt-sidebar";
import ChatGPTInterface from "@/components/chatgpt-interface";

export default function ChatGPTMain() {
  return (
    <div className="flex h-screen bg-gray-100">
      <ChatGPTSidebar />
      <div className="flex-1 flex flex-col">
        <ChatGPTInterface />
      </div>
    </div>
  );
}