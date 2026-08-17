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
    <div className="admin-login flex min-h-screen items-center justify-center bg-[#f3efe8] px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-[#e7dfd1] bg-[#fffdfa] p-8 shadow-[0_18px_44px_rgba(23,17,11,0.08)]">
        <div className="mb-8 space-y-5 text-center">
          <div className="flex justify-center">
            <Logo dark href="/admin/login" />
          </div>
          <div>
            <h1 className="text-display text-4xl text-[#171717]">Admin access</h1>
            <p className="mt-3 text-sm leading-7 text-[#6f6558]">
              Secure owner credential sign-in is enabled for the STONZA operations portal.
            </p>
          </div>
        </div>
        <form action={loginAction} className="grid gap-4">
          <label className="grid gap-2 text-sm text-[#5f564b]">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={getOwnerEmail()}
              className="rounded-2xl border border-[#d8ccb9] bg-[#fffdf9] px-4 py-3 text-[#171717]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#5f564b]">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue={getOwnerPassword()}
              className="rounded-2xl border border-[#d8ccb9] bg-[#fffdf9] px-4 py-3 text-[#171717]"
            />
          </label>
          <Button className="mt-2 w-full">Enter admin portal</Button>
        </form>
      </div>
    </div>
  );
}
