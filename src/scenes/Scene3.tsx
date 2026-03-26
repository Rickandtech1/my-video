// Scene 3 (30–45s): Butterfly garden — butterflies, bees, trees, and a frog
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const TREES = [60, 320, 650, 1000, 1300, 1620, 1830];
const FLOWERS = [120, 300, 480, 680, 880, 1060, 1240, 1440, 1640, 1820];
const BUTTERFLIES = [
  { baseX: 400, baseY: 350, phase: 0, size: 80 },
  { baseX: 700, baseY: 250, phase: 2, size: 70 },
  { baseX: 1100, baseY: 380, phase: 4, size: 90 },
  { baseX: 1450, baseY: 300, phase: 1.5, size: 75 },
  { baseX: 900, baseY: 200, phase: 3, size: 65 },
];
const BEES = [
  { baseX: 550, baseY: 450, phase: 0.5 },
  { baseX: 1200, baseY: 420, phase: 2.5 },
  { baseX: 1650, baseY: 380, phase: 1 },
];

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleOpacity = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, fps], [-60, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Frog jumps appear at 6s
  const frogOpacity = interpolate(frame, [6 * fps, 7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frogHop = Math.sin((frame / 20) * Math.PI);
  const frogY = interpolate(frogHop, [-1, 1], [0, -60]);
  const frogX = interpolate(frame, [6 * fps, 14 * fps], [1700, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label at 8s
  const labelOpacity = interpolate(frame, [8 * fps, 9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(frame, [13.5 * fps, 15 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Sky */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, #E1F5FE 0%, #F9FBE7 100%)",
        }}
      />

      {/* Background trees */}
      {TREES.map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 185,
            left: x,
            fontSize: [130, 110, 140, 100, 120, 90, 105][i % 7],
            userSelect: "none",
            opacity: 0.85,
          }}
        >
          🌳
        </div>
      ))}

      {/* Grass */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 220,
          background: "linear-gradient(to bottom, #81C784 0%, #1B5E20 100%)",
          borderRadius: "30% 30% 0 0 / 20px 20px 0 0",
        }}
      />

      {/* Flowers */}
      {FLOWERS.map((x, i) => {
        const sway = Math.sin((frame + i * 18) / 16) * 15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 192,
              left: x,
              fontSize: 52,
              transform: `rotate(${sway}deg)`,
              userSelect: "none",
            }}
          >
            {["🌻", "🌺", "🌸", "🌼", "🌷"][i % 5]}
          </div>
        );
      })}

      {/* Butterflies */}
      {BUTTERFLIES.map((b, i) => {
        const t = frame / fps;
        const bx = b.baseX + Math.sin(t * 1.2 + b.phase) * 150;
        const by = b.baseY + Math.cos(t * 1.5 + b.phase) * 100;
        const wing = 0.85 + Math.sin(t * 6 + b.phase) * 0.18;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bx,
              top: by,
              fontSize: b.size,
              transform: `scaleX(${wing})`,
              userSelect: "none",
            }}
          >
            🦋
          </div>
        );
      })}

      {/* Bees */}
      {BEES.map((b, i) => {
        const t = frame / fps;
        const bx = b.baseX + Math.cos(t * 2 + b.phase) * 80 + Math.sin(t * 3) * 40;
        const by = b.baseY + Math.sin(t * 2.5 + b.phase) * 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bx,
              top: by,
              fontSize: 65,
              userSelect: "none",
            }}
          >
            🐝
          </div>
        );
      })}

      {/* Frog */}
      <div
        style={{
          position: "absolute",
          bottom: 210,
          left: frogX,
          fontSize: 110,
          opacity: frogOpacity,
          transform: `translateY(${frogY}px)`,
          userSelect: "none",
        }}
      >
        🐸
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60 + titleY,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            color: "#1B5E20",
            fontFamily: "sans-serif",
            textShadow: "4px 4px 0 rgba(255,255,255,0.6)",
          }}
        >
          The Garden of Friends! 🌳
        </div>
      </div>

      {/* Mid label */}
      <div
        style={{
          position: "absolute",
          bottom: 400,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: labelOpacity,
        }}
      >
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: "#1A237E",
            fontFamily: "sans-serif",
            background: "rgba(255,255,255,0.8)",
            display: "inline-block",
            padding: "14px 44px",
            borderRadius: 60,
          }}
        >
          Butterflies, bees, and frogs! 🐝🦋🐸
        </div>
      </div>
    </AbsoluteFill>
  );
};
