/** Types for tdl session management and the login flows. */

export type LoginMethod = "qr" | "desktop";

export type SessionStatus = "connected" | "disconnected";

/** A tdl session namespace tracked by the app. */
export interface SessionInfo {
  /** tdl namespace (`tdl -n <namespace>`). */
  namespace: string;
  /** Optional friendly label. */
  label: string | null;
  status: SessionStatus;
  /** Logged-in account description, when known. */
  account: string | null;
  createdAt: number;
  updatedAt: number;
}

export type QrLoginStatus =
  | "starting"
  | "waiting"
  | "connected"
  | "failed"
  | "canceled";

/** Snapshot of an in-progress QR login. */
export interface QrLoginState {
  namespace: string;
  status: QrLoginStatus;
  /** The `tg://login?token=...` URL to encode as a QR, when captured. */
  qrUrl: string | null;
  error: string | null;
}

/** Events streamed while a QR login is in progress. */
export type QrLoginEvent =
  | { type: "state"; state: QrLoginState }
  | { type: "log"; line: string };

export interface DesktopLoginResult {
  ok: boolean;
  error: string | null;
}
