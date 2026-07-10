import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {

  constructor(props: Props) {

    super(props);

    this.state = {
      hasError: false,
    };

  }

  static getDerivedStateFromError() {

    return {
      hasError: true,
    };

  }

  componentDidCatch(
    error: Error,
    info: React.ErrorInfo
  ) {

    console.error(
      error,
      info
    );

  }

  render() {

    if (this.state.hasError) {

      return (

        <div className="flex min-h-screen items-center justify-center bg-slate-100">

          <div className="rounded-2xl bg-white p-10 text-center shadow">

            <h1 className="text-3xl font-bold text-red-600">

              Something went wrong

            </h1>

            <p className="mt-3 text-slate-500">

              Please refresh the page.

            </p>

          </div>

        </div>

      );

    }

    return this.props.children;

  }

}