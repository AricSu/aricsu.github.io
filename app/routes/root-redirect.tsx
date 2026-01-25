import type { Route } from "./+types/root-redirect";
import { redirect } from "react-router";
import { defaultLng } from "@/i18n/config";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return redirect(`/${defaultLng}${url.search}${url.hash}`);
}

export default function RootRedirect() {
  return null;
}

