import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Overturn — Every denial deserves a fight.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A1628",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            color: "#E84B2C",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          For small medical practices
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: 980,
              display: "flex",
            }}
          >
            Stop letting insurers steal your revenue.
          </div>
          <div
            style={{
              color: "#B3C1D5",
              fontSize: 32,
              fontWeight: 500,
              maxWidth: 880,
              display: "flex",
            }}
          >
            Denied claims into winning appeals in 60 seconds.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            Overturn
          </div>
          <div
            style={{
              color: "#7D92AD",
              fontSize: 22,
              fontWeight: 500,
              display: "flex",
            }}
          >
            hioverturn.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
