import type { CreateNoteInput, Note } from "./types";

const BASE_URL = "/api";

export async function listNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  if (!res.ok) throw new Error(`Failed to list notes: ${res.status}`);
  return res.json();
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: 42,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error ?? `Failed to create note: ${res.status}`);
  }
  return res.json();
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete note: ${res.status}`);
}
