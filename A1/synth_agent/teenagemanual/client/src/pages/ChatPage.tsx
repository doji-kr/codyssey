import { useParams, Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  const { data: device, isLoading: deviceLoading } = trpc.devices.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.ask.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !device?.id || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        deviceId: device.id,
        question: input,
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (deviceLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-32 mb-8" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Device not found</h1>
          <Link href="/">
            <a>
              <Button>Back to home</Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-black hover:opacity-80">
              teenage manual
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{device.displayName}</span>
            <Link href={`/${slug}`}>
              <a className="text-sm text-gray-600 hover:text-black">Back</a>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-6 mb-6 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Ask anything about your {device.displayName}</h2>
                <p className="text-gray-600 mb-4">
                  Get instant, grounded answers based on the official manual.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Example questions:</p>
                  <ul className="space-y-1">
                    <li>• How do I sample a sound?</li>
                    <li>• How do I use the effects?</li>
                    <li>• How do I connect MIDI devices?</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900 border border-gray-200"
                }`}
              >
                {message.role === "assistant" ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 sticky bottom-0 bg-white pt-4">
          <Input
            type="text"
            placeholder="Ask about sampling, effects, MIDI, sequencing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
