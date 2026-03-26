import "./index.css";
import { Composition } from "remotion";
import { NursingVideo } from "./Composition";

// 1 minute at 30fps = 1800 frames
// 1920x1080 for YouTube HD
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NursingVideo"
        component={NursingVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
