import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const followUpPrompts = [
  "What specific documentation do I need for this system?",
  "What could change this risk classification?",
  "What are my deployer obligations under Article 26?",
];

interface Props {
  onSelect: (prompt: string) => void;
}

export function FollowUpPrompts({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap gap-2 max-w-3xl mx-auto"
    >
      {followUpPrompts.map((prompt, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          onClick={() => onSelect(prompt)}
          className="text-xs rounded-full h-7 px-3 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
        >
          {prompt}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSelect("Assess another system I use")}
        className="text-xs rounded-full h-7 px-3 border-primary/30 text-primary hover:bg-primary/10 gap-1"
      >
        <RotateCcw className="h-3 w-3" />
        Assess another system
      </Button>
    </motion.div>
  );
}
