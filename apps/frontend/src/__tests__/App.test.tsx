import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { createNote, deleteNote, listNotes } from "../api";

vi.mock("../api", () => ({
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  listNotes: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.mocked(createNote).mockResolvedValue({
      id: "2",
      title: "New",
      body: "Created",
      created_at: "",
      updated_at: "",
    });
    vi.mocked(deleteNote).mockResolvedValue(undefined);
    vi.mocked(listNotes).mockResolvedValue([]);
  });

  it("loads and renders notes", async () => {
    vi.mocked(listNotes).mockResolvedValueOnce([
      { id: "1", title: "Loaded", body: "From API", created_at: "", updated_at: "" },
    ]);

    render(<App />);

    expect(await screen.findByText("Loaded")).toBeInTheDocument();
    expect(screen.getByText("From API")).toBeInTheDocument();
  });

  it("creates a note and refreshes the list", async () => {
    vi.mocked(listNotes)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: "2", title: "New", body: "Created", created_at: "", updated_at: "" },
      ]);

    render(<App />);

    await userEvent.type(screen.getByLabelText("title"), "New");
    await userEvent.type(screen.getByLabelText("body"), "Created");
    await userEvent.click(screen.getByRole("button", { name: /add note/i }));

    expect(createNote).toHaveBeenCalledWith({ title: "New", body: "Created" });
    expect(await screen.findByText("New")).toBeInTheDocument();
  });

  it("deletes a note and refreshes the list", async () => {
    vi.mocked(listNotes)
      .mockResolvedValueOnce([
        { id: "1", title: "Loaded", body: "From API", created_at: "", updated_at: "" },
      ])
      .mockResolvedValueOnce([]);

    render(<App />);

    await userEvent.click(await screen.findByLabelText("delete Loaded"));

    expect(deleteNote).toHaveBeenCalledWith("1");
    await waitFor(() => expect(screen.getByText(/no notes yet/i)).toBeInTheDocument());
  });

  it("shows load errors", async () => {
    vi.mocked(listNotes).mockRejectedValueOnce(new Error("network down"));

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("network down");
  });
});
