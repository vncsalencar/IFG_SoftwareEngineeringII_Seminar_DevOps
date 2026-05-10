import { useEffect, useState } from "react";
import { createNote, deleteNote, listNotes } from "./api";
import { NoteForm } from "./components/NoteForm";
import { NoteList } from "./components/NoteList";
import { NoteSearch } from "./components/NoteSearch";
import type { Note } from "./types";

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function refresh() {
    try {
      setNotes(await listNotes());
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

  const filtered = notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <main>
      <h1>Notes</h1>
      <NoteForm onSubmit={handleCreate} />
      {error && <p role="alert">{error}</p>}
      <NoteSearch value={search} onChange={setSearch} />
      <NoteList notes={filtered} onDelete={handleDelete} />
    </main>
  );
}
