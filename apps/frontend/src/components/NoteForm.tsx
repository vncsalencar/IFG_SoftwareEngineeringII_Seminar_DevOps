import { useState, type FormEvent } from "react";
import type { CreateNoteInput } from "../types";

type Props = {
  onSubmit: (input: CreateNoteInput) => Promise<void>;
};

export function NoteForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title, body });
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        aria-label="body"
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add note"}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
