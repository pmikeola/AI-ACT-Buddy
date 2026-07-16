import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <XCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Checkout cancelled
        </h1>
        <p className="text-muted-foreground mb-8">
          No worries — nothing was charged. You can still use the free tier
          with 3 assessments per month, or come back when you're ready to upgrade.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/assess"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Continue with Free Tier
          </Link>
          <Link
            to="/#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Review pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
