// One-time bootstrap: creates (or updates) the owner's real Supabase Auth
// account, a matching public.profiles row, and assigns the 'owner' role via
// public.user_roles -- the prerequisite for cutting admin login over from
// the demo cookie to real Supabase Auth. Safe to re-run.
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  const env = {};
  fs.readFileSync(file, "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      env[m[1]] = v;
    }
  });
  return env;
}

async function main() {
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));
  const ownerEmail = env.OWNER_EMAIL;
  const ownerPassword = env.OWNER_PASSWORD;
  if (!ownerEmail || !ownerPassword) {
    throw new Error("OWNER_EMAIL / OWNER_PASSWORD must be set in .env.local first.");
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Find or create the auth user.
  let userId;
  const { data: existingList, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listError) throw new Error(`listUsers failed: ${listError.message}`);
  const existing = existingList.users.find((u) => u.email?.toLowerCase() === ownerEmail.toLowerCase());

  if (existing) {
    userId = existing.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: ownerPassword,
      email_confirm: true,
    });
    if (updateError) throw new Error(`updateUserById failed: ${updateError.message}`);
    console.log("Auth user already existed, password/confirmation refreshed:", userId);
  } else {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
    });
    if (createError) throw new Error(`createUser failed: ${createError.message}`);
    userId = created.user.id;
    console.log("Auth user created:", userId);
  }

  // 2. Upsert the matching profile row.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, email: ownerEmail, full_name: "Owner" }, { onConflict: "id" });
  if (profileError) throw new Error(`profiles upsert failed: ${profileError.message}`);
  console.log("Profile upserted.");

  // 3. Look up the 'owner' role and assign it.
  const { data: ownerRole, error: roleError } = await supabase.from("roles").select("id").eq("key", "owner").single();
  if (roleError) throw new Error(`roles lookup failed: ${roleError.message}`);

  const { error: assignError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_id: ownerRole.id }, { onConflict: "user_id,role_id" });
  if (assignError) throw new Error(`user_roles upsert failed: ${assignError.message}`);
  console.log("Owner role assigned.");

  console.log("\nBootstrap complete. Owner can now sign in via Supabase Auth with:");
  console.log("  email:", ownerEmail);
  console.log("  password: (the OWNER_PASSWORD already in .env.local)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
