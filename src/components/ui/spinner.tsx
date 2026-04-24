export function Spinner() {
  return (
    <svg
      className="spinner-rotate"
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={7}
        cy={7}
        r={5.5}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.25}
      />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
