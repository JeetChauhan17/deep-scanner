import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Progress } from "@/components/ui/progress";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const extractConfidence = (content: string): number | null => {
  const match = content.match(/\[CONFIDENCE:\s*(\d+)%\]/i);
  return match ? parseInt(match[1]) : null;
};

const removeConfidenceTag = (content: string): string => {
  return content.replace(/\[CONFIDENCE:\s*\d+%\]\s*/gi, '');
};

export const ChatInterface = ({ messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center glow-subtle">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-xl mb-2">Ready to assist</h3>
                <p className="text-sm text-muted-foreground">
                  Ask me to scan a URL, check for phishing, or answer security questions.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-primary/10 border border-primary/20'
                      : 'glass-card border border-border'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      {(() => {
                        const confidence = extractConfidence(message.content);
                        const cleanContent = removeConfidenceTag(message.content);
                        return (
                          <>
                            {confidence !== null && (
                              <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Confidence Score</span>
                                  <span className="text-sm font-bold text-primary">{confidence}%</span>
                                </div>
                                <Progress value={confidence} className="h-2" />
                              </div>
                            )}
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h3: ({node, ...props}) => <h3 className="text-base font-heading font-bold mt-4 mb-2 text-foreground" {...props} />,
                                  p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3 text-foreground" {...props} />,
                                  ul: ({node, ...props}) => <ul className="text-sm space-y-1 mb-3" {...props} />,
                                  li: ({node, ...props}) => <li className="text-sm text-foreground" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                                  code: ({node, ...props}) => <code className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono" {...props} />,
                                  a: ({node, ...props}) => <a className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground" {...props} />,
                                }}
                              >
                                {cleanContent}
                              </ReactMarkdown>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="glass-card border border-border rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about security or scan a URL..."
              disabled={isLoading}
              className="pr-12 h-12 bg-background/50 border-border focus:border-primary transition-colors rounded-full"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 glow-purple"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
