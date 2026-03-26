// Scene 2 – The Old Way vs The New Way
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

export const TikScene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const pLabel = snap(frame, fps, 5);
  const p1 = snap(frame, fps, 18);
  const p2 = snap(frame, fps, 30);
  const p3 = snap(frame, fps, 42);
  const pDiv = snap(frame, fps, 60);
  const pNew = snap(frame, fps, 72);
  const pResult = snap(frame, fps, 88);

  const y = (p: number) => interpolate(p, [0, 1], [70, 0]);
  const op = (p: number) => Math.min(p * 3, 1);

  const items = [
    { label: "Hire a developer", p: p1 },
    { label: "Wait 3+ months", p: p2 },
    { label: "Spend $5,000+", p: p3 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "#060010",
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        opacity: bgOp,
      }}
    >
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "220px 80px 0",
        }}
      >
        {/* Old way label */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#6B21A8",
            marginBottom: 40,
            transform: `translateY(${y(pLabel)}px)`,
            opacity: op(pLabel),
            textTransform: "uppercase",
          }}
        >
          The old way
        </div>

        {/* Checklist items */}
        {items.map(({ label, p }, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 28,
              transform: `translateY(${y(p)}px)`,
              opacity: op(p),
            }}
          >
            <div
              style={{
                fontSize: 48,
                lineHeight: 1,
              }}
            >
              ❌
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#9CA3AF",
                textDecoration: "line-through",
                textDecorationColor: "rgba(239,68,68,0.5)",
              }}
            >
              {label}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 2,
            background: "linear-gradient(90deg, #7C3AED, transparent)",
            margin: "40px 0",
            transform: `scaleX(${interpolate(Math.min(pDiv, 1), [0, 1], [0, 1])})`,
            transformOrigin: "left",
            opacity: op(pDiv),
          }}
        />

        {/* New way */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#A855F7",
            marginBottom: 32,
            transform: `translateY(${y(pNew)}px)`,
            opacity: op(pNew),
            textTransform: "uppercase",
          }}
        >
          The new way
        </div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: -2,
            transform: `translateY(${y(pResult)}px)`,
            opacity: op(pResult),
          }}
        >
          <span style={{ color: "#FFFFFF" }}>Just </span>
          <span
            style={{
              background: "linear-gradient(135deg, #A855F7, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            describe it.
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
