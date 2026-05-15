"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import RichMarkdown from "@/app/_components/rich-markdown";
import { getCurrentUserId } from "@/lib/current-user";

type WikiPage = {
    id: string;
    title: string;
    slug: string;
    body_markdown: string;
    is_published: boolean;
};

type Props = {
    initialData?: WikiPage;
};

function createSlug(title: string) {
    return title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
}

export default function WikiForm({ initialData }: Props) {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [slug, setSlug] = useState(initialData?.slug ?? "");
    const [body, setBody] = useState(initialData?.body_markdown ?? "");
    const [isPublished, setIsPublished] = useState(
        initialData?.is_published ?? true,
    );
    const [message, setMessage] = useState("");

    function insertText(before: string, after = "") {
        const textarea = textareaRef.current;

        if (!textarea) {
            setBody((current) => `${current}${before}${after}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = body.slice(start, end);
        const nextBody =
            body.slice(0, start) +
            before +
            selectedText +
            after +
            body.slice(end);

        setBody(nextBody);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                end + before.length,
            );
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const userId = await getCurrentUserId();

        if (!userId) {
            setMessage("ログインが必要です。");
            return;
        }

        const payload = {
            title,
            slug: slug || createSlug(title),
            body_markdown: body,
            is_published: isPublished,
            is_delete: false,
            updated_user: userId,
        };

        if (!payload.title || !payload.slug || !payload.body_markdown) {
            setMessage("タイトル、slug、本文を入力してください。");
            return;
        }

        const result = initialData
            ? await supabase
                  .from("wiki_pages")
                  .update(payload)
                  .eq("id", initialData.id)
                  .eq("is_delete", false)
            : await supabase.from("wiki_pages").insert({
                  ...payload,
                  created_user: userId,
              });

        if (result.error) {
            setMessage(`保存失敗: ${result.error.message}`);
            return;
        }

        const savedSlug = payload.slug;
        setMessage("保存しました。");
        router.push(`/wiki/${savedSlug}`);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <input
                        className="rounded-xl bg-zinc-950 p-3"
                        placeholder="タイトル"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (!initialData && !slug) {
                                setSlug(createSlug(e.target.value));
                            }
                        }}
                    />

                    <input
                        className="rounded-xl bg-zinc-950 p-3"
                        placeholder="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />
                </div>

                <label className="flex items-center gap-2 text-sm text-zinc-300">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    公開する
                </label>
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <div className="flex flex-wrap gap-2 border-b border-zinc-800 bg-zinc-950 p-3">
                    <button
                        type="button"
                        onClick={() => insertText("**", "**")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold"
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("_", "_")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm italic"
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("## ")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("- ")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        List
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("[", "](https://)")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        Link
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("[color:#ec4899]", "[/color]")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        Color
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("[size:lg]", "[/size]")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        Size
                    </button>
                    <button
                        type="button"
                        onClick={() => insertText("[font:serif]", "[/font]")}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        Font
                    </button>
                </div>

                <div className="grid gap-0 lg:grid-cols-2">
                    <textarea
                        ref={textareaRef}
                        className="min-h-[520px] w-full resize-y bg-zinc-950 p-4 font-mono text-sm leading-6 outline-none"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Markdownで本文を入力"
                    />

                    <div className="min-h-[520px] border-t border-zinc-800 p-5 lg:border-l lg:border-t-0">
                        <p className="mb-3 text-sm font-semibold text-pink-300">
                            Preview
                        </p>
                        <RichMarkdown markdown={body} />
                    </div>
                </div>
            </section>

            <div className="flex items-center gap-3">
                <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                    保存
                </button>

                {message && <p className="text-sm text-zinc-300">{message}</p>}
            </div>
        </form>
    );
}
