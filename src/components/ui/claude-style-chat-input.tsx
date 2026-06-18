import React, { useState, useRef, useCallback } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ClaudeStyleChatInput({
  onSendMessage,
  placeholder = "Describe an AI system to classify…",
  disabled = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed, attachedFiles.length > 0 ? attachedFiles : undefined);
    setMessage("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, attachedFiles, disabled, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <div className="relative rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary/30">
        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {attachedFiles.map((file, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
              >
                {file.name}
                <button
                  onClick={() => removeFile(i)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input area */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-4 pb-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "rounded-xl p-2 transition-all duration-200",
              canSend
                ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        AI-generated assessments are for guidance only. Always consult legal professionals for formal compliance.
      </p>
    </div>
  );
}
