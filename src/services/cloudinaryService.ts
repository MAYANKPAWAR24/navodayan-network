export type CloudinaryVariant = "feed" | "avatar";

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

export function getCloudinaryEnv() {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  };
}

export function isCloudinaryConfigured(): boolean {
  const { cloudName, uploadPreset } = getCloudinaryEnv();
  return Boolean(cloudName && uploadPreset);
}

export function buildInitialsAvatarUrl(name: string): string {
  const initials = (name || "NV")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#0B132B"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="40" fill="url(#g)"/>
      <circle cx="150" cy="48" r="18" fill="#F59E0B" opacity="0.8"/>
      <text x="100" y="115" text-anchor="middle" fill="#FCD34D" font-family="Arial, sans-serif" font-size="62" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export function getOptimizedCloudinaryUrl(publicId: string, variant: CloudinaryVariant = "feed", cloudName = getCloudinaryEnv().cloudName) {
  if (!cloudName) return DEFAULT_AVATAR;

  const transform =
    variant === "avatar"
      ? "f_auto,q_auto,w_300,c_fill,g_face"
      : "f_auto,q_auto,w_800";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

export async function uploadImageToCloudinary(file: File, variant: CloudinaryVariant = "feed") {
  const { cloudName, uploadPreset } = getCloudinaryEnv();

  if (!cloudName || !uploadPreset) {
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || "Image upload failed.");
  }

  const payload = (await response.json()) as CloudinaryUploadResult & { secure_url?: string; url?: string; public_id?: string };
  const secure = payload.secure_url || payload.url;
  if (!secure || !payload.public_id) {
    return null;
  }

  return getOptimizedCloudinaryUrl(payload.public_id, variant, cloudName);
}
