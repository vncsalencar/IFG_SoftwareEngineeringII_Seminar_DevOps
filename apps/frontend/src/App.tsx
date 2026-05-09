import { useEffect, useState } from "react";
import { createNote, deleteNote, listNotes } from "./api";
import { NoteForm } from "./components/NoteForm";
import { NoteList } from "./components/NoteList";
import type { Note } from "./types";

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setNotes(await listNotes());
      console.log("debug:", notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreate(input: { title: string; body: string }) {
    await createNote(input);
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    await refresh();
  }

  return (
    <main>
      <h1>Notes</h1>
      <NoteForm onSubmit={handleCreate} />
      {error && <p role="alert">{error}</p>}
      <NoteList notes={notes} onDelete={handleDelete} />
    </main>
  );
}
