import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 10,
          border: "1px solid rgba(245, 158, 11, 0.4)",
          fontFamily: "serif",
          fontWeight: 900,
          color: "#FCD34D",
          fontSize: 18,
        }}
      >
        JN
      </div>
    ),
    { ...size }
  );
}
