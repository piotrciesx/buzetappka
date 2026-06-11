type HeaderActionIconProps = {
  name: "plus";
};

export function HeaderActionIcon({
  name,
}: HeaderActionIconProps) {
  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return null;
}