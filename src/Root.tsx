import { AbsoluteFill, Composition } from "remotion";

// Placeholder until the Showcase composition is built (see PLAN.md heading 2).
const Placeholder: React.FC = () => {
  return <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Showcase"
      component={Placeholder}
      durationInFrames={30}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
