// Why Claude Code Is a Game Changer for Non-Technical People
// 1080x1920 (TikTok vertical) · 30fps · 30 seconds (900 frames)
// 6 scenes × 5 seconds each

import { AbsoluteFill, Series } from "remotion";
import { TikScene1 } from "./scenes/TikScene1";
import { TikScene2 } from "./scenes/TikScene2";
import { TikScene3 } from "./scenes/TikScene3";
import { TikScene4 } from "./scenes/TikScene4";
import { TikScene5 } from "./scenes/TikScene5";
import { TikScene6 } from "./scenes/TikScene6";

const SCENE_DURATION = 150; // 5s × 30fps

export const TikTokVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene3 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene4 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene5 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION}>
          <TikScene6 />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
