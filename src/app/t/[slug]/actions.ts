"use server";

import { createClient } from "@/lib/supabase/server";
import { getTombola, getTickets } from "@/lib/tombola";
import { redirect } from "next/navigation";

export async function registerParticipant(slug: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const quantity = parseInt((formData.get("quantity") as string) || "1", 10);

  if (!name || quantity < 1 || quantity > 20) return;

  const tombola = await getTombola(slug);
  if (!tombola || tombola.status !== "open") return;

  const supabase = await createClient();

  const existing = await getTickets(tombola.id);
  const startNumber = existing.length + 1;

  const ticketsToInsert = Array.from({ length: quantity }, (_, i) => ({
    tombola_id: tombola.id,
    number: startNumber + i,
    participant_name: name,
  }));

  await supabase.from("tickets").insert(ticketsToInsert);

  const numbers = ticketsToInsert.map((t) => t.number).join(",");
  redirect(`/t/${slug}?registered=1&tickets=${numbers}&name=${encodeURIComponent(name)}`);
}
