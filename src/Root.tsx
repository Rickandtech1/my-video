import "./index.css";
import { Composition } from "remotion";
import { ClaudeCodeVideo } from "./Composition";
import { TikTokVideo } from "./TikTokVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram/Facebook square */}
      <Composition
        id="ClaudeCodeVideo"
        component={ClaudeCodeVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1080}
      />
      {/* TikTok vertical */}
      <Composition
        id="TikTokVideo"
        component={TikTokVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
