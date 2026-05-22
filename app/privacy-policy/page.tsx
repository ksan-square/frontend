import type { Metadata } from "next";
import LegalDocumentPage from "@/app/_components/legal-document-page";
import { privacyPolicyDocument } from "@/lib/legal-content";
import { SITE_NAME, buildCanonicalPath, createMetadataBase, joinDescriptionParts } from "@/lib/seo";

export const metadata: Metadata = {
    title: "プライバシーポリシー",
    description: joinDescriptionParts([
        `${SITE_NAME}のプライバシーポリシーです。`,
        "取得する情報、利用目的、外部サービス、Cookie、第三者提供、お問い合わせ先を掲載しています。",
    ]),
    alternates: {
        canonical: buildCanonicalPath("/privacy-policy"),
    },
    openGraph: {
        title: `プライバシーポリシー | ${SITE_NAME}`,
        description: joinDescriptionParts([
            `${SITE_NAME}のプライバシーポリシーです。`,
            "取得する情報、利用目的、外部サービス、Cookie、第三者提供、お問い合わせ先を掲載しています。",
        ]),
        url: new URL("/privacy-policy", createMetadataBase()).toString(),
    },
};

export default function PrivacyPolicyPage() {
    return (
        <LegalDocumentPage
            document={privacyPolicyDocument}
            breadcrumbLabel="プライバシーポリシー"
        />
    );
}
