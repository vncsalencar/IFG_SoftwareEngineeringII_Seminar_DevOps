import type { Note } from "../types";

type Props = {
  note: Note;
  onDelete: (id: string) => void;
};

export function NoteItem({ note, onDelete }: Props) {
  return (
    <li>
      <h3>{note.title}</h3>
      <p>{note.body}</p>
      <button onClick={() => onDelete(note.id)} aria-label={`delete ${note.title}`}>
        Delete
      </button>
    </li>
  );
}
