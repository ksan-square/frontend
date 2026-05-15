import Breadcrumbs from "@/app/_components/breadcrumbs";
import MemberForm from "../member-form";
import Link from "next/link";

export default function NewMemberPage() {
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { href: "/admin/members", label: "メンバー管理" },
                    { label: "メンバー追加" },
                ]}
            />

            <Link
                href="/admin/members"
                className="inline-block rounded-full bg-zinc-800 px-4 py-2"
            >
                戻る
            </Link>
            <h1 className="text-3xl font-bold">メンバー追加</h1>
            <MemberForm />
        </main>
    );
}
