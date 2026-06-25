import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 font-['Space_Grotesk']">
          <div className="text-center max-w-sm">
            <div className="w-8 h-8 border-t-2 border-l-2 border-[#C8A96E] mb-6 mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A96E] font-bold mb-3">
              Something went wrong
            </p>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              An unexpected error occurred. This isn't on you — try heading back
              to the archive.
            </p>
            <button
              onClick={this.handleReload}
              className="text-sm font-bold uppercase tracking-widest px-5 py-2.5
                         bg-[#C8A96E] text-[#0A0A0A] hover:bg-[#B89558] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
