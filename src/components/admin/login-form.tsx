"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/actions/admin";
import { Button } from "@/components/shared/ui/button";

export function AdminLoginForm() {
  const [state, formAction] = useActionState<LoginActionState, FormData>(loginAction, undefined);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm text-[#5f564b]">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="owner@stonza.pk"
          className="rounded-2xl border border-[#d8ccb9] bg-[#fffdf9] px-4 py-3 text-[#171717]"
        />
      </label>
      <label className="grid gap-2 text-sm text-[#5f564b]">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          className="rounded-2xl border border-[#d8ccb9] bg-[#fffdf9] px-4 py-3 text-[#171717]"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <Button className="mt-2 w-full">Enter admin portal</Button>
    </form>
  );
}
