import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Screen, StatusBar } from "./ui";

const ITEMS = [
  { name: "Oat latte", meta: "Large · Extra shot", price: "$6.50", color: "#D9B99B" },
  { name: "Almond croissant", meta: "Warmed", price: "$4.75", color: "#F3D9A4" },
  { name: "Cold brew", meta: "16 oz · Black", price: "$5.25", color: "#6B4F3A" },
];

/** "Checkout" screen: cart, a button press, then a success state. 8 s. */
export const SampleB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pressAt = 4 * fps;
  const successAt = 4.6 * fps;

  const press = interpolate(
    frame,
    [pressAt, pressAt + 5, pressAt + 14],
    [1, 0.94, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const cartOpacity = interpolate(frame, [successAt - 6, successAt + 6], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const check = spring({
    frame: frame - successAt,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const checkText = spring({
    frame: frame - successAt - 8,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <Screen background="#FFFFFF">
      <StatusBar />
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "190px 80px 0",
          opacity: cartOpacity,
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
          Your cart
        </div>
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 44 }}>
          {ITEMS.map((item, i) => {
            const enter = spring({
              frame: frame - i * 5,
              fps,
              config: { damping: 18, stiffness: 150 },
            });
            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 36,
                  opacity: enter,
                  translate: `${(1 - enter) * 80}px 0px`,
                }}
              >
                <div
                  style={{
                    width: 170,
                    height: 170,
                    borderRadius: 36,
                    background: item.color,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 50, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 38, color: "#7A8090", marginTop: 10 }}>
                    {item.meta}
                  </div>
                </div>
                <div style={{ fontSize: 48, fontWeight: 600 }}>{item.price}</div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 90,
            borderTop: "2px solid #ECEEF3",
            paddingTop: 50,
            display: "flex",
            flexDirection: "column",
            gap: 26,
            fontSize: 42,
            color: "#7A8090",
          }}
        >
          <Row label="Subtotal" value="$16.50" />
          <Row label="Service fee" value="$1.50" />
          <Row label="Total" value="$18.00" strong />
        </div>
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 140,
            height: 150,
            borderRadius: 75,
            background: "#111111",
            color: "#FFFFFF",
            fontSize: 52,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(press),
          }}
        >
          Pay $18.00
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          opacity: check,
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 180,
            background: "#22C55E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(check),
          }}
        >
          <div
            style={{
              width: 120,
              height: 200,
              borderRight: "28px solid #FFFFFF",
              borderBottom: "28px solid #FFFFFF",
              rotate: "45deg",
              translate: "0px -30px",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -2,
            opacity: checkText,
            translate: `0px ${(1 - checkText) * 40}px`,
          }}
        >
          Order placed
        </div>
        <div
          style={{
            fontSize: 42,
            color: "#7A8090",
            opacity: checkText,
            translate: `0px ${(1 - checkText) * 40}px`,
          }}
        >
          Ready for pickup in 8 minutes
        </div>
      </div>
    </Screen>
  );
};

const Row: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly strong?: boolean;
}> = ({ label, value, strong }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        color: strong ? "#111" : undefined,
        fontWeight: strong ? 700 : 400,
        fontSize: strong ? 50 : undefined,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
};
