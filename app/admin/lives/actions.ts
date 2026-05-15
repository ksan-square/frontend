"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateLive(id: string, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const payload = {
        live_date: String(formData.get("live_date")),
        same_day_order: Number(formData.get("same_day_order")),
        event_name: String(formData.get("event_name")),
        venue_id: formData.get("venue_id")
            ? String(formData.get("venue_id"))
            : null,
        memo: formData.get("memo")
            ? String(formData.get("memo"))
            : null,
        updated_user: user?.id ?? null,
    };

    const { error } = await supabase
        .from("lives")
        .update(payload)
        .eq("id", id)
        .eq("is_delete", false);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/admin/lives");
    revalidatePath(`/admin/lives/${id}/edit`);
}
