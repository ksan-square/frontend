import { Suspense } from "react";
import { redirect } from "next/navigation";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import LoginForm from "./login-form";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
        redirect("/portal");
    }

    return (
        <main className="mx-auto max-w-xl space-y-8">
            <Breadcrumbs items={[{ label: "ログイン" }]} />

            <section className="space-y-4">
                <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                    Shared Login
                </p>
                <h1 className="text-4xl font-black text-white md:text-5xl">
                    ポータルログイン
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                    一般ユーザー、メンバー、編集担当、管理者の入口をひとつにまとめています。ログイン後は権限に応じて使える機能が切り替わります。
                </p>
            </section>

            <Suspense fallback={<div className="text-sm text-zinc-400">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </main>
    );
}
