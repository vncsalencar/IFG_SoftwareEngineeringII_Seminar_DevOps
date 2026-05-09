import type { Note } from "../types";
import { NoteItem } from "./NoteItem";

type Props = {
  notes: Note[];
  onDelete: (id: string) => void;
};

export function NoteList({ notes, onDelete }: Props) {
  if (notes.length === 0) {
    return <p>No notes yet.</p>;
  }
  return (
    <ul>
      {notes.map((note) => (<NoteItem key={note.id} note={note} onDelete={onDelete} />))}
    </ul>
  );
}
