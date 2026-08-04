import Image from "next/image";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function avatarUrl(avatarPath: string | null) {
  if (!avatarPath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/avatars/${avatarPath}`;
}

const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function Avatar({
  name,
  avatarPath,
  size = "md",
}: {
  name: string;
  avatarPath: string | null;
  size?: keyof typeof SIZES;
}) {
  const url = avatarUrl(avatarPath);

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={40}
        height={40}
        className={`${SIZES[size]} shrink-0 rounded-full object-cover`}
        unoptimized
      />
    );
  }

  return (
    <span
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-accent-600 font-semibold text-white dark:bg-accent-500 dark:text-white`}
    >
      {initials(name)}
    </span>
  );
}
