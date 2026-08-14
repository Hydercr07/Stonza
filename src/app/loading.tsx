import { Logo } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="section-noise flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#10233a_0%,#0b1623_100%)]">
      <div className="space-y-5 text-center">
        <div className="float-orb mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/12 bg-white/8 backdrop-blur-sm">
          <Logo light className="w-[120px]" />
        </div>
        <p className="text-xs uppercase tracking-[0.34em] text-white/45">Preparing original stones</p>
      </div>
    </div>
  );
}
