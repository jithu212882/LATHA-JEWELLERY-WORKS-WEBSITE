import React, { useState } from 'react';
import GoogleAIChatButton from './GoogleAIChatButton.jsx';
import GoogleAIChatWindow from './GoogleAIChatWindow.jsx';
import GoogleAIChatErrorBoundary from './GoogleAIChatErrorBoundary.jsx';

/**
 * GoogleAIChatbot
 * Top-level independent component for the 3rd chatbot (Google AI Studio).
 * Mounted in a dedicated non-colliding position (bottom-center on desktop).
 * Completely isolated from Botpress and CustomAIChatbot.
 */
export default function GoogleAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <GoogleAIChatErrorBoundary>
      <div className="google-ai-chat-container" data-testid="google-ai-chatbot">
        {/* Chat Window */}
        <GoogleAIChatWindow isOpen={isOpen} onClose={handleClose} />

        {/* Floating Launcher Button */}
        <GoogleAIChatButton isOpen={isOpen} onClick={toggleOpen} />
      </div>
    </GoogleAIChatErrorBoundary>
  );
}
