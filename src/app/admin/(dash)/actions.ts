"use server";

import { revalidatePath } from "next/cache";
import { currentUser, logAudit } from "@/lib/auth/session";
import { seedFromFiles } from "@/lib/store/seed";

export interface ActionState {
  error?: string;
  ok?: string;
}

/** Loads the shipped catalogue into D1. Safe to run again later. */
export async function importCatalogue(): Promise<ActionState> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };
  if (me.role === "staff") return { error: "Only an owner or admin can import the catalogue." };

  try {
    const report = await seedFromFiles();
    await logAudit(
      me,
      "import",
      "catalogue",
      null,
      `Imported ${report.products} watches, ${report.straps} straps, ${report.pairings} strap fittings.`,
    );
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");
    return {
      ok: `Imported ${report.products} watches, ${report.straps} straps and ${report.pairings} strap fittings.`,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "The import failed." };
  }
}
