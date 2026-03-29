"use client";

import { useState, useRef, useEffect } from "react";
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Send, X, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
}

export function InvenIqWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "system-1",
            role: "model",
            content: "Hello! I am InvenIQ, your intelligent inventory assistant. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isTyping = input.trim().length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput("");
        
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, { id: tempId, role: "user", content: userText }]);
        setIsLoading(true);

        try {
            const response = await axios.post('/pulse-iq/chat', {
                message: userText,
                conversation_id: conversationId
            });

            if (response.data.conversation_id) {
                setConversationId(response.data.conversation_id);
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: response.data.message
            }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: "I'm having trouble connecting to my intelligence network right now. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Panel */}
            <div className={cn(
                "mb-4 overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right",
                isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-90 opacity-0 pointer-events-none absolute bottom-16 right-0"
            )}>
                <div className="w-[380px] h-[550px] max-h-[80vh] bg-[#01110A]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-emerald-500/20">
                    
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-emerald-900/60 to-transparent border-b border-white/10 flex items-center justify-between relative overflow-hidden">
                        {isLoading && <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>}
                        <div className="flex items-center space-x-3 z-10">
                            {/* Dynamic Avatar */}
                            <div className={cn(
                                "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500",
                                isLoading ? "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse" : 
                                isTyping ? "bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110" : 
                                "bg-gradient-to-tr from-emerald-900/80 to-emerald-800/40 shadow-sm border border-emerald-500/20"
                            )}>
                                {/* Inner Rotating Ring when loading */}
                                {isLoading && <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-white/30 border-l-transparent animate-spin z-20"></div>}
                                
                                <div className={cn(
                                    "relative rounded-full overflow-hidden flex items-center justify-center transition-all duration-500 z-10",
                                    isLoading ? "w-[26px] h-[26px] animate-bounce shadow-[0_0_15px_#10b981]" : 
                                    isTyping ? "w-[32px] h-[32px] scale-105 shadow-[0_0_10px_#34d399]" : 
                                    "w-[28px] h-[28px] shadow-sm"
                                )}>
                                    <Image src="/pulseiq-mascot.png" alt="InvenIQ" fill className="object-cover" sizes="32px" />
                                </div>
                                
                                {/* Ping ring when idle/typing */}
                                {!isLoading && <div className={cn("absolute inset-0 rounded-full border border-emerald-500/50 animate-ping", isTyping ? "opacity-40" : "opacity-10 duration-1000")}></div>}
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="font-bold text-[18px] tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                                    InvenIQ 
                                    {isLoading && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>}
                                </h3>
                                <p className={cn(
                                    "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors",
                                    isLoading ? "text-emerald-300 animate-pulse" : 
                                    isTyping ? "text-teal-300" : 
                                    "text-emerald-500/80"
                                )}>
                                    {isLoading ? "Analyzing Inventory..." : isTyping ? "Listening..." : "Inventory Intelligence"}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 z-10">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[88%] rounded-2xl px-5 py-3.5 text-[15px] font-medium leading-[1.6] tracking-wide shadow-lg",
                                    msg.role === 'user' 
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_15px_rgba(16,185,129,0.25)] rounded-br-sm border border-emerald-400/30" 
                                        : "bg-[#012415]/80 backdrop-blur-md text-emerald-50 border border-emerald-700/50 rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                                )}>
                                    {/* Format bold text from markdown thoroughly */}
                                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold tracking-normal drop-shadow-sm">$1</strong>')}}></div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted/50 border border-white/5 rounded-tl-sm flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-background/50 backdrop-blur-md border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask InvenIQ anything..."
                                className="w-full bg-[#022A18]/60 border border-emerald-700/50 rounded-full px-5 py-3.5 text-[15px] font-medium tracking-wide text-white placeholder:text-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 pr-14 transition-all shadow-inner"
                                disabled={isLoading}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={cn(
                                    "absolute right-2 p-2.5 rounded-full transition-all duration-300",
                                    isTyping ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105" : "bg-emerald-900/40 text-emerald-600",
                                    "disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                                )}
                            >
                                <Send size={18} className={cn(isTyping && "translate-x-0.5 -translate-y-0.5 transition-transform")} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-[#01110A] text-white shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 border border-emerald-500/20 overflow-hidden"
            >
                {isOpen ? <X size={26} strokeWidth={2.5} className="z-20 relative text-emerald-100" /> : (
                    <div className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-500 z-10">
                        <Image src="/pulseiq-mascot.png" alt="InvenIQ" fill className="object-cover" sizes="64px" priority />
                    </div>
                )}
                
                {/* Outer Glow backing */}
                {!isOpen && (
                    <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping group-hover:opacity-0"></div>
                )}
            </button>
        </div>
    );
}
