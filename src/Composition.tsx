// Main 1-minute children's video composition
// All animations are programmatic — no copyrighted assets.
// For audio: add royalty-free background music from YouTube Audio Library
// or Pixabay Music (pixabay.com/music) — search "children nature calm".
//
// Scene breakdown (each 15 seconds = 450 frames at 30fps):
//   Scene 1: Sunny intro — duck walks, sun rises
//   Scene 2: Bunny meadow — bunny hops through flowers
//   Scene 3: Garden friends — butterflies, bees, frog
//   Scene 4: Sunset goodbye — all animals wave goodnight

import { AbsoluteFill, Series } from "remotion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";

const SCENE_DURATION = 450; // 15 seconds × 30fps

export const NursingVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATION} premountFor={30}>
          <Scene1 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION} premountFor={30}>
          <Scene2 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION} premountFor={30}>
          <Scene3 />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATION} premountFor={30}>
          <Scene4 />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
