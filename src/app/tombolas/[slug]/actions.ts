"use server";

import { createClient } from "@/lib/supabase/server";
import { getTombola, getLots, getTickets } from "@/lib/tombola";
import { revalidatePath } from "next/cache";

export async function addLot(slug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const photo_url = formData.get("photo_url") as string;

  if (!name?.trim()) return;

  const supabase = await createClient();
  const tombola = await getTombola(slug);
  if (!tombola) return;

  const lots = await getLots(tombola.id);
  const position = lots.length;

  await supabase.from("lots").insert({
    tombola_id: tombola.id,
    name: name.trim(),
    photo_url: photo_url?.trim() || null,
    position,
  });

  revalidatePath(`/tombolas/${slug}`);
}

export async function deleteLot(slug: string, lotId: string) {
  const supabase = await createClient();
  await supabase.from("lots").delete().eq("id", lotId);
  revalidatePath(`/tombolas/${slug}`);
}

export async function closeTombola(slug: string) {
  const supabase = await createClient();
  await supabase
    .from("tombolas")
    .update({ status: "closed" })
    .eq("slug", slug);
  revalidatePath(`/tombolas/${slug}`);
}

export async function drawTombola(slug: string) {
  const supabase = await createClient();
  const tombola = await getTombola(slug);
  if (!tombola) return;

  const [tickets, lots] = await Promise.all([
    getTickets(tombola.id),
    getLots(tombola.id),
  ]);

  if (!tickets.length || !lots.length) return;

  // Fisher-Yates shuffle
  const shuffled = [...tickets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (let i = 0; i < lots.length; i++) {
    const ticket = shuffled[i % shuffled.length];
    await supabase
      .from("tickets")
      .update({ lot_id: lots[i].id })
      .eq("id", ticket.id);
  }

  await supabase
    .from("tombolas")
    .update({ status: "drawn" })
    .eq("slug", slug);

  revalidatePath(`/tombolas/${slug}`);
  revalidatePath(`/t/${slug}`);
}
