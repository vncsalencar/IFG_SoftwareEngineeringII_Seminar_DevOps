import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteSearch } from "../components/NoteSearch";

describe("NoteSearch", () => {
  it("renders an input with the current value", () => {
    render(<NoteSearch value="hello" onChange={() => {}} />);
    const input = screen.getByLabelText("search notes") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("calls onChange when the user types", async () => {
    const onChange = vi.fn();
    render(<NoteSearch value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("search notes"), "foo");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders with a placeholder", () => {
    render(<NoteSearch value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Search by title...")).toBeInTheDocument();
  });
});
