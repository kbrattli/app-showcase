import { AbsoluteFill } from "remotion";

/** Shared bits for the fake app screens used as sample recordings. */

export const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const SCREEN_W = 1170;
export const SCREEN_H = 2532;

export const Screen: React.FC<{
  readonly background: string;
  readonly children: React.ReactNode;
}> = ({ background, children }) => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: background, fontFamily: FONT, color: "#111" }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const StatusBar: React.FC<{ readonly dark?: boolean }> = ({ dark }) => {
  const color = dark ? "#FFFFFF" : "#111111";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 90px 10px",
        fontSize: 48,
        fontWeight: 600,
        color,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {[18, 26, 34, 42].map((h) => (
            <div
              key={h}
              style={{ width: 10, height: h, borderRadius: 3, background: color }}
            />
          ))}
        </div>
        <div
          style={{
            width: 76,
            height: 36,
            border: `4px solid ${color}`,
            borderRadius: 10,
            padding: 4,
          }}
        >
          <div
            style={{
              width: "80%",
              height: "100%",
              borderRadius: 4,
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const TabBar: React.FC<{
  readonly active: number;
  readonly accent: string;
}> = ({ active, accent }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 220,
        background: "#FFFFFF",
        borderTop: "2px solid #ECEEF3",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        paddingTop: 36,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 64,
            height: 64,
            borderRadius: i % 2 === 0 ? 20 : 32,
            background: i === active ? accent : "#D5D9E2",
          }}
        />
      ))}
    </div>
  );
};
