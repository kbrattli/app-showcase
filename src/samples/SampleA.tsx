import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Screen, StatusBar, TabBar } from "./ui";

const ACCENT = "#4F6DF5";
const CARD_COLORS = [
  "#FFB4A2",
  "#B5EAD7",
  "#C7CEEA",
  "#FFDAC1",
  "#E2F0CB",
  "#F8C8DC",
  "#BDE0FE",
  "#FDE68A",
];
const TITLES = [
  "Morning routine",
  "Weekend hikes",
  "Coffee spots",
  "Reading list",
  "Workouts",
  "Recipes",
  "Travel ideas",
  "Playlists",
];

/** "Browse" screen: title, search bar, cards sliding in, then a scroll. 6 s. */
export const SampleA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scroll = interpolate(frame, [3 * fps, 5 * fps], [0, 820], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <Screen background="#F6F7FB">
      <StatusBar />
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 0,
          right: 0,
          bottom: 220,
          overflow: "hidden",
        }}
      >
        <div style={{ translate: `0px ${-scroll}px`, padding: "20px 70px 0" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -2,
              opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Discover
          </div>
          <div
            style={{
              marginTop: 40,
              height: 120,
              borderRadius: 60,
              background: "#FFFFFF",
              border: "2px solid #E6E8EF",
              display: "flex",
              alignItems: "center",
              padding: "0 44px",
              gap: 24,
              fontSize: 44,
              color: "#9AA0AE",
              opacity: interpolate(frame, [0.2 * fps, 0.6 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                border: "6px solid #9AA0AE",
              }}
            />
            Search collections
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 36,
              marginTop: 56,
            }}
          >
            {TITLES.map((title, i) => {
              const delay = 0.4 * fps + i * 4;
              const progress = spring({
                frame: frame - delay,
                fps,
                config: { damping: 18, stiffness: 140, mass: 0.8 },
              });
              return (
                <div
                  key={title}
                  style={{
                    height: 240,
                    borderRadius: 40,
                    background: "#FFFFFF",
                    boxShadow: "0 8px 30px rgba(20, 30, 60, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    padding: 30,
                    gap: 36,
                    opacity: progress,
                    translate: `0px ${(1 - progress) * 120}px`,
                  }}
                >
                  <div
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 32,
                      background: CARD_COLORS[i % CARD_COLORS.length],
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 52, fontWeight: 700 }}>{title}</div>
                    <div
                      style={{
                        marginTop: 16,
                        height: 22,
                        width: `${55 + ((i * 17) % 35)}%`,
                        borderRadius: 11,
                        background: "#E6E8EF",
                      }}
                    />
                    <div
                      style={{
                        marginTop: 14,
                        height: 22,
                        width: `${30 + ((i * 23) % 30)}%`,
                        borderRadius: 11,
                        background: "#E6E8EF",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRight: `6px solid ${ACCENT}`,
                      borderTop: `6px solid ${ACCENT}`,
                      rotate: "45deg",
                      marginRight: 20,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TabBar active={0} accent={ACCENT} />
    </Screen>
  );
};
