// Top 5 Claude Code Skills for Content Creators
// 1080x1080 · 30fps · 30 seconds (900 frames)
// Dark purple/violet brand theme
//
// Scene breakdown (each 5 seconds = 150 frames):
//   Scene 0: Intro — "Top 5 Claude Code Skills for Content Creators"
//   Scene 1: Remotion Video Creation
//   Scene 2: Canvas Design
//   Scene 3: Social Media Carousels
//   Scene 4: Brainstorming
//   Scene 5: Subagent Development

import { AbsoluteFill, Series } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { SkillScene } from "./scenes/SkillScene";

const SKILLS: {
  number: number;
  icon: string;
  title: string;
  lines: [string, string];
  accentColor: string;
}[] = [
  {
    number: 1,
    icon: "🎬",
    title: "Remotion Video",
    lines: ["Build cinematic videos with React.", "No video editor needed."],
    accentColor: "#00D4FF",
  },
  {
    number: 2,
    icon: "🎨",
    title: "Canvas Design",
    lines: ["Generate museum-quality art &", "social posts with AI."],
    accentColor: "#F472B6",
  },
  {
    number: 3,
    icon: "📱",
    title: "Social Carousels",
    lines: ["Design swipe-worthy IG & LinkedIn", "carousels in seconds."],
    accentColor: "#34D399",
  },
  {
    number: 4,
    icon: "💡",
    title: "Brainstorming",
    lines: ["Turn vague ideas into polished specs", "through AI dialogue."],
    accentColor: "#FBBF24",
  },
  {
    number: 5,
    icon: "⚡",
    title: "Subagent Dev",
    lines: ["Delegate tasks to parallel AI agents", "for 10x build speed."],
    accentColor: "#A855F7",
  },
];

const SCENE_DURATION = 150; // 5 seconds × 30fps

export const ClaudeCodeVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <IntroScene />
        </Series.Sequence>
        {SKILLS.map((skill) => (
          <Series.Sequence key={skill.number} durationInFrames={SCENE_DURATION}>
            <SkillScene {...skill} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
