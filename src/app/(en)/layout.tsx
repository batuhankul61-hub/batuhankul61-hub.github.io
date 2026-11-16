import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { rootMetadata } from "@/lib/meta";

export const metadata = rootMetadata("en");

export default function Layout({ children }: { children: ReactNode }) {
  return <Shell lang="en">{children}</Shell>;
}
