import SongForm from "./song-form";

export default function NewSongPage() {
    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">曲を追加</h1>
            <SongForm />
        </main>
    );
}