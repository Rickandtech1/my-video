// Scene 1 (0–15s): Sunny day introduction — duck walks, sun shines, flowers sway
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const FLOWERS = [80, 240, 420, 620, 860, 1080, 1320, 1560, 1760];

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sky gradient shifts from pale pink sunrise → bright blue (interpolate RGB channels)
  const skyR = Math.round(interpolate(frame, [0, 2 * fps], [255, 135], { extrapolateRight: "clamp" }));
  const skyG = Math.round(interpolate(frame, [0, 2 * fps], [182, 206], { extrapolateRight: "clamp" }));
  const skyB = Math.round(interpolate(frame, [0, 2 * fps], [193, 235], { extrapolateRight: "clamp" }));
  const skyTop = `rgb(${skyR},${skyG},${skyB})`;

  // Sun rises from bottom-right, scaling in
  const sunY = interpolate(frame, [0, 3 * fps], [200, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const sunScale = interpolate(frame, [0, 3 * fps], [0.4, 1], {
    extrapolateRight: "clamp",
  });
  // Gentle pulsing after rise
  const sunPulse = interpolate(Math.sin(frame / 25), [-1, 1], [0.95, 1.05]);
  const finalSunScale = frame < 3 * fps ? sunScale : sunPulse;

  // Clouds drift left to right
  const cloud1X = interpolate(frame, [0, 15 * fps], [-160, 500], {
    extrapolateRight: "clamp",
  });
  const cloud2X = interpolate(frame, [0, 15 * fps], [1800, 1100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Duck walks in from left
  const duckX = interpolate(frame, [2 * fps, 12 * fps], [-140, 900], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const duckBob = interpolate(Math.sin((frame * Math.PI) / 8), [-1, 1], [-12, 12]);

  // Title fades in
  const titleOpacity = interpolate(frame, [fps, 2.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = spring({ frame: frame - fps, fps, config: { damping: 14 } });

  // Scene fade-out at the end
  const fadeOut = interpolate(frame, [13.5 * fps, 15 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Sky */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${skyTop} 0%, #FFF9C4 100%)`,
        }}
      />

      {/* Sun */}
      <div
        style={{
          position: "absolute",
          top: 40 + sunY,
          right: 160,
          fontSize: 140,
          transform: `scale(${finalSunScale})`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        ☀️
      </div>

      {/* Cloud 1 */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: cloud1X,
          fontSize: 90,
          userSelect: "none",
        }}
      >
        ☁️
      </div>

      {/* Cloud 2 */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: cloud2X,
          fontSize: 70,
          userSelect: "none",
        }}
      >
        ☁️
      </div>

      {/* Trees */}
      {[1620, 1750, 1840].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 155,
            left: x,
            fontSize: [120, 100, 80][i],
            userSelect: "none",
          }}
        >
          🌲
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
          background: "linear-gradient(to bottom, #66BB6A 0%, #2E7D32 100%)",
          borderRadius: "60% 60% 0 0 / 40px 40px 0 0",
        }}
      />

      {/* Flowers */}
      {FLOWERS.map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 190,
            left: x,
            fontSize: 56,
            transform: `rotate(${Math.sin((frame + i * 22) / 18) * 12}deg)`,
            userSelect: "none",
          }}
        >
          {["🌸", "🌼", "🌷", "🌻"][i % 4]}
        </div>
      ))}

      {/* Duck */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: duckX,
          fontSize: 120,
          transform: `translateY(${duckBob}px)`,
          userSelect: "none",
        }}
      >
        🦆
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#FF6B6B",
            fontFamily: "sans-serif",
            textShadow: "4px 4px 0 rgba(0,0,0,0.12)",
            letterSpacing: 2,
          }}
        >
          Hello, Little Friends! 🌈
        </div>
        <div
          style={{
            fontSize: 48,
            color: "#1565C0",
            fontFamily: "sans-serif",
            marginTop: 24,
            fontWeight: 600,
          }}
        >
          Let&apos;s explore nature together!
        </div>
      </div>
    </AbsoluteFill>
  );
};
