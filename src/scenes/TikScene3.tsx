// Scene 3 – Example: "Build me a website for my bakery"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

export const TikScene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const pLabel = snap(frame, fps, 5);
  const pCard = snap(frame, fps, 18);
  const pArrow = snap(frame, fps, 55);
  const pResult = snap(frame, fps, 68);
  const pTime = snap(frame, fps, 88);

  const y = (p: number) => interpolate(p, [0, 1], [60, 0]);
  const op = (p: number) => Math.min(p * 3, 1);
  const scaleIn = (p: number) => interpolate(p, [0, 1], [0.85, 1]);

  const glowPulse = 0.15 + 0.08 * Math.sin(frame / 20);

  return (
    <AbsoluteFill
      style={{
        background: "#060010",
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        opacity: bgOp,
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,58,237,${glowPulse}) 0%, transparent 65%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "200px 72px 0",
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#7C3AED",
            marginBottom: 48,
            transform: `translateY(${y(pLabel)}px)`,
            opacity: op(pLabel),
            textTransform: "uppercase",
          }}
        >
          Real example
        </div>

        {/* Chat bubble – user message */}
        <div
          style={{
            background: "rgba(124,58,237,0.18)",
            border: "1.5px solid rgba(168,85,247,0.4)",
            borderRadius: 24,
            borderBottomLeftRadius: 6,
            padding: "36px 44px",
            marginBottom: 32,
            transform: `translateY(${y(pCard)}) scale(${scaleIn(pCard)})`,
            opacity: op(pCard),
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontSize: 17,
              color: "#A855F7",
              marginBottom: 14,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            You say:
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.3,
              letterSpacing: -0.5,
            }}
          >
            "Build me a website for my bakery."
          </div>
        </div>

        {/* Arrow */}
        <div
          style={{
            fontSize: 56,
            marginLeft: 24,
            marginBottom: 32,
            transform: `translateY(${y(pArrow)}px)`,
            opacity: op(pArrow),
          }}
        >
          ↓
        </div>

        {/* Result bubble */}
        <div
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1.5px solid rgba(0,212,255,0.3)",
            borderRadius: 24,
            borderBottomRightRadius: 6,
            padding: "36px 44px",
            marginBottom: 40,
            transform: `translateY(${y(pResult)}px) scale(${scaleIn(pResult)})`,
            opacity: op(pResult),
            alignSelf: "stretch",
          }}
        >
          <div
            style={{
              fontSize: 17,
              color: "#00D4FF",
              marginBottom: 14,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            Claude Code:
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.3,
            }}
          >
            ✅ Done. Your site is live.
          </div>
        </div>

        {/* Time badge */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: "#A78BFA",
            transform: `translateY(${y(pTime)}px)`,
            opacity: op(pTime),
          }}
        >
          ⏱ In under 10 minutes.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
