import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Documents",
  description: "Create, open, and manage local-first documents.",
};

export default function HomePage() {
  return <Dashboard />;
}
