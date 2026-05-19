import { getApp } from "@react-native-firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
} from "@react-native-firebase/storage";

/**
 * Normalizes a Storage object path for `ref(storage, path)` (no leading slash).
 * Accepts `gs://{bucket}/{path}` or a plain object path.
 */
export function normalizeStorageObjectPath(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const gs = /^gs:\/\/[^/]+\/(.+)$/i.exec(t);
  if (gs?.[1]) return gs[1].replace(/^\/+/, "");
  return t.replace(/^\/+/, "");
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** True when the string should be resolved with Firebase `getDownloadURL`. */
export function looksLikeFirebaseStorageObjectPath(raw: string): boolean {
  const t = raw.trim();
  if (!t || isHttpUrl(t)) return false;
  if (/^gs:\/\//i.test(t)) return true;
  const n = normalizeStorageObjectPath(t);
  return !!n?.startsWith("learning/");
}

export async function downloadUrlForStoragePath(raw: string): Promise<string> {
  const path = normalizeStorageObjectPath(raw);
  if (!path) throw new Error("Empty storage path");
  const storage = getStorage(getApp());
  return getDownloadURL(ref(storage, path));
}

/**
 * Resolves a learning video to an HTTPS stream URL for `expo-video`.
 * Accepts `https` download URLs, Storage paths, or `gs://` URIs in either field.
 */
export async function resolveLearningVideoUrl(opts: {
  videoDownloadUrl?: string;
  videoStoragePath?: string;
}): Promise<string> {
  const direct = opts.videoDownloadUrl?.trim() ?? "";
  if (direct && isHttpUrl(direct)) return direct;

  const pathRaw =
    opts.videoStoragePath?.trim() ||
    (direct && !isHttpUrl(direct) ? direct : "");
  if (pathRaw && looksLikeFirebaseStorageObjectPath(pathRaw)) {
    return downloadUrlForStoragePath(pathRaw);
  }

  return "";
}

/**
 * Resolves a learning attachment to an HTTPS URL: prefers explicit download URLs,
 * then resolves Storage object paths under `learning/…` (or `gs://…`) via `getDownloadURL`.
 */
export async function resolveLearningAttachmentUrl(opts: {
  attachmentDownloadUrl?: string;
  attachmentStoragePath?: string;
  fileId?: string;
}): Promise<string> {
  const direct = opts.attachmentDownloadUrl?.trim();
  if (direct && isHttpUrl(direct)) return direct;

  const legacy = opts.fileId?.trim();
  if (legacy && isHttpUrl(legacy)) return legacy;

  const pathRaw =
    opts.attachmentStoragePath?.trim() ||
    (legacy && !isHttpUrl(legacy) ? legacy : "");
  if (pathRaw && looksLikeFirebaseStorageObjectPath(pathRaw)) {
    return downloadUrlForStoragePath(pathRaw);
  }

  return "";
}
