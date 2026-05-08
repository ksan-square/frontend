// import { supabase } from "@/lib/supabase";
// import SongPartMemberForm from "./song-part-member-form";

// export default async function NewSongPartMemberPage() {
//   const { data: songParts } = await supabase
//     .from("song_parts")
//     .select(`
//       id,
//       order_no,
//       section_name,
//       lyric_text,
//       songs (
//         title
//       )
//     `)
//     .eq("vocal_type", "members")
//     .order("order_no");

//   const { data: members } = await supabase
//     .from("members")
//     .select("id,name")
//     .eq("is_active", true)
//     .order("sort_order");

//   return (
//     <main className="space-y-6">
//       <h1 className="text-3xl font-bold">歌唱メンバーを紐づけ</h1>
//       <SongPartMemberForm songParts={songParts ?? []} members={members ?? []} />
//     </main>
//   );
// }