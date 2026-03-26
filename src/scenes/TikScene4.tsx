// Scene 4 – What you can build
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

const ITEMS = [
  { icon: "🌐", text: "Websites" },
  { icon: "🎬", text: "Videos" },
  { icon: "🤖", text: "Automations" },
  { icon: "🛒", text: "Online stores" },
  { icon: "📈", text: "Dashboards" },
];

export const TikScene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const pLabel = snap(frame, fps, 5);
  const pHeadline = snap(frame, fps, 18);
  const pSub = snap(frame, fps, 105);

  const itemPs = ITEMS.map((_, i) => snap(frame, fps, 35 + i * 14));

  const y = (p: number) => interpolate(p, [0, 1], [70, 0]);
  const op = (p: number) => Math.min(p * 3, 1);

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
          padding: "180px 80px 0",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#7C3AED",
            marginBottom: 36,
            transform: `translateY(${y(pLabel)}px)`,
            opacity: op(pLabel),
            textTransform: "uppercase",
          }}
        >
          What you can build
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: -3,
            marginBottom: 56,
            transform: `translateY(${y(pHeadline)}px)`,
            opacity: op(pHeadline),
          }}
        >
          Anything{"\n"}you can{"\n"}
          <span
            style={{
              background: "linear-gradient(135deg, #A855F7, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            imagine.
          </span>
        </div>

        {/* Item list */}
        {ITEMS.map(({ icon, text }, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginBottom: 20,
              transform: `translateY(${y(itemPs[i])}px)`,
              opacity: op(itemPs[i]),
            }}
          >
            <div style={{ fontSize: 44, lineHeight: 1 }}>{icon}</div>
            <div style={{ fontSize: 50, fontWeight: 700, color: "#DDD6FE" }}>
              {text}
            </div>
          </div>
        ))}

        {/* Bottom tagline */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#6D28D9",
            marginTop: 20,
            transform: `translateY(${y(pSub)}px)`,
            opacity: op(pSub),
          }}
        >
          Zero coding required.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
