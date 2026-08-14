import { getAdminSession, getOwnerEmail } from "@/lib/auth/session";
import { rolePermissions } from "@/lib/permissions";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  const ownerEmail = getOwnerEmail();
  const role = session?.role ?? "owner";
  const permissions = rolePermissions[role];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-white/42">Access</p>
        <h1 className="text-display mt-3 text-4xl">Admin users</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
          The current portal is protected with a single owner account, and permissions are enforced server-side for every admin route and mutation.
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Signed-in account</p>
          <p className="mt-3 text-lg font-medium text-white">{session?.email ?? ownerEmail}</p>
          <p className="mt-1 text-sm capitalize text-white/58">Role: {role.replaceAll("_", " ")}</p>
          <p className="mt-4 text-sm text-white/52">
            Auth mode: <span className="text-white">owner credential session</span>
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-[#111213] p-6">
        <h2 className="text-xl text-white">Granted permissions</h2>
        <div className="mt-5 grid gap-3">
          {permissions.map((permission) => (
            <div
              key={permission}
              className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-white/78"
            >
              {permission}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
