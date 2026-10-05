import React from 'react';

export default class CustomAIChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CustomAIChatErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-5 left-4 sm:left-6 z-[95] p-3 rounded-2xl bg-[#1A1A1A] border border-accent-gold/40 text-xs text-[#F5F2EB] shadow-2xl flex items-center gap-2 max-w-[280px]">
          <span className="material-symbols-outlined text-accent-gold text-[18px]">info</span>
          <div className="flex-1">
            <p className="font-semibold text-[11px] text-[#F9F6F0]">Atelier AI temporarily paused</p>
            <button
              onClick={this.handleReset}
              className="text-[10px] text-accent-gold underline hover:text-white mt-0.5"
            >
              Restart Concierge
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}