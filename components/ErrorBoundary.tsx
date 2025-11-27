import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle size={24} />
                            </div>
                            <h1 className="text-xl font-bold">Er is iets misgegaan</h1>
                        </div>

                        <p className="text-gray-600 mb-4">
                            De applicatie is vastgelopen. Hier is de technische foutmelding:
                        </p>

                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-48 mb-6">
                            {this.state.error?.message || 'Onbekende fout'}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Pagina verversen
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
