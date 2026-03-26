// Scene 2 (15–30s): Bunny hops through a flower meadow
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const FLOWERS = [60, 200, 380, 540, 720, 900, 1100, 1300, 1500, 1720, 1880];
const BUTTERFLIES = [
  { startX: 300, startY: 400, phase: 0 },
  { startX: 800, startY: 300, phase: 1.5 },
  { startX: 1400, startY: 450, phase: 3 },
];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bunny hops: parabolic bounces across the screen
  const bunnyProgress = interpolate(frame, [0, 13 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bunnyX = interpolate(bunnyProgress, [0, 1], [-140, 1800]);
  // Hop pattern: multiple parabolic arcs
  const hopCycle = (frame % (fps * 1.2)) / (fps * 1.2); // 0–1 per hop
  const hopY = interpolate(hopCycle, [0, 0.5, 1], [0, -100, 0], {
    easing: Easing.inOut(Easing.quad),
  });
  const bunnyRotate = interpolate(hopCycle, [0, 0.5, 1], [-5, 0, 5]);

  // Title spring-in
  const titleScale = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Label text that appears mid-scene
  const labelOpacity = interpolate(frame, [4 * fps, 5 * fps], [0, 1], {
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
          background: "linear-gradient(to bottom, #B3E5FC 0%, #E8F5E9 100%)",
        }}
      />

      {/* Rolling hills background */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: -100,
          right: -100,
          height: 300,
          background: "#A5D6A7",
          borderRadius: "50% 50% 0 0",
        }}
      />

      {/* Clouds */}
      {[{ top: 60, left: 200 }, { top: 120, left: 800 }, { top: 80, left: 1400 }].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left + Math.sin(frame / 60 + i) * 20,
            fontSize: [80, 70, 90][i],
            userSelect: "none",
          }}
        >
          ☁️
        </div>
      ))}

      {/* Grass */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 240,
          background: "linear-gradient(to bottom, #66BB6A 0%, #1B5E20 100%)",
          borderRadius: "40% 40% 0 0 / 30px 30px 0 0",
        }}
      />

      {/* Flowers */}
      {FLOWERS.map((x, i) => {
        const sway = Math.sin((frame + i * 20) / 15) * 14;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 205,
              left: x,
              fontSize: 54,
              transform: `rotate(${sway}deg)`,
              userSelect: "none",
            }}
          >
            {["🌸", "🌼", "🌷", "🌻", "🌺"][i % 5]}
          </div>
        );
      })}

      {/* Butterflies */}
      {BUTTERFLIES.map((b, i) => {
        const bx = b.startX + Math.sin((frame / 60) * 2 + b.phase) * 120;
        const by = b.startY + Math.cos((frame / 60) * 2.5 + b.phase) * 80;
        const bScale = 0.9 + Math.sin((frame / 20) + b.phase) * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bx,
              top: by,
              fontSize: 60,
              transform: `scale(${bScale})`,
              userSelect: "none",
            }}
          >
            🦋
          </div>
        );
      })}

      {/* Bunny */}
      <div
        style={{
          position: "absolute",
          bottom: 215,
          left: bunnyX,
          fontSize: 130,
          transform: `translateY(${hopY}px) rotate(${bunnyRotate}deg)`,
          userSelect: "none",
        }}
      >
        🐰
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: "#6A1B9A",
            fontFamily: "sans-serif",
            textShadow: "4px 4px 0 rgba(0,0,0,0.1)",
          }}
        >
          Hop, Hop, Hoppy! 🐰
        </div>
      </div>

      {/* Mid-scene label */}
      <div
        style={{
          position: "absolute",
          bottom: 420,
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
            color: "#2E7D32",
            fontFamily: "sans-serif",
            background: "rgba(255,255,255,0.7)",
            display: "inline-block",
            padding: "12px 40px",
            borderRadius: 60,
          }}
        >
          Bunnies love flowers! 🌸
        </div>
      </div>
    </AbsoluteFill>
  );
};
