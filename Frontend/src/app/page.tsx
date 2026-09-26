import { redirect } from "next/navigation";

// The marketing landing page lives in /Landing and is deployed on its own.
export default function Home() {
  redirect("/login");
}
