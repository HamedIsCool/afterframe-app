// Single source of truth for a frame's canonical URL.
// Anonymous frames use /f/:id (no username leak).
// Attributed frames use /frame/:username/:id.
export function frameUrl(frame: {
  id: string;
  is_anonymous?: boolean;
  author?: { username?: string } | null;
  authorUsername?: string;
}): string {
  if (frame.is_anonymous) return `/f/${frame.id}`;
  const username = frame.author?.username || frame.authorUsername || "";
  return `/frame/${username}/${frame.id}`;
}
