// Scene 4 (45–60s): Golden sunset — all animals say goodbye, stars appear
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

const STARS = [
  { x: 120, y: 60, delay: 0 },
  { x: 380, y: 40, delay: 10 },
  { x: 650, y: 80, delay: 5 },
  { x: 900, y: 50, delay: 15 },
  { x: 1150, y: 70, delay: 8 },
  { x: 1400, y: 45, delay: 12 },
  { x: 1650, y: 65, delay: 3 },
  { x: 1820, y: 55, delay: 18 },
  { x: 260, y: 130, delay: 7 },
  { x: 750, y: 140, delay: 20 },
  { x: 1050, y: 120, delay: 2 },
  { x: 1550, y: 130, delay: 14 },
];

const ANIMALS = [
  { emoji: "🦆", label: "Ducky" },
  { emoji: "🐰", label: "Bunny" },
  { emoji: "🦋", label: "Flutter" },
  { emoji: "🐝", label: "Buzz" },
  { emoji: "🐸", label: "Froggy" },
];

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sky transitions from blue → warm orange sunset → deep purple
  const skyProgress = interpolate(frame, [0, 15 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  // Interpolate sky colors
  const r1 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [135, 255, 60]));
  const g1 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [206, 160, 40]));
  const b1 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [235, 80, 120]));
  const r2 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [255, 255, 130]));
  const g2 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [249, 200, 100]));
  const b2 = Math.round(interpolate(skyProgress, [0, 0.5, 1], [196, 80, 180]));

  // Sun sets slowly
  const sunY = interpolate(frame, [0, 14 * fps], [60, 580], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const sunOpacity = interpolate(frame, [10 * fps, 14 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stars twinkle in as sky darkens
  const starStart = 4 * fps;

  // Animals bounce in one by one
  const animalSpacing = 320;
  const totalWidth = ANIMALS.length * animalSpacing;
  const startX = (1920 - totalWidth) / 2 + 40;

  // Big goodbye text
  const goodbyeOpacity = interpolate(frame, [8 * fps, 10 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const goodbyeScale = spring({
    frame: frame - 8 * fps,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Moon rises
  const moonY = interpolate(frame, [10 * fps, 15 * fps], [300, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const moonOpacity = interpolate(frame, [9 * fps, 11 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Sky */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, rgb(${r1},${g1},${b1}) 0%, rgb(${r2},${g2},${b2}) 100%)`,
        }}
      />

      {/* Stars */}
      {STARS.map((s, i) => {
        const appearFrame = starStart + s.delay;
        const starOpacity = interpolate(
          frame,
          [appearFrame, appearFrame + fps * 1.5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const twinkle = 0.6 + Math.sin(frame / 12 + i * 0.8) * 0.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              fontSize: 28,
              opacity: starOpacity * twinkle,
              userSelect: "none",
            }}
          >
            ⭐
          </div>
        );
      })}

      {/* Sun setting */}
      <div
        style={{
          position: "absolute",
          right: 160,
          top: sunY,
          fontSize: 130,
          opacity: sunOpacity,
          userSelect: "none",
        }}
      >
        🌅
      </div>

      {/* Moon rising */}
      <div
        style={{
          position: "absolute",
          left: 180,
          top: moonY,
          fontSize: 120,
          opacity: moonOpacity,
          userSelect: "none",
        }}
      >
        🌙
      </div>

      {/* Grass */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 240,
          background: `linear-gradient(to bottom, rgb(${Math.round(interpolate(skyProgress, [0, 1], [100, 40]))},${Math.round(interpolate(skyProgress, [0, 1], [180, 80]))},${Math.round(interpolate(skyProgress, [0, 1], [100, 60]))}) 0%, #1B5E20 100%)`,
          borderRadius: "30% 30% 0 0 / 20px 20px 0 0",
        }}
      />

      {/* Animals row */}
      {ANIMALS.map((a, i) => {
        const delayFrames = i * 8;
        const animalScale = spring({
          frame: frame - delayFrames,
          fps,
          config: { damping: 10, stiffness: 100 },
        });
        const wave = Math.sin((frame / 20) + i * 1.2) * 18;
        const x = startX + i * animalSpacing;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 220,
              left: x,
              textAlign: "center",
              transform: `scale(${animalScale}) rotate(${wave}deg)`,
              userSelect: "none",
            }}
          >
            <div style={{ fontSize: 110 }}>{a.emoji}</div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "white",
                fontFamily: "sans-serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                marginTop: 6,
              }}
            >
              {a.label}
            </div>
          </div>
        );
      })}

      {/* Goodbye message */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: goodbyeOpacity,
          transform: `scale(${goodbyeScale})`,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            textShadow: "6px 6px 0 rgba(0,0,0,0.2)",
          }}
        >
          Goodnight! 🌙⭐
        </div>
        <div
          style={{
            fontSize: 52,
            color: "#FFE082",
            fontFamily: "sans-serif",
            marginTop: 20,
            fontWeight: 600,
          }}
        >
          Sweet dreams, little one! 💤
        </div>
      </div>
    </AbsoluteFill>
  );
};
