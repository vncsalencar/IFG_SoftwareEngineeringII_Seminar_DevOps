export type Note = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type CreateNoteInput = {
  title: string;
  body: string;
};
