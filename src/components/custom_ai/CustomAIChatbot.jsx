import React, { waste, useState, useEffect } from 'react';
import CustomAIChatButton from './CustomAIChatButton';
import CustomAIChatWindow from './CustomAIChatWindow';
import { sendChatMessage } from '../../services/customAIService';

const INITIAL_WELCOME = {
  id: 'welcome-1',
  sender: 'assistant',
  text: "Vanakkam! Welcome to Latha Jewellery Works (Est. 1990). I am your Atelier AI Concierge. How may I assist you with our collections, custom craftsmanship, or today's live gold rates?",
  timestamp: new Date().toISOString()
};

export default function CustomAIChatbot() {
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
    if (!userText || !userText.trim() || isLoading) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(userText.trim(), messages);
      const botMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: result.reply,
        timestamp: new Date().toISOString(),
        isGrounded: result.grounded
      };

      setMessages((prev) => [...prev, botMessage]);

      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err) {
      console.error('[CustomAIChatbot] Send error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'assistant',
          text: 'We are momentarily unable to reach the atelier database. Please contact us on WhatsApp at +91 9487056064 for immediate assistance.',
          timestamp: new Date().toISOString()
        }
      ]);
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
