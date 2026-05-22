import { redirect } from "next/navigation";
import { getPortalMe } from "@/lib/portal-server-api";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const me = await getPortalMe();

    if (me.profile.role !== "admin" && me.profile.role !== "editor") {
        redirect("/portal");
    }

    return children;
}
