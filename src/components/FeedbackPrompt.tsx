import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  assessmentCount: number;
}

export function FeedbackPrompt({ assessmentCount }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Show after 2 assessments
  if (assessmentCount < 2 || dismissed || submitted) return null;

  const handleFeedback = (positive: boolean) => {
    setSubmitted(true);
    toast.success(positive ? "Thanks for the feedback! 🎉" : "Thanks — we'll work to improve.");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">How useful is this tool?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your feedback helps us improve</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback(true)}
            className="gap-1.5"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Useful
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback(false)}
            className="gap-1.5"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            Needs work
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
