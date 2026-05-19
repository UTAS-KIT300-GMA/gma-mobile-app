/**
 * Firebase Storage object path conventions for `learningVideos` documents.
 *
 * Each Firestore document id `{docId}` owns a folder under `learning/videos/{docId}/`.
 * Prefer storing long-lived **download URLs** on the document for simple clients; optional
 * **Storage object paths** allow resolving URLs at runtime with `getDownloadURL`.
 *
 * ## Storage object paths
 *
 * | Asset        | Object path |
 * |--------------|-------------|
 * | Main video   | `learning/videos/{docId}/main.mp4` |
 * | Thumbnail    | `learning/videos/{docId}/thumbnail.jpg` |
 * | Attachments  | `learning/videos/{docId}/attachments/{filename}` (PDFs, slides, etc.) |
 *
 * ## Firestore `learningVideos` fields (Storage-backed)
 *
 * | Field | Type | Purpose |
 * |-------|------|--------|
 * | `videoDownloadUrl` | string (https) | Main video stream URL from `getDownloadURL`. |
 * | `videoStoragePath` | string (optional) | Object path if `videoDownloadUrl` is omitted; app resolves at runtime. |
 * | `thumbnailUrl` | string (https, optional) | Card / list thumbnail URL (Firebase CDN or any HTTPS). |
 * | `thumbnailStoragePath` | string (optional) | Thumbnail object path if URL not stored. |
 * | `attachmentDownloadUrl` | string (https, optional) | PDF / attachment open-in-browser URL. |
 * | `attachmentStoragePath` | string (optional) | Attachment object path under `learning/videos/{docId}/attachments/`. |
 * | `fileId` | string (optional, legacy) | If it is an `https` URL, used as attachment link. Prefer `attachmentDownloadUrl`. |
 */
export const LEARNING_STORAGE_ROOT = "learning/videos";

export function learningVideoObjectPath(docId: string): string {
  return `${LEARNING_STORAGE_ROOT}/${docId}/main.mp4`;
}

export function learningThumbnailObjectPath(docId: string): string {
  return `${LEARNING_STORAGE_ROOT}/${docId}/thumbnail.jpg`;
}

/**
 * @param filename - Safe basename only (e.g. `handout.pdf`). Path segments and `..` are stripped.
 */
export function learningAttachmentObjectPath(
  docId: string,
  filename: string,
): string {
  const base =
    filename
      .trim()
      .replace(/^\/+/, "")
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.replace(/\.\./g, "") ?? "resource.pdf";
  return `${LEARNING_STORAGE_ROOT}/${docId}/attachments/${base || "resource.pdf"}`;
}
