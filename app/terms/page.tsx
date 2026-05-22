import type { Metadata } from "next";
import LegalDocumentPage from "@/app/_components/legal-document-page";
import { termsDocument } from "@/lib/legal-content";
import { SITE_NAME, buildCanonicalPath, createMetadataBase, joinDescriptionParts } from "@/lib/seo";

export const metadata: Metadata = {
    title: "利用規約",
    description: joinDescriptionParts([
        `${SITE_NAME}の利用規約です。`,
        "サービス利用条件、禁止事項、免責事項、お問い合わせ先を掲載しています。",
    ]),
    alternates: {
        canonical: buildCanonicalPath("/terms"),
    },
    openGraph: {
        title: `利用規約 | ${SITE_NAME}`,
        description: joinDescriptionParts([
            `${SITE_NAME}の利用規約です。`,
            "サービス利用条件、禁止事項、免責事項、お問い合わせ先を掲載しています。",
        ]),
        url: new URL("/terms", createMetadataBase()).toString(),
    },
};

export default function TermsPage() {
    return <LegalDocumentPage document={termsDocument} breadcrumbLabel="利用規約" />;
}
