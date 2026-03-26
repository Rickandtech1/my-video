// Scene 1 – Hook: "You don't need to code anymore."
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

export const TikScene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const p0 = snap(frame, fps, 8);
  const p1 = snap(frame, fps, 22);
  const p2 = snap(frame, fps, 36);
  const p3 = snap(frame, fps, 52);
  const p4 = snap(frame, fps, 72);

  const y = (p: number) => interpolate(p, [0, 1], [90, 0]);
  const op = (p: number) => Math.min(p * 3, 1);

  const glowPulse = 0.2 + 0.1 * Math.sin(frame / 25);

  return (
    <AbsoluteFill
      style={{
        background: "#060010",
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        opacity: bgOpacity,
      }}
    >
      {/* Background bloom */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,58,237,${glowPulse}) 0%, transparent 65%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "280px 80px 0",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#7C3AED",
            marginBottom: 60,
            transform: `translateY(${y(p0)}px)`,
            opacity: op(p0),
            textTransform: "uppercase",
          }}
        >
          The Truth
        </div>

        {/* Headline line 1 */}
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: -4,
            transform: `translateY(${y(p1)}px)`,
            opacity: op(p1),
          }}
        >
          You don't
        </div>

        {/* Headline line 2 */}
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.0,
            letterSpacing: -4,
            transform: `translateY(${y(p2)}px)`,
            opacity: op(p2),
          }}
        >
          need to
        </div>

        {/* Headline line 3 – accent */}
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -4,
            background: "linear-gradient(135deg, #A855F7 0%, #00D4FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: `translateY(${y(p3)}px)`,
            opacity: op(p3),
          }}
        >
          code.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 400,
            color: "#A78BFA",
            marginTop: 48,
            transform: `translateY(${y(p4)}px)`,
            opacity: op(p4),
          }}
        >
          Not anymore. ↓
        </div>
      </AbsoluteFill>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
          height: 2,
          background: "rgba(124,58,237,0.3)",
        }}
      />
    </AbsoluteFill>
  );
};
