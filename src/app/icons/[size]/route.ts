import { createElement } from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: { size: string } }
) {
  const size = Number(params.size);
  if (size !== 192 && size !== 512) {
    return new Response("Icon size not found", { status: 404 });
  }

  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1E3A8A 0%, #0B132B 100%)",
          borderRadius: size * 0.18,
          border: `${Math.max(4, size * 0.02)}px solid rgba(245, 158, 11, 0.5)`,
          fontFamily: "serif",
          fontWeight: 900,
          color: "#FCD34D",
          fontSize: size * 0.42,
        },
      },
      "JN"
    ),
    { width: size, height: size }
  );
}
