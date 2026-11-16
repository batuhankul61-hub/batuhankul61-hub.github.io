import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";
import { rootMetadata } from "@/lib/meta";

export const metadata = rootMetadata("tr");

export default function Layout({ children }: { children: ReactNode }) {
  return <Shell lang="tr">{children}</Shell>;
}
