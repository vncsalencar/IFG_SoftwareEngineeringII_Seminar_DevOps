type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteSearch({ value, onChange }: Props) {
  return (
    <input
      aria-label="search notes"
      placeholder="Search by title..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
