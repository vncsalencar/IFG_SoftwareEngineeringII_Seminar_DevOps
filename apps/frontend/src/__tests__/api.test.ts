import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNote, deleteNote, listNotes } from "../api";

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("listNotes returns parsed array", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [{ id: "1", title: "t", body: "b", created_at: "", updated_at: "" }],
    });
    const notes = await listNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0]?.title).toBe("t");
  });

  it("createNote throws on validation error", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "title cannot be empty" }),
    });
    await expect(createNote({ title: "", body: "x" })).rejects.toThrow("title cannot be empty");
  });

  it("deleteNote resolves on successful delete", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    await expect(deleteNote("1")).resolves.toBeUndefined();
  });

  it("deleteNote throws when delete fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });
    await expect(deleteNote("1")).rejects.toThrow("Failed to delete note: 500");
  });
});
