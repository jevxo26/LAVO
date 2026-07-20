"use client";

import React, { use } from "react";
import { TicketChat } from "@/components/support/TicketChat";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomerTicketPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="container mx-auto py-6">
      <TicketChat ticketId={id} backUrl="/dashboard/help-desk" />
    </div>
  );
}
