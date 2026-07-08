import { NextResponse } from "next/server";
import { LocalQuestionRepository } from "@/lib/data/repository";

// Esportazione statica: le domande vengono dal bundle seed, nessun DB.
export const dynamic = "force-static";

const repo = new LocalQuestionRepository();

export async function GET() {
  const questions = await repo.getAll();
  return NextResponse.json({ questions });
}
