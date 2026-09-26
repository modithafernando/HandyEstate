"use client";

import { useEffect, useRef } from "react";
import { trackClient, type ClientEvent } from "@/lib/track-client";

/** Records one event when the page is actually shown (not on prefetch). */
export function TrackOnMount({ event }: { event: ClientEvent }) {
  const done = useRef(false);
  const key = JSON.stringify(event);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    trackClient(JSON.parse(key));
  }, [key]);
  return null;
}
