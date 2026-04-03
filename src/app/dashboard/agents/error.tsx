"use client";

import PageError from "@/components/page-error";

export default function Error(props: { error: Error; reset: () => void }) {
  return <PageError {...props} pageName="agents" />;
}
