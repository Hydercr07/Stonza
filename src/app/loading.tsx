import { Logo } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Logo light />
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Preparing original stones</p>
      </div>
    </div>
  );
}
