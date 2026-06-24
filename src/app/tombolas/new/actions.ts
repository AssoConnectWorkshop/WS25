"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/tombola";
import { redirect } from "next/navigation";

export async function createTombola(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const ticket_price = Math.round(
    parseFloat((formData.get("ticket_price") as string) || "0") * 100
  );
  const draw_date = formData.get("draw_date") as string;

  if (!title?.trim()) return;

  const supabase = await createClient();
  const slug = generateSlug(title);

  const { error } = await supabase.from("tombolas").insert({
    slug,
    title: title.trim(),
    description: description?.trim() || null,
    ticket_price,
    draw_date: draw_date || null,
  });

  if (error) throw error;

  redirect(`/tombolas/${slug}`);
}
