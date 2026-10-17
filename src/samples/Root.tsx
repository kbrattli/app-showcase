import { Composition } from "remotion";
import { SampleA } from "./SampleA";
import { SampleB } from "./SampleB";
import { SCREEN_H, SCREEN_W } from "./ui";

/**
 * Separate Remotion root for the sample recordings in public/. Rendered by
 * `npm run samples`; not part of the main Showcase entry point.
 */
export const SamplesRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SampleA"
        component={SampleA}
        durationInFrames={180}
        fps={30}
        width={SCREEN_W}
        height={SCREEN_H}
      />
      <Composition
        id="SampleB"
        component={SampleB}
        durationInFrames={240}
        fps={30}
        width={SCREEN_W}
        height={SCREEN_H}
      />
    </>
  );
};
