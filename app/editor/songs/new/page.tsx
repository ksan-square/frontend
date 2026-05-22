import SongForm from "./song-form";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import PageHero from "@/app/_components/page-hero";

export default function NewSongPage() {
    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/editor", label: "管理" },
                    { href: "/editor/songs", label: "曲管理" },
                    { label: "曲追加" },
                ]}
            />

            <PageHero
                badge="Editor / Songs"
                title="曲を追加"
                description="タイトル・slug・作詞作曲情報を入力します。"
            />

            <SongForm />
        </main>
    );
}
