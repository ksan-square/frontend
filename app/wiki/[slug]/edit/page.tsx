import { redirect } from "next/navigation";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import WikiForm from "../../wiki-form";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string }>;
};

type WikiPage = {
    id: string;
    title: string;
    slug: string;
    body_markdown: string;
    is_published: boolean;
};

export default async function EditWikiPage({ params }: Props) {
    const { slug } = await params;
    const authClient = await createSupabaseServerClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
        redirect(
            `/admin/login?redirectedFrom=${encodeURIComponent(
                `/wiki/${slug}/edit`,
            )}`,
        );
    }

    const { data: page, error } = await authClient
        .from("wiki_pages")
        .select("id,title,slug,body_markdown,is_published")
        .eq("slug", slug)
        .eq("is_delete", false)
        .single();

    if (error || !page) {
        return <main>Wikiページが見つかりませんでした。</main>;
    }

    const wikiPage = page as WikiPage;

    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/wiki", label: "Wiki" },
                    { href: `/wiki/${wikiPage.slug}`, label: wikiPage.title },
                    { label: "編集" },
                ]}
            />

            <section>
                <p className="text-sm font-semibold text-pink-300">Wiki</p>
                <h1 className="mt-2 text-3xl font-bold">Wikiを編集</h1>
            </section>

            <WikiForm initialData={wikiPage} />
        </main>
    );
}
