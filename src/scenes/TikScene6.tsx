// Scene 6 – Outro: "Claude Code. Build anything. Know nothing."
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const snap = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 300, mass: 0.8 } });

export const TikScene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const pLogo = snap(frame, fps, 8);
  const pLine1 = snap(frame, fps, 28);
  const pLine2 = snap(frame, fps, 46);
  const pDivider = snap(frame, fps, 68);
  const pLink = snap(frame, fps, 85);
  const pDots = snap(frame, fps, 100);

  const y = (p: number) => interpolate(p, [0, 1], [60, 0]);
  const op = (p: number) => Math.min(p * 3, 1);

  const glowPulse = 0.2 + 0.12 * Math.sin(frame / 18);

  return (
    <AbsoluteFill
      style={{
        background: "#060010",
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        opacity: bgOp,
      }}
    >
      {/* Pulsing center glow */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,58,237,${glowPulse}) 0%, transparent 65%)`,
        }}
      />

      {/* Grid lines */}
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${i * 12.5}%`,
            width: 1,
            background: "rgba(124,58,237,0.06)",
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 72px",
        }}
      >
        {/* Product name */}
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: -3,
            lineHeight: 1,
            marginBottom: 16,
            transform: `translateY(${y(pLogo)}px)`,
            opacity: op(pLogo),
          }}
        >
          Claude Code
        </div>

        {/* Tagline line 1 */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            background: "linear-gradient(135deg, #A855F7, #00D4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
            transform: `translateY(${y(pLine1)}px)`,
            opacity: op(pLine1),
          }}
        >
          Build anything.
        </div>

        {/* Tagline line 2 */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#DDD6FE",
            marginBottom: 64,
            transform: `translateY(${y(pLine2)}px)`,
            opacity: op(pLine2),
          }}
        >
          Know nothing.
        </div>

        {/* Divider */}
        <div
          style={{
            width: `${interpolate(Math.min(pDivider, 1), [0, 1], [0, 280])}px`,
            height: 2,
            background: "linear-gradient(90deg, transparent, #A855F7, transparent)",
            marginBottom: 48,
            opacity: op(pDivider),
          }}
        />

        {/* Link */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: "#7C3AED",
            letterSpacing: 2,
            transform: `translateY(${y(pLink)}px)`,
            opacity: op(pLink),
          }}
        >
          claude.ai/code
        </div>
      </AbsoluteFill>

      {/* Progress dots (all 6 lit) */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 14,
          opacity: op(pDots),
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#A855F7",
              opacity: i === 5 ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
