import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteForm } from "../components/NoteForm";

describe("NoteForm", () => {
  it("submits title and body", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NoteForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("title"), "My title");
    await userEvent.type(screen.getByLabelText("body"), "My body");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith({ title: "My title", body: "My body" });
  });

  it("clears inputs after successful submit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<NoteForm onSubmit={onSubmit} />);
    const titleInput = screen.getByLabelText("title") as HTMLInputElement;
    await userEvent.type(titleInput, "x");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(titleInput.value).toBe("");
  });

  it("shows error when submission fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("nope"));
    render(<NoteForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("title"), "x");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("nope");
  });
});
