"use client";

import { useEffect } from "react";
import { rememberRecent, type RecentItem } from "@/lib/recent";

export function RecordRecent({ item }: { item: RecentItem }) {
  const key = JSON.stringify(item);
  useEffect(() => rememberRecent(JSON.parse(key)), [key]);
  return null;
}
