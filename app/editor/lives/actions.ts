"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { getApiBaseUrl } from "@/lib/public-api";

export async function updateLive(id: string, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("ログインが必要です。");
    }

    const payload = {
        live_date: String(formData.get("live_date")),
        same_day_order: Number(formData.get("same_day_order")),
        ticket_url: formData.get("ticket_url")
            ? String(formData.get("ticket_url"))
            : null,
        official_x_url: formData.get("official_x_url")
            ? String(formData.get("official_x_url"))
            : null,
        event_name: String(formData.get("event_name")),
        memo: formData.get("memo")
            ? String(formData.get("memo"))
            : null,
        venue_id: formData.get("venue_id")
            ? String(formData.get("venue_id"))
            : null,
        place_detail: formData.get("place_detail")
            ? String(formData.get("place_detail"))
            : null,
        open_time: formData.get("open_time")
            ? String(formData.get("open_time"))
            : null,
        show_start_time: formData.get("show_start_time")
            ? String(formData.get("show_start_time"))
            : null,
    };
    const response = await fetch(`${getApiBaseUrl()}/api/v1/admin/lives/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "更新に失敗しました。");
    }

    revalidatePath("/editor/lives");
    revalidatePath(`/editor/lives/${id}/edit`);
    revalidatePath("/lives");
    revalidatePath(`/lives/${id}`);
    revalidatePath("/");
}
