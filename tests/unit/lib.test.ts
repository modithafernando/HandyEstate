import { describe, expect, it } from "vitest";
import { formatLkPhone, isLkMobile, normalizeLkPhone, whatsappDigits } from "@/lib/phone";
import { nicLast4, normalizeNic } from "@/lib/nic";
import { endOfTodayColombo, isAvailable } from "@/lib/time";
import { averageRating, bayesianRating } from "@/lib/rating";
import { haversineKm } from "@/lib/geo";
import { slugify } from "@/lib/slug";

describe("phone", () => {
  it.each(["0771234567", "077 123 4567", "+94771234567", "94771234567", "771234567", "+94 77-123-4567"])("normalises %s", (v) =>
    expect(normalizeLkPhone(v)).toBe("+94771234567"),
  );
  it("rejects bad numbers", () => {
    expect(normalizeLkPhone("12345")).toBeNull();
    expect(normalizeLkPhone("0071234567")).toBeNull();
  });
  it("knows mobiles from landlines", () => {
    expect(isLkMobile("+94771234567")).toBe(true);
    expect(isLkMobile("+94412222222")).toBe(false);
  });
  it("formats", () => {
    expect(formatLkPhone("+94771234567")).toBe("077 123 4567");
    expect(whatsappDigits("+94771234567")).toBe("94771234567");
  });
});

describe("nic", () => {
  it("accepts old and new formats", () => {
    expect(normalizeNic("853400937v")).toBe("853400937V");
    expect(normalizeNic("1985 3400 0937")).toBe("198534000937");
    expect(normalizeNic("12345")).toBeNull();
    expect(nicLast4("853400937V")).toBe("937V");
  });
});

describe("availability", () => {
  it("expires at the next Colombo midnight", () => {
    // 2026-09-26 22:00 in Colombo = 16:30 UTC
    const end = endOfTodayColombo(new Date("2026-09-26T16:30:00Z"));
    expect(end.toISOString()).toBe("2026-09-26T18:30:00.000Z");
    // 00:30 Colombo on the 27th = 19:00 UTC on the 26th → ends at midnight on the 28th
    expect(endOfTodayColombo(new Date("2026-09-26T19:00:00Z")).toISOString()).toBe("2026-09-27T18:30:00.000Z");
  });
  it("isAvailable", () => {
    const now = new Date("2026-09-26T10:00:00Z");
    expect(isAvailable(null, now)).toBe(false);
    expect(isAvailable(new Date("2026-09-26T18:30:00Z"), now)).toBe(true);
    expect(isAvailable(new Date("2026-09-26T09:00:00Z"), now)).toBe(false);
  });
});

describe("rating", () => {
  it("one 5★ review does not beat many 4.8★", () => {
    expect(bayesianRating(5, 1)).toBeLessThan(bayesianRating(48 * 3, 30));
  });
  it("average", () => {
    expect(averageRating(0, 0)).toBeNull();
    expect(averageRating(67, 14)).toBe(4.8);
  });
});

describe("misc", () => {
  it("haversine Matara → Galle ≈ 37 km", () => {
    expect(Math.round(haversineKm({ lat: 5.9485, lng: 80.5353 }, { lat: 6.0329, lng: 80.2168 }))).toBeGreaterThan(34);
  });
  it("slugify", () => expect(slugify("Rizwan Cooling & AC")).toBe("rizwan-cooling-and-ac"));
});
