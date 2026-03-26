// Scene 5 – The economics: ideas that cost $10K → now $20/mo
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

export const TikScene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const pLabel = snap(frame, fps, 5);
  const pBefore = snap(frame, fps, 18);
  const pArrow = snap(frame, fps, 45);
  const pAfter = snap(frame, fps, 58);
  const pDesc = snap(frame, fps, 80);
  const pCta = snap(frame, fps, 105);

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
      {/* Background glow — warm tint */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.05) 45%, transparent 70%)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "240px 80px 0",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#7C3AED",
            marginBottom: 56,
            transform: `translateY(${y(pLabel)}px)`,
            opacity: op(pLabel),
            textTransform: "uppercase",
          }}
        >
          The game changer
        </div>

        {/* Before price */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#6B7280",
            textDecoration: "line-through",
            textDecorationColor: "rgba(239,68,68,0.6)",
            marginBottom: 16,
            transform: `translateY(${y(pBefore)}px)`,
            opacity: op(pBefore),
          }}
        >
          $10,000+ project
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 64,
            color: "#A855F7",
            marginBottom: 16,
            transform: `translateY(${y(pArrow)}px)`,
            opacity: op(pArrow),
          }}
        >
          ↓
        </div>

        {/* After price */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            background: "linear-gradient(135deg, #A855F7, #00D4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 48,
            transform: `translateY(${y(pAfter)}px)`,
            opacity: op(pAfter),
          }}
        >
          $20/mo
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: "#DDD6FE",
            lineHeight: 1.4,
            marginBottom: 40,
            transform: `translateY(${y(pDesc)}px)`,
            opacity: op(pDesc),
          }}
        >
          Your ideas. Your tools.
          {"\n"}Your timeline.
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#7C3AED",
            transform: `translateY(${y(pCta)}px)`,
            opacity: op(pCta),
          }}
        >
          No developer needed.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
