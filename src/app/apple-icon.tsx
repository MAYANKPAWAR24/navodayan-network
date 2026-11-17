import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1E3A8A 0%, #0B132B 100%)",
          borderRadius: 40,
          border: "4px solid rgba(245, 158, 11, 0.45)",
          fontFamily: "serif",
          fontWeight: 900,
          color: "#FCD34D",
          fontSize: 92,
        }}
      >
        JN
      </div>
    ),
    { ...size }
  );
}
