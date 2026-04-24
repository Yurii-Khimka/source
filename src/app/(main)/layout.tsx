import { RightRailProvider } from "@/components/right-rail-context";
import { AppShell } from "@/components/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <RightRailProvider>
      <AppShell>{children}</AppShell>
    </RightRailProvider>
  );
}
