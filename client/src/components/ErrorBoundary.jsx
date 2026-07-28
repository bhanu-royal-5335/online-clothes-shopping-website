import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Application Error Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // Clear any potentially corrupted session flags and reload page
    sessionStorage.removeItem('hasSeenOpeningSplash');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400 text-3xl font-black">
              !
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-amber-400">Rainbow Fashions</h1>
              <p className="text-slate-400 text-sm">
                An unexpected application error occurred. We have isolated the issue to keep your session secure.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-left overflow-auto max-h-32 text-xs font-mono text-red-400">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-98 text-sm uppercase tracking-wider"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
