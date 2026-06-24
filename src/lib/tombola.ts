import { createClient } from "@/lib/supabase/server";

export type Tombola = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  ticket_price: number;
  draw_date: string | null;
  status: "open" | "closed" | "drawn";
  created_at: string;
};

export type Lot = {
  id: string;
  tombola_id: string;
  name: string;
  photo_url: string | null;
  position: number;
};

export type Ticket = {
  id: string;
  tombola_id: string;
  number: number;
  participant_name: string;
  participant_email: string;
  lot_id: string | null;
};

export async function getTombola(slug: string): Promise<Tombola | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tombolas")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getAllTombolas(): Promise<Tombola[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tombolas")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getLots(tombola_id: string): Promise<Lot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lots")
    .select("*")
    .eq("tombola_id", tombola_id)
    .order("position");
  return data ?? [];
}

export async function getTickets(tombola_id: string): Promise<Ticket[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("tombola_id", tombola_id)
    .order("number");
  return data ?? [];
}

export async function getWinners(
  tombola_id: string
): Promise<(Ticket & { lot: Lot })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*, lot:lots(*)")
    .eq("tombola_id", tombola_id)
    .not("lot_id", "is", null)
    .order("number");
  return (data ?? []) as (Ticket & { lot: Lot })[];
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}
