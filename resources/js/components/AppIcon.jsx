export default function AppIcon({
  name,
  filled = false,
  size = 22,
  style = {},
}) {
  return (
    <span
      className="material-symbols-rounded"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        userSelect: "none",
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `
          'FILL' ${filled ? 1 : 0},
          'wght' 400,
          'GRAD' 0,
          'opsz' 24
        `,
        ...style,
      }}
    >
      {name}
    </span>
  );
}