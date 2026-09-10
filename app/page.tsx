import { redirect } from "next/navigation";

// Middleware already requires sign-in before any page renders (see
// middleware.ts), so by the time we get here there's nothing for a
// root landing page to do except send people to the real app.
export default function Home() {
  redirect("/dashboard");
}
