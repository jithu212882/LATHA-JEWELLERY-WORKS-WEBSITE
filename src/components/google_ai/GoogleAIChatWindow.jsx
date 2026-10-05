import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Phone,
  Layers,
  Palette,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { sendGoogleAIChatMessage } from '../../services/googleAIService.js';
import './google-ai.css';

const SUGGESTED_QUESTIONS = [
  {
    icon: Coins,
    text: "What are today's gold rates?",
  },
  {
    icon: Layers,
    text: 'What jewellery collections do you have?',
  },
  {
    icon: Palette,
    text: 'Do you provide custom jewellery?',
  },
  {
    icon: ShieldCheck,
    text: 'What is your BIS Hallmark assurance?',
  },
  {
    icon: MapPin,
    text: 'Where is Latha Jewellery Works located?',
  },
  {
    icon: Phone,
    text: 'How can I contact the atelier?',
  },
];

const INITIAL_WELCOME = {
  id: 'google-ai-init',
  role: 'assistant',
  text: `Namaste and welcome to **Latha Jewellery Works**.\n\nI am your **Google AI Studio Concierge**, powered by Google Gemini and grounded in our 35-year legacy of handcrafted 22K (916) BIS hallmarked gold and silver artistry in Nadaikavu, Tamil Nadu.\n\nHow may I assist you today? You can ask about **today's verified gold rates**, our **bridal collections**, **bespoke custom orders**, or **store visiting hours**.`,
  timestamp: 'Just now',
};

export default function GoogleAIChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveRates, setLiveRates] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch verified rates on mount
  useEffect(() => {
    fetch('/api/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates) {
          setLiveRates(data.rates);
        } else if (data?.price_22k) {
          setLiveRates({
            gold22k: { ratePerGram: data.rate_22k || '12,256' },
            gold24k: { ratePerGram: data.rate_24k || '13,370' }
          });
        }
      })
      .catch((err) => {
        console.warn('[GoogleAI] Live rates fetch notice:', err.message);
      });
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSend = async (messageText) => {
    const query = (messageText || '').trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          text: typeof m.text === 'string' ? m.text : '',
        }));

      const result = await sendGoogleAIChatMessage(query, historyPayload);

      const botMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: (result && typeof result.reply === 'string')
          ? result.reply
          : "I'm unable to process that request right now. Please connect with our atelier directly at +91 9487056064.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: result?.source || 'google_ai_studio',
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('[GoogleAI] Chat error:', err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'We apologize for the momentary interruption. Our atelier team is gladly available at +91 9487056064 (Phone/WhatsApp).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_WELCOME]);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Google AI Studio Atelier Concierge Window"
      className="fixed inset-x-3 bottom-22 sm:bottom-24 sm:left-1/2 sm:-translate-x-1/2 sm:w-[390px] h-[560px] max-h-[calc(100vh-120px)] rounded-2xl google-ai-chat-glass flex flex-col z-50 overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* Luxury Header */}
      <div className="px-4 py-3 bg-[#13141d]/90 border-b border-[#c5a059]/25 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a059] to-[#8c6d23] p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-full bg-[#12131a] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#d4af37] border-2 border-[#151722]"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm sm:text-base font-semibold tracking-wide text-[#fdfbf7]">
                Google AI Concierge
              </h3>
              <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#e5c158] border border-[#c5a059]/30">
                Gemini
              </span>
            </div>
            <div className="text-[10px] text-[#c5a059]/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
              <span>Grounded in Latha Atelier Records</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-[#d4af37] transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            aria-label="Close Google AI Concierge"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Live Gold Rate Mini Ticker Banner */}
      {liveRates && (
        <div className="bg-[#181a24] px-3.5 py-2 border-b border-[#c5a059]/15 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-[#d4af37]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium text-[10px] sm:text-[11px]">Live Rates:</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 font-mono text-[10px] sm:text-[11px]">
            <span>22K: <strong className="text-[#f5f2eb]">₹{liveRates.gold22k?.ratePerGram || liveRates['22K'] || '12,256'}</strong>/g</span>
            <span className="text-gray-600">|</span>
            <span>24K: <strong className="text-[#f5f2eb]">₹{liveRates.gold24k?.ratePerGram || liveRates['24K'] || '13,370'}</strong>/g</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="google-ai-chat-scroll flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-[#0f1017]/85 text-sm">
        {messages.flat(Infinity).filter(Boolean).map((msg) => {
          const rawText = typeof msg === 'string' ? msg : msg?.text || '';
          return (
            <div
              key={msg.id || Math.random()}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 leading-relaxed text-xs sm:text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#b38b2d] to-[#997321] text-[#0b0c10] font-medium rounded-tr-none shadow-md'
                    : msg.isError
                    ? 'bg-red-950/40 text-red-200 border border-red-800/40 rounded-tl-none'
                    : 'bg-[#181a25] text-[#ede9df] border border-[#c5a059]/20 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Formatted body */}
                <div className="space-y-1.5 whitespace-pre-line text-xs sm:text-[13px]">
                  {rawText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph.startsWith('• ') || paragraph.startsWith('1.') ? (
                        <span className="block pl-2 border-l-2 border-[#d4af37]/40 my-1 font-normal">
                          {paragraph}
                        </span>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>

                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-1.5 border-t border-[#c5a059]/10 flex items-center justify-between text-[10px] text-[#c5a059]/70">
                    <span className="flex items-center gap-1 font-serif tracking-wider">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#d4af37]" />
                      Google AI • Verified
                    </span>
                    <span>{msg.timestamp || 'Now'}</span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
              )}
            </div>
          );
        })}

        {/* Loading state with gold shimmer */}
        {isLoading && (
          <div className="flex items-start gap-2 animate-in fade-in">
            <div className="bg-[#181a25] border border-[#c5a059]/30 rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] google-ai-chat-shimmer-bg">
              <div className="flex items-center gap-2 text-xs text-[#d4af37]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="font-serif italic tracking-wide">Consulting Gemini & atelier records...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-3 py-2 bg-[#14151f] border-t border-[#c5a059]/15">
        <div className="text-[9px] uppercase font-semibold tracking-wider text-[#c5a059]/70 mb-1 px-1">
          Suggested Inquiries:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTED_QUESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend(item.text);
                }}
                disabled={isLoading}
                className="whitespace-nowrap flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1b1e2b] hover:bg-[#252839] border border-[#c5a059]/30 hover:border-[#d4af37] text-[11px] text-[#ede9df] transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-[#d4af37]" />
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSend(input);
        }}
        className="p-2.5 sm:p-3 bg-[#161824] border-t border-[#c5a059]/25 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              handleSend(input);
            }
          }}
          placeholder="Ask about collections, rates, custom orders..."
          disabled={isLoading}
          className="flex-1 bg-[#0e0f16] text-[#fdfbf7] placeholder-gray-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#c5a059]/30 focus:outline-none focus:border-[#d4af37] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl google-ai-chat-gold-button disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shrink-0 shadow-md"
          aria-label="Send query"
        >
          <Send className="w-4 h-4 text-[#0b0c10]" />
        </button>
      </form>

      {/* Luxury Footer Disclaimer */}
      <div className="bg-[#101118] px-3 py-1.5 border-t border-[#c5a059]/10 text-[9px] text-gray-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
          Verified Nadaikavu Atelier Grounding
        </span>
        <span className="font-serif italic text-[#c5a059]">Google AI Studio</span>
      </div>
    </div>
  );
}
