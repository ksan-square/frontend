import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import RichMarkdown from "@/app/_components/rich-markdown";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CommentForm from "./comment-form";
import DeleteCommentButton from "./delete-comment-button";

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
    updated_at: string;
};

type WikiComment = {
    id: string;
    nickname: string;
    body: string;
    created_at: string;
};

export default async function WikiDetailPage({ params }: Props) {
    const { slug } = await params;
    const authClient = await createSupabaseServerClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();

    let query = authClient
        .from("wiki_pages")
        .select("id,title,slug,body_markdown,is_published,updated_at")
        .eq("slug", slug)
        .eq("is_delete", false);

    if (!user) {
        query = query.eq("is_published", true);
    }

    const { data: page, error } = await query.single();

    if (error || !page) {
        return <main>Wikiページが見つかりませんでした。</main>;
    }

    const wikiPage = page as WikiPage;
    const { data: comments, error: commentsError } = await authClient
        .from("wiki_comments")
        .select("id,nickname,body,created_at")
        .eq("wiki_page_id", wikiPage.id)
        .eq("is_delete", false)
        .order("created_at", { ascending: true });

    if (commentsError) {
        return <main>コメントの取得に失敗しました: {commentsError.message}</main>;
    }

    const wikiComments = (comments ?? []) as WikiComment[];

    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/wiki", label: "Wiki" },
                    { label: wikiPage.title },
                ]}
            />

            <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-pink-300">
                            Wiki
                        </p>

                        {!wikiPage.is_published && (
                            <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                                下書き
                            </span>
                        )}
                    </div>

                    <h1 className="mt-2 text-3xl font-bold">
                        {wikiPage.title}
                    </h1>
                    <p className="mt-3 text-sm text-zinc-400">
                        最終更新:{" "}
                        {new Date(wikiPage.updated_at).toLocaleDateString(
                            "ja-JP",
                        )}
                    </p>
                </div>

                {user && (
                    <Link
                        href={`/wiki/${wikiPage.slug}/edit`}
                        className="rounded-full bg-zinc-800 px-4 py-2 font-bold hover:bg-pink-500"
                    >
                        編集
                    </Link>
                )}
            </section>

            <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <RichMarkdown markdown={wikiPage.body_markdown} />
            </article>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">コメント</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        ニックネームで誰でも投稿できます。
                    </p>
                </div>

                <CommentForm wikiPageId={wikiPage.id} />

                <div className="space-y-3">
                    {wikiComments.length === 0 && (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                            まだコメントはありません。
                        </div>
                    )}

                    {wikiComments.map((comment) => (
                        <article
                            key={comment.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bold text-pink-200">
                                        {comment.nickname}
                                    </h3>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(
                                            comment.created_at,
                                        ).toLocaleString("ja-JP")}
                                    </p>
                                </div>

                                {user && (
                                    <DeleteCommentButton id={comment.id} />
                                )}
                            </div>

                            <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-200">
                                {comment.body}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
