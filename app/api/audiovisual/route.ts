import { NextResponse } from "next/server";
import { readdirSync } from "fs";
import { join } from "path";

const IMG_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];

function titleFromFilename(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
}

export async function GET() {
  const base = join(process.cwd(), "public", "audiovisual");
  type ApiMediaItem = { type: "image"; src: string; title: string } | { type: "video"; src: string; title: string };
  const items: ApiMediaItem[] = [];

  try {
    const fotosDir = join(base, "fotos");
    let fotos: string[] = [];
    try {
      fotos = readdirSync(fotosDir, { withFileTypes: true })
      .filter((f) => f.isFile() && IMG_EXT.some((e) => f.name.toLowerCase().endsWith(e)))
      .map((f) => f.name)
      .sort();
    } catch {
      /* carpeta fotos no existe o vacía */
    }

    for (const name of fotos) {
      items.push({
        type: "image",
        src: `/audiovisual/fotos/${name}`,
        title: titleFromFilename(name),
      });
    }

    const videosDir = join(base, "videos");
    let videos: string[] = [];
    try {
      videos = readdirSync(videosDir, { withFileTypes: true })
        .filter((f) => f.isFile() && VIDEO_EXT.some((e) => f.name.toLowerCase().endsWith(e)))
        .map((f) => f.name)
        .sort();
    } catch {
      /* carpeta videos no existe o vacía */
    }

    for (const name of videos) {
      items.push({
        type: "video",
        src: `/audiovisual/videos/${name}`,
        title: titleFromFilename(name),
      });
    }
  } catch {
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({ items });
}
