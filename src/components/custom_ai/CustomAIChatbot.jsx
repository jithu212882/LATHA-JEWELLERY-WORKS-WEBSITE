import React, { useState, useEffect } from 'react';
import CustomAIChatButton from './CustomAIChatButton';
import CustomAIChatWindow from './CustomAIChatWindow';
import CustomAIChatErrorBoundary from './CustomAIChatErrorBoundary';
import { sendChatMessage } from '../../services/customAIService';
import { useData } from '../../context/DataContext';

const INITIAL_WELCOME = {
  id: 'welcome-1',
  sender: 'assistant',
  text: "Vanakkam! Welcome to Latha Jewellery Works (Established 1990 in Nadaikavu, Tamil Nadu). I am your Atelier Concierge.\n\nHow may I assist you today? You can ask about today's live 22K/24K/18K bullion rates, our handcrafted bridal and temple collections, custom design orders, or store visiting hours.",
  timestamp: new Date().toISOString()
};

const DEFAULT_ERROR_TEXT =
  "I'm unable to process that request right now. Please try again or connect directly with our master goldsmiths on WhatsApp at +91 9487056064.";

function CustomAIChatbotInner() {
  const { gold_rates, categories, jewellery_models } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnAdminPage, setIsOnAdminPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setIsOnAdminPage(true);
    }
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  };

  const handleSend = async (userText) => {
    const cleanUserText = typeof userText === 'string' ? userText.trim() : '';
    if (!cleanUserText || isLoading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: cleanUserText,
      timestamp: new Date().toISOString()
    };

    // Safely append user message (flat array safeguard)
    setMessages((prev) => {
      const currentList = Array.isArray(prev) ? prev.flat() : [];
      return [...currentList, userMessage];
    });

    setIsLoading(true);

    try {
      const currentSnapshot = Array.isArray(messages) ? messages.flat() : [];
      const result = await sendChatMessage(cleanUserText, currentSnapshot, gold_rates);

      const replyText = (result && typeof result.reply === 'string' && result.reply.trim())
        ? result.reply.trim()
        : DEFAULT_ERROR_TEXT;

      const botMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
        isGrounded: Boolean(result?.grounded)
      };

      setMessages((prev) => {
        const currentList = Array.isArray(prev) ? prev.flat() : [];
        return [...currentList, botMessage];
      });

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.error('[CustomAIChatbot] Send error caught:', err);
      const fallbackBotMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text: DEFAULT_ERROR_TEXT,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => {
        const currentList = Array.isArray(prev) ? prev.flat() : [];
        return [...currentList, fallbackBotMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isOnAdminPage) return null;

  return (
    <>
      <CustomAIChatButton
        isOpen={isOpen}
        onClick={handleToggle}
        unreadCount={unreadCount}
      />
      <CustomAIChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSend={handleSend}
      />
    </>
  );
}

export default function CustomAIChatbot() {
  return (
    <CustomAIChatErrorBoundary>
      <CustomAIChatbotInner />
    </CustomAIChatErrorBoundary>
  );
}