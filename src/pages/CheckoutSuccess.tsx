import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          You're all set!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your subscription is active. You now have full access to AI ACT Buddy.
          Start running unlimited assessments and building your compliance documentation.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/assess"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Run an Assessment
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
        {sessionId && (
          <p className="mt-8 text-xs text-muted-foreground/50">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
