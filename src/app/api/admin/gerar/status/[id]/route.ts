import { NextResponse } from "next/server";
import { activeJobs } from "@/lib/content/job-store";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const job = activeJobs.get(id);

  if (!job) {
    return NextResponse.json({ error: "Job não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    status: job.status,
    log: job.log.slice(-30),
    progress: job.progress,
  });
}
