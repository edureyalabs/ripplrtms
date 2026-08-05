function kindFor(mimeType: string): "image" | "pdf" | "excel" | "word" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || mimeType.includes("ms-excel")) return "excel";
  if (mimeType.includes("word") || mimeType.includes("msword")) return "word";
  return "file";
}

const STYLE: Record<ReturnType<typeof kindFor>, { bg: string; fg: string; label: string }> = {
  image: { bg: "bg-violet-100 dark:bg-violet-950/40", fg: "text-violet-600 dark:text-violet-400", label: "Image" },
  pdf: { bg: "bg-red-100 dark:bg-red-950/40", fg: "text-red-600 dark:text-red-400", label: "PDF" },
  excel: { bg: "bg-emerald-100 dark:bg-emerald-950/40", fg: "text-emerald-600 dark:text-emerald-400", label: "Excel" },
  word: { bg: "bg-blue-100 dark:bg-blue-950/40", fg: "text-blue-600 dark:text-blue-400", label: "Word" },
  file: { bg: "bg-zinc-100 dark:bg-zinc-800", fg: "text-zinc-600 dark:text-zinc-400", label: "File" },
};

export function FileTypeIcon({ mimeType, className = "h-4 w-4" }: { mimeType: string; className?: string }) {
  const kind = kindFor(mimeType);
  switch (kind) {
    case "image":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm0 9 3.5-4 2.5 3 2-2.5L16 14H4Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "pdf":
    case "excel":
    case "word":
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6H6Zm5 1.5L15.5 8H12a1 1 0 0 1-1-1V3.5Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
          <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6H6Zm5 1.5L15.5 8H12a1 1 0 0 1-1-1V3.5Z" />
        </svg>
      );
  }
}

export function AttachmentChip({
  fileName,
  mimeType,
  url,
}: {
  fileName: string;
  mimeType: string;
  url: string;
}) {
  const kind = kindFor(mimeType);
  const style = STYLE[kind];
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-0 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-surface-50 dark:border-surface-border-dark dark:bg-surface-0-dark dark:text-zinc-300 dark:hover:bg-surface-50-dark"
    >
      <span className={`flex h-5 w-5 items-center justify-center rounded ${style.bg} ${style.fg}`}>
        <FileTypeIcon mimeType={mimeType} className="h-3 w-3" />
      </span>
      <span className="max-w-[10rem] truncate">{fileName}</span>
      <span className={`text-[10px] font-normal ${style.fg}`}>{style.label}</span>
    </a>
  );
}
