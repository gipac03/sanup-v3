import { NextResponse } from "next/server";
import { libsqlQuestionRepository } from "@/lib/data/libsqlRepository";

// Le route che leggono dal database girano nel runtime Node.
export const runtime = "nodejs";

/**
 * Restituisce l'intera banca domande dal database.
 * Il client la richiede una sola volta e ne deriva filtri e conteggi in locale.
 */
export async function GET() {
  try {
    const questions = await libsqlQuestionRepository.getAll();
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("GET /api/questions fallita:", err);
    return NextResponse.json(
      { error: "Impossibile leggere la banca domande" },
      { status: 500 },
    );
  }
}
