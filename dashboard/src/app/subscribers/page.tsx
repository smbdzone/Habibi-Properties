"use client";

import { NewsletterTable } from "@/components/subscribers/NewsletterTable";
import { EnquiriesTable } from "@/components/subscribers/EnquiriesTable";
import { ContactTable } from "@/components/subscribers/ContactTable";
import { CommentTable } from "@/components/subscribers/CommentTable";
import { EmailTable } from "@/components/subscribers/EmailTable";

export default function SubscribersPage() {
    return (
        <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-10 space-y-10">
            <NewsletterTable />
            <EnquiriesTable />
            <ContactTable />
            <CommentTable />
            <EmailTable />
        </div>
    );
}
