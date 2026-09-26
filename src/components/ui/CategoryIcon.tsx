import {
  Bug,
  DotsThree,
  Fire,
  GridFour,
  Hammer,
  Lightning,
  PaintRoller,
  PipeWrench,
  SecurityCamera,
  Snowflake,
  Wall,
  WashingMachine,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  "pipe-wrench": PipeWrench,
  lightning: Lightning,
  snowflake: Snowflake,
  hammer: Hammer,
  wall: Wall,
  "washing-machine": WashingMachine,
  "paint-roller": PaintRoller,
  fire: Fire,
  grid: GridFour,
  "security-camera": SecurityCamera,
  bug: Bug,
  more: DotsThree,
};

export const CATEGORY_ICON_KEYS = Object.keys(ICONS).filter((k) => k !== "more");

export function CategoryIcon({ icon, ...props }: { icon: string } & IconProps) {
  const Cmp = ICONS[icon] ?? Wrench;
  return <Cmp aria-hidden {...props} />;
}
