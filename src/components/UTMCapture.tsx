"use client";

import { useEffect } from "react";
import { captureUTMParams } from "@/lib/utm";

/**
 * Captures UTM params on first page load.
 * Drop once in the root layout — renders nothing.
 */
export default function UTMCapture() {
  useEffect(() => {
    captureUTMParams();
  }, []);

  return null;
}
