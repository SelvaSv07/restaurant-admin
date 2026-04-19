import { LoginForm } from "@/components/app/login-form";

type Search = {
  next?: string;
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const nextRaw = typeof params.next === "string" ? params.next.trim() : "";
  const nextPath = nextRaw.startsWith("/") ? nextRaw : "/dashboard";

  return <LoginForm nextPath={nextPath} />;
}
