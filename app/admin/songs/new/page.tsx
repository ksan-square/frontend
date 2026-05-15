import SongForm from "./song-form";
import Link from "next/link";

export default function NewSongPage() {
    return (
        <main className="space-y-6">
            <Link href="/admin/songs" className="inline-block rounded-full bg-zinc-800 px-4 py-2">
                戻る
            </Link>
            <h1 className="text-3xl font-bold">曲を追加</h1>
            <SongForm />
        </main>
    );
}
