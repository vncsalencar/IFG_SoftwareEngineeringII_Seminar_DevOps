import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NoteItem } from "../components/NoteItem";

describe("NoteItem snapshot", () => {
  it("matches snapshot", () => {
    const { container } = render(
      <NoteItem
        note={{
          id: "1",
          title: "Snap title",
          body: "Snap body",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }}
        onDelete={() => {}}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
