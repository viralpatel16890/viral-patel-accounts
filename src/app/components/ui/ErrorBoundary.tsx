import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Something went wrong';
      return (
        <div
          className="flex flex-col items-center justify-center py-16 px-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-4" aria-hidden="true">
            <AlertTriangle className="w-7 h-7 text-red-700 dark:text-red-300" aria-hidden="true" />
          </div>
          {/* slate-900 on white = 15.4:1 ✓ AAA */}
          <h2 className="text-slate-900 dark:text-white mb-1">
            {title}
          </h2>
          {/* slate-700 on white = 8.2:1 ✓ AAA */}
          <p className="text-sm text-slate-700 dark:text-slate-300 text-center max-w-md mb-4">
            An unexpected error occurred while rendering this section. Please try again or contact support if the issue persists.
          </p>
          {this.state.error && (
            <details className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-4 max-w-md w-full">
              {/* slate-700 on slate-50 = 7.5:1 ✓ AAA */}
              <summary className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">Error details</summary>
              {/* red-800 on slate-50 = 7.6:1 ✓ AAA */}
              <pre className="mt-2 whitespace-pre-wrap break-words text-red-800 dark:text-red-300 text-xs">{this.state.error.message}</pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
            aria-label={`Retry loading ${title}`}
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
