export type Annotation = {
  id: string;
  /** Rect in screen-pixel coordinates. */
  x: number;
  y: number;
  width: number;
  height: number;
  note: string;
  createdAt: number;
};

export type AuditReport = {
  id: string;
  screen: string;
  createdAt: number;
  device: {
    os: string;
    osVersion: string | number;
    screenWidth: number;
    screenHeight: number;
  };
  annotations: Annotation[];
};

export type AuditMode = "idle" | "capturing" | "annotating" | "review";
