export type PostCursor = { createdAt: string; id: number };

export const encodeCursor = (c: PostCursor) =>
  Buffer.from(JSON.stringify(c)).toString("base64url");

export const decodeCursor = (
  raw?: string | string[] | undefined
): PostCursor | null => {
  if (!raw || Array.isArray(raw)) return null;
  try {
    const o = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return { createdAt: String(o.createdAt), id: Number(o.id) };
  } catch {
    return null;
  }
};
