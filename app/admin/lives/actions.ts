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
        live_start_time: formData.get("live_start_time")
            ? String(formData.get("live_start_time"))
            : null,
        live_end_time: formData.get("live_end_time")
            ? String(formData.get("live_end_time"))
            : null,
        benefit_meeting_start_time: formData.get("benefit_meeting_start_time")
            ? String(formData.get("benefit_meeting_start_time"))
            : null,
        benefit_meeting_end_time: formData.get("benefit_meeting_end_time")
            ? String(formData.get("benefit_meeting_end_time"))
            : null,
        benefit_meeting_time_note: formData.get("benefit_meeting_time_note")
            ? String(formData.get("benefit_meeting_time_note"))
            : null,
        benefit_meeting_place_detail: formData.get("benefit_meeting_place_detail")
            ? String(formData.get("benefit_meeting_place_detail"))
            : null,
        ticket_url: formData.get("ticket_url")
            ? String(formData.get("ticket_url"))
            : null,
        official_x_url: formData.get("official_x_url")
            ? String(formData.get("official_x_url"))
            : null,
        event_name: String(formData.get("event_name")),
        venue_id: formData.get("venue_id")
            ? String(formData.get("venue_id"))
            : null,
        benefit_venue_id: formData.get("benefit_venue_id")
            ? String(formData.get("benefit_venue_id"))
            : null,
        memo: formData.get("memo")
            ? String(formData.get("memo"))
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

    revalidatePath("/admin/lives");
    revalidatePath(`/admin/lives/${id}/edit`);
    revalidatePath("/lives");
    revalidatePath(`/lives/${id}`);
    revalidatePath("/");
}
