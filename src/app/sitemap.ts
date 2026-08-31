import type { MetadataRoute } from "next";
import { SHOW_AUTH_UI } from "./lib/feature-flags";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://examencivica.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/quiz", "/preguntas", "/repasar", "/entrevista"];
  if (SHOW_AUTH_UI) {
    routes.push("/progress", "/login", "/forgot-password");
  }

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
