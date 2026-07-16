import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, LogIn, LogOut, Code2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import euAiActImg from "@/assets/eu-ai-act.webp";
import { PureMultimodalInput, type Attachment, type UIMessage } from "@/components/ui/multimodal-ai-chat-input";
import { AssessmentCard, type AssessmentData } from "@/components/AssessmentCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SessionHistory, addSessionEntry, type SessionEntry } from "@/components/SessionHistory";
import { FollowUpPrompts } from "@/components/FollowUpPrompts";
import { FeedbackPrompt } from "@/components/FeedbackPrompt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { sendMessage, sendFollowUp, resetSession } from "@/lib/lyzr-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  assessment?: AssessmentData;
  rawResponse?: string;
  latencyMs?: number;
}

export default function Index() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [devMode, setDevMode] = useState(false);
  const [lastUserQuery, setLastUserQuery] = useState("");
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const assessmentCount = messages.filter((m) => m.assessment).length;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Load saved assessments for signed-in users
  useEffect(() => {
    if (!user) return;
    const loadSaved = async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error || !data || data.length === 0) return;
      const loaded: Message[] = [];
      for (const row of data) {
        loaded.push({ id: row.id + "-q", role: "user", content: row.query });
        loaded.push({
          id: row.id,
          role: "assistant",
          content: "",
          assessment: {
            summary: row.summary,
            riskTier: row.risk_tier as AssessmentData["riskTier"],
            justification: row.justification,
            confidence: row.confidence as AssessmentData["confidence"],
            assumptions: row.assumptions || "",
          },
          rawResponse: row.raw_response || undefined,
          latencyMs: row.latency_ms || undefined,
        });
      }
      setMessages(loaded);
    };
    loadSaved();
  }, [user]);

  const handleNewAssessment = useCallback(() => {
    setMessages([]);
    setLastUserQuery("");
    resetSession();
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLastUserQuery(text);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { assessment, rawResponse, latencyMs } = await sendMessage(text);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        assessment,
        rawResponse,
        latencyMs,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (assessment.riskTier === "needs_clarification" || assessment.riskTier === "unknown" || assessment.confidence === "low") {
        const clarificationMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I need a bit more detail to give you an accurate classification. Could you tell me:\n\n- **What does the AI system do?** (e.g., screens CVs, generates text, scores creditworthiness)\n- **Who uses it?** (e.g., HR team, customer service, internal analytics)\n- **What sector are you in?** (e.g., healthcare, finance, retail, education)",
        };
        setMessages((prev) => [...prev, clarificationMsg]);
      }

      const entry: SessionEntry = {
        id: assistantMsg.id,
        query: text,
        riskTier: assessment.riskTier,
        timestamp: Date.now(),
      };
      addSessionEntry(entry);

      if (user) {
        const { error } = await supabase.from("assessments").insert({
          user_id: user.id,
          query: text,
          risk_tier: assessment.riskTier,
          confidence: assessment.confidence,
          summary: assessment.summary,
          justification: assessment.justification,
          assumptions: assessment.assumptions,
          raw_response: rawResponse,
          latency_ms: latencyMs,
        });
        if (error) console.error("Failed to save assessment:", error);
      }
    } catch (err) {
      console.error("Assessment error:", err);
      toast.error("Failed to get assessment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleFollowUp = useCallback(async (text: string) => {
    if (!text.trim()) return;
    if (text === "Assess another system I use") {
      handleNewAssessment();
      return;
    }
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { text: responseText } = await sendFollowUp(text);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseText,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [handleNewAssessment]);

  const handleMultimodalSend = useCallback(({ input }: { input: string; attachments: Attachment[] }) => {
    handleSend(input);
  }, [handleSend]);

  const handleStopGenerating = useCallback(() => setIsLoading(false), []);

  const handleRefine = useCallback(() => {
    if (lastUserQuery) handleSend(lastUserQuery);
  }, [lastUserQuery, handleSend]);

  const handleDeleteAssessment = useCallback(async (id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) return prev;
      const start = idx > 0 && prev[idx - 1]?.role === "user" ? idx - 1 : idx;
      return [...prev.slice(0, start), ...prev.slice(idx + 1)];
    });
    if (user) {
      await supabase.from("assessments").delete().eq("id", id).eq("user_id", user.id);
    }
  }, [user]);

  const uiMessages: UIMessage[] = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
  }));

  const showWelcome = messages.length === 0 && !isLoading;
  const lastMessageIsAssessment = messages.length > 0 && messages[messages.length - 1]?.assessment;

  const assessmentMessageIds = messages.filter((m) => m.assessment).map((m) => m.id);
  const lastAssessmentId = assessmentMessageIds[assessmentMessageIds.length - 1];

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-gold text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/")}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                ← Home
              </button>
              <h1 className="text-sm font-semibold text-foreground leading-tight truncate">
                AI ACT Buddy
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground">EU AI Act risk classifier</p>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewAssessment}
                className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                title="New assessment"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New</span>
              </Button>
            )}
            <SessionHistory onSelect={handleSend} onDelete={handleDeleteAssessment} />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDevMode(!devMode)}
                className={`gap-1 text-xs ${devMode ? "text-primary" : "text-muted-foreground"}`}
                title="Developer mode"
              >
                <Code2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[120px]">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 pb-48">
          <AnimatePresence mode="wait">
            {showWelcome && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center pt-16 md:pt-24"
              >
                <div className="mb-6 h-20 w-20 overflow-hidden rounded-2xl shadow-lg">
                  <img src={euAiActImg} alt="EU AI Act" className="h-full w-full object-cover" />
                </div>
                <h2 className="mb-2 text-2xl font-semibold text-foreground text-balance text-center">
                  AI ACT Buddy
                </h2>
                <p className="mb-4 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
                  Describe your AI system and get an instant EU AI Act risk classification — with the exact Article that applies.
                </p>
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground max-w-sm text-center">
                  💡 <span className="font-medium text-foreground">Tip:</span> Include what the system does, its purpose, who deploys it, and the sector it operates in.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-xl rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                      {msg.content}
                    </div>
                  </div>
                ) : msg.assessment ? (
                  <>
                    {msg.id !== lastAssessmentId && assessmentMessageIds.length > 1 && (
                      <button
                        onClick={() => toggleCollapse(msg.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
                      >
                        {collapsedCards.has(msg.id) ? (
                          <><ChevronDown className="h-3 w-3" /> Show assessment</>
                        ) : (
                          <><ChevronUp className="h-3 w-3" /> Collapse</>
                        )}
                      </button>
                    )}
                    {!collapsedCards.has(msg.id) ? (
                      <AssessmentCard
                        data={msg.assessment}
                        rawResponse={msg.rawResponse}
                        latencyMs={msg.latencyMs}
                        onRefine={handleRefine}
                        devMode={devMode}
                        userQuery={(() => {
                          const idx = messages.indexOf(msg);
                          return idx > 0 && messages[idx - 1]?.role === "user" ? messages[idx - 1].content : undefined;
                        })()}
                      />
                    ) : (
                      <div className="rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Previous assessment — {msg.assessment.riskTier.replace("_", " ")} risk
                      </div>
                    )}
                  </>
                ) : (
                  <div className="max-w-3xl mx-auto rounded-xl border border-border bg-card px-5 py-4 text-sm text-card-foreground prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Analysing AI system…
              </motion.div>
            )}

            {!isLoading && lastMessageIsAssessment && (
              <FollowUpPrompts onSelect={handleFollowUp} />
            )}

            {!isLoading && <FeedbackPrompt assessmentCount={assessmentCount} />}

            {!isLoading && assessmentCount >= 1 && !user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center gap-3 text-xs text-muted-foreground pt-2"
              >
                <button
                  onClick={() => navigate("/auth")}
                  className="hover:text-primary underline-offset-2 hover:underline transition-colors"
                >
                  Sign in to save assessments
                </button>
              </motion.div>
            )}
            {!isLoading && assessmentCount >= 1 && user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center text-xs text-muted-foreground pt-2"
              >
                <span className="text-primary/60">✓ Assessment saved to your account</span>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed input */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-8 px-4">
        <div className="mx-auto max-w-3xl">
          <PureMultimodalInput
            chatId="eu-ai-act-chat"
            messages={uiMessages}
            attachments={attachments}
            setAttachments={setAttachments}
            onSendMessage={handleMultimodalSend}
            onStopGenerating={handleStopGenerating}
            isGenerating={isLoading}
            canSend={!isLoading}
            selectedVisibilityType="private"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI-generated assessments are for guidance only. Consult legal counsel for formal compliance advice.
          </p>
        </div>
      </div>
    </div>
  );
}
