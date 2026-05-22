import { redirect } from "next/navigation";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import WikiForm from "../wiki-form";

export const dynamic = "force-dynamic";

export default async function NewWikiPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(
            `/login?redirectedFrom=${encodeURIComponent("/wiki/new")}`,
        );
    }

    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/wiki", label: "Wiki" },
                    { label: "新規作成" },
                ]}
            />

            <section>
                <p className="text-sm font-semibold text-pink-300">Wiki</p>
                <h1 className="mt-2 text-3xl font-bold">Wikiを作成</h1>
            </section>

            <WikiForm />
        </main>
    );
}
