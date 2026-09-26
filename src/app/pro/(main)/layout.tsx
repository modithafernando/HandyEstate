import { redirect } from "next/navigation";
import { ProNav } from "@/components/pro/ProNav";
import { getCurrentUser } from "@/server/services/auth";

export default async function ProMainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user?.providerId) redirect("/pro/setup/1");
  return (
    <>
      <ProNav />
      <main id="main" className="mx-auto max-w-3xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8">
        {children}
      </main>
    </>
  );
}
