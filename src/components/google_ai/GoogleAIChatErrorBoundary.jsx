import React from 'react';

/**
 * Dedicated React Error Boundary for the Google AI Studio Chatbot.
 * Ensures any internal rendering exception in Google AI Chatbot never crashes or blanks the website.
 */
export default class GoogleAIChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[GoogleAIChatErrorBoundary] Caught rendering exception:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 bg-[#1A1A1A] border border-amber-600/40 rounded-xl shadow-2xl text-xs text-[#F5F2EB] flex items-center gap-3">
          <span>Google AI Concierge encountered an error.</span>
          <button
            onClick={this.handleRetry}
            className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded font-medium transition-colors"
          >
            Recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
