import Breadcrumbs from "@/app/_components/breadcrumbs";
import NoticeForm from "./notice-form";

export default function NewNoticePage() {
    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "お知らせ追加" },
                ]}
            />

            <h1 className="text-3xl font-bold">お知らせを追加</h1>
            <NoticeForm />
        </main>
    );
}
