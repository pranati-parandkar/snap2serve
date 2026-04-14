import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Loader2, MinusCircle } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { Recipe } from '../types';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  currentRecipe: Recipe | null;
}

export const ChatBot: React.FC<ChatBotProps> = ({ currentRecipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi there! I'm your Snap2Serve assistant. How can I help you cook something amazing today? 🍳" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail) {
        setInput(e.detail);
        // We don't automatically send to avoid surprising the user, 
        // but we could if we wanted to.
      }
    };

    window.addEventListener('open-chatbot', handleOpenChat);
    return () => window.removeEventListener('open-chatbot', handleOpenChat);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await getChatResponse(userMessage, chatHistory, {
        recipe: currentRecipe || undefined,
        appInfo: "Snap2Serve is an AI-powered recipe discovery app."
      });

      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "bg-white rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col mb-4 transition-all duration-300",
              "w-[350px] md:w-[400px]"
            )}
          >
            {/* Header */}
            <div className={cn(
              "bg-cute-pink px-4 flex items-center justify-between text-white transition-all",
              isMinimized ? "h-full" : "py-4"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Snap2Serve AI</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-50/30">
                  {messages.map((m, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                        m.role === 'user' ? "bg-cute-blue text-white" : "bg-white text-cute-pink"
                      )}>
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        m.role === 'user' 
                          ? "bg-cute-blue text-white rounded-tr-none" 
                          : "bg-white text-brand-900 rounded-tl-none border border-brand-100"
                      )}>
                        {m.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-cute-pink flex items-center justify-center shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-brand-100 shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin text-cute-pink" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-brand-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="w-full pl-6 pr-14 py-4 bg-brand-50 rounded-2xl border-2 border-transparent focus:border-cute-pink focus:bg-white outline-none transition-all text-sm font-medium"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-cute-pink text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-4 border-white",
          isOpen ? "bg-white text-cute-pink" : "bg-cute-pink text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && (
          <span className="w-full mt-4 bg-cute-blue text-white py-6 rounded-full font-bold text-xl relative flex flex-col items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-cute-blue/20" />
        )}
      </motion.button>
    </div>
  );
};
