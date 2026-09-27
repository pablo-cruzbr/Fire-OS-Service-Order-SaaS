import { redirect } from "next/navigation";

// The marketing landing page lives in "landing page/" and is deployed on its own.
export default function Home() {
  redirect("/login");
}
