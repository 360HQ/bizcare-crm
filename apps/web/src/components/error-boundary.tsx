import { Component } from "react";

import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
					<h2 className="font-semibold text-lg">Something went wrong</h2>
					<p className="max-w-md text-muted-foreground text-sm">
						{this.state.error.message}
					</p>
					<Button
						onClick={() => this.setState({ error: null })}
						variant="outline"
					>
						Try again
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
