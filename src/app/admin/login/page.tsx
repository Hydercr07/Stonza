import { loginAction } from "@/actions/admin";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/shared/ui/button";
import { getOwnerEmail, getOwnerPassword } from "@/lib/auth/session";

export const metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0e0f] px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#141516] p-8">
        <div className="mb-8 space-y-5 text-center">
          <div className="flex justify-center">
            <Logo light href="" />
          </div>
          <div>
            <h1 className="text-display text-4xl text-white">Admin access</h1>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Local demo auth is active until Supabase credentials are configured.
            </p>
          </div>
        </div>
        <form action={loginAction} className="grid gap-4">
          <label className="grid gap-2 text-sm text-white/72">
            Email
            <input
              name="email"
              type="email"
              defaultValue={getOwnerEmail()}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/72">
            Password
            <input
              name="password"
              type="password"
              defaultValue={getOwnerPassword()}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
            />
          </label>
          <Button className="mt-2 w-full">Enter admin portal</Button>
        </form>
      </div>
    </div>
  );
}
