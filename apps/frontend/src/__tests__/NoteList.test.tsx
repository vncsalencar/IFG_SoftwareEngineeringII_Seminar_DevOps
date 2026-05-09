import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteList } from "../components/NoteList";

const fixture = [
  { id: "1", title: "First", body: "one", created_at: "", updated_at: "" },
  { id: "2", title: "Second", body: "two", created_at: "", updated_at: "" },
];

describe("NoteList", () => {
  it("renders empty state", () => {
    render(<NoteList notes={[]} onDelete={() => {}} />);
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("renders notes", () => {
    render(<NoteList notes={fixture} onDelete={() => {}} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("calls onDelete with the note id", async () => {
    const onDelete = vi.fn();
    render(<NoteList notes={fixture} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText("delete First"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
