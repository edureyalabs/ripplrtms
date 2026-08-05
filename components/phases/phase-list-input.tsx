"use client";

import { useState, type KeyboardEvent } from "react";
import { TextInput } from "@/components/ui/form-field";

export function PhaseListInput({
  hint = "Optional. Add checkpoints in the order they should be completed.",
}: {
  hint?: string;
}) {
  const [phases, setPhases] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function addPhase() {
    const name = draft.trim();
    if (!name || phases.length >= 20) return;
    setPhases((prev) => [...prev, name]);
    setDraft("");
  }

  function removePhase(index: number) {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addPhase();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phases</label>
      <input type="hidden" name="phases" value={phases.join(",")} />

      <div className="flex gap-2">
        <TextInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. Design"
          className="flex-1"
        />
        <button
          type="button"
          onClick={addPhase}
          disabled={!draft.trim()}
          className="flex h-[42px] shrink-0 items-center justify-center rounded-md border border-surface-border px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-border-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
        >
          Add
        </button>
      </div>

      {phases.length > 0 && (
        <ol className="mt-1 flex flex-col gap-1.5">
          {phases.map((name, index) => (
            <li
              key={`${name}-${index}`}
              className="flex items-center gap-2.5 rounded-md border border-surface-border bg-surface-50 px-3 py-2 dark:border-surface-border-dark dark:bg-surface-50-dark"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[10px] font-semibold text-white dark:bg-accent-500">
                {index + 1}
              </span>
              <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">{name}</span>
              <button
                type="button"
                onClick={() => removePhase(index)}
                aria-label={`Remove ${name}`}
                className="text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      {hint && <p className="text-xs text-zinc-400 dark:text-zinc-600">{hint}</p>}
    </div>
  );
}
