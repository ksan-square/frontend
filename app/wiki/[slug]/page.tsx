import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import RichMarkdown from "@/app/_components/rich-markdown";
import {
    DEFAULT_DESCRIPTION,
    createDescription,
    joinDescriptionParts,
} from "@/lib/seo";
import { getPublicWikiPageDetail } from "@/lib/public-api";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CommentForm from "./comment-form";
import DeleteCommentButton from "./delete-comment-button";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let payload;
    try {
        payload = await getPublicWikiPageDetail(slug);
    } catch {
        payload = null;
    }

    const page = payload?.page;

    if (!page) {
        return {
            title: "Wikiページが見つかりません",
            description: DEFAULT_DESCRIPTION,
        };
    }

    const description = joinDescriptionParts([
        createDescription(page.body_markdown, 120),
        page.is_published ? null : "下書き",
    ]);

    return {
        title: page.title,
        description,
        alternates: {
            canonical: `/wiki/${page.slug}`,
        },
        openGraph: {
            title: page.title,
            description,
            url: `/wiki/${page.slug}`,
        },
        twitter: {
            title: page.title,
            description,
        },
    };
}

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
    let payload;
    try {
        payload = await getPublicWikiPageDetail(slug);
    } catch (error) {
        return (
            <main>
                Wikiページの取得に失敗しました:{" "}
                {error instanceof Error ? error.message : "unknown error"}
            </main>
        );
    }

    if (!payload.found || !payload.page) {
        return (
            <main className="space-y-8">
                <Breadcrumbs
                    items={[
                        { href: "/wiki", label: "Wiki" },
                        { label: "Wikiページが見つかりません" },
                    ]}
                />
                <section className="surface p-6 ring-1 ring-white/10 md:p-8">
                    <h1 className="text-3xl font-black text-white">
                        Wikiページが見つかりません
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                        指定されたページは未登録か、現在は公開されていません。
                    </p>
                    <Link
                        href="/wiki"
                        className="mt-5 inline-flex rounded-sm bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
                    >
                        Wiki一覧へ戻る
                    </Link>
                </section>
            </main>
        );
    }

    const wikiPage = payload.page as WikiPage;
    const wikiComments = payload.comments as WikiComment[];

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/wiki", label: "Wiki" },
                    { label: wikiPage.title },
                ]}
            />

            <section className="relative flex flex-wrap items-start justify-between gap-4 overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Wiki
                        </p>

                        {!wikiPage.is_published && (
                            <span className="rounded-sm bg-violet-500/15 px-2 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-violet-300/20">
                                下書き
                            </span>
                        )}
                    </div>

                    <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
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
                        className="rounded-md bg-zinc-900 px-4 py-2 font-black text-white ring-1 ring-white/10 hover:bg-white hover:text-black"
                    >
                        編集
                    </Link>
                )}
            </section>

            <article className="surface p-6 ring-1 ring-white/10 md:p-8">
                <RichMarkdown markdown={wikiPage.body_markdown} />
            </article>

            <section className="space-y-4">
                <div>
                    <h2 className="text-3xl font-black text-white">コメント</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        ニックネームで誰でも投稿できます。
                    </p>
                </div>

                <CommentForm wikiPageId={wikiPage.id} />

                <div className="space-y-3">
                    {wikiComments.length === 0 && (
                        <div className="surface p-5 text-zinc-400 ring-1 ring-white/10">
                            まだコメントはありません。
                        </div>
                    )}

                    {wikiComments.map((comment) => (
                        <article
                            key={comment.id}
                            className="surface-subtle p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-black text-fuchsia-200">
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
