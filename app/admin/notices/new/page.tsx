import Breadcrumbs from "@/app/_components/breadcrumbs";
import NoticeForm from "../notice-form";
import Link from "next/link";

export default function NewNoticePage() {
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/notices", label: "お知らせ管理" },
                    { label: "お知らせ追加" },
                ]}
            />

            <Link
                href="/admin/notices"
                className="inline-block rounded-full bg-zinc-800 px-4 py-2"
            >
                戻る
            </Link>
            <h1 className="text-3xl font-bold">お知らせを追加</h1>
            <NoticeForm />
        </main>
    );
}
