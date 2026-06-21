import { redirect } from "next/navigation";
import { getPortalMe } from "@/lib/portal-server-api";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let me;
    try {
        me = await getPortalMe();
    } catch (error) {
        return (
            <main className="space-y-8">
                <section className="surface-subtle p-6">
                    <h1 className="text-2xl font-black text-white">管理情報を取得できませんでした</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {error instanceof Error ? error.message : "unknown error"}
                    </p>
                </section>
            </main>
        );
    }

    if (me.profile.role !== "admin" && me.profile.role !== "editor") {
        redirect("/portal");
    }

    return children;
}
