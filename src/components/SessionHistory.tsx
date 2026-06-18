import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssessmentData } from "./AssessmentCard";

export interface SessionEntry {
  id: string;
  query: string;
  riskTier: AssessmentData["riskTier"];
  timestamp: number;
}

const STORAGE_KEY = "eu-ai-act-session-history";
const MAX_ENTRIES = 5;

export function getSessionHistory(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSessionEntry(entry: SessionEntry) {
  const history = getSessionHistory();
  const updated = [entry, ...history.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeSessionEntry(id: string) {
  const history = getSessionHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearSessionHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  onSelect: (query: string) => void;
  onDelete?: (id: string) => void;
}

export function SessionHistory({ onSelect, onDelete }: Props) {
  const [entries, setEntries] = useState<SessionEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setEntries(getSessionHistory());
  }, [open]);

  if (entries.length === 0) return null;

  const handleDelete = (e: React.MouseEvent, entry: SessionEntry) => {
    e.stopPropagation();
    removeSessionEntry(entry.id);
    setEntries((prev) => prev.filter((en) => en.id !== entry.id));
    onDelete?.(entry.id);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <History className="h-3.5 w-3.5" />
        Recent
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full z-20 mt-1 w-72 rounded-lg border border-border bg-card p-2 shadow-lg"
          >
            <div className="mb-1.5 flex items-center justify-between px-2">
              <span className="text-xs font-medium text-muted-foreground">Recent Assessments</span>
              <button
                onClick={() => {
                  clearSessionHistory();
                  setEntries([]);
                }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary transition-colors"
              >
                <button
                  onClick={() => {
                    onSelect(entry.query);
                    setOpen(false);
                  }}
                  className="flex flex-1 items-start gap-2 text-left min-w-0"
                >
                  <span className="flex-1 line-clamp-2 text-foreground">{entry.query}</span>
                  <span className={`shrink-0 mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    entry.riskTier === "unacceptable" ? "bg-risk-unacceptable/15 text-risk-unacceptable" :
                    entry.riskTier === "high" ? "bg-risk-high/15 text-risk-high" :
                    entry.riskTier === "limited" ? "bg-risk-limited/15 text-risk-limited" :
                    entry.riskTier === "minimal" ? "bg-risk-minimal/15 text-risk-minimal" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {entry.riskTier}
                  </span>
                </button>
                <button
                  onClick={(e) => handleDelete(e, entry)}
                  className="shrink-0 mt-0.5 p-0.5 rounded text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                  title="Delete assessment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
