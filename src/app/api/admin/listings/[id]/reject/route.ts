import { moderationDecision } from "@/lib/api/moderation";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { return moderationDecision(request, (await params).id, "rejected"); }
