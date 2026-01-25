import type { Route } from "./+types/legacy-redirect-about";
import { redirect } from "react-router";
import { defaultLng } from "@/i18n/config";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return redirect(`/${defaultLng}${url.pathname}${url.search}${url.hash}`);
}

export default function LegacyRedirectAbout() {
  return null;
}

