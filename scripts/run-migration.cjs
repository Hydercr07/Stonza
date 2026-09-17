const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

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
  const migrationFile = process.argv[2];
  const env = loadEnv(path.join(__dirname, "..", ".env.local"));
  const client = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const sql = fs.readFileSync(migrationFile, "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("commit");
    console.log("Migration applied successfully.");
  } catch (err) {
    await client.query("rollback");
    console.error("Migration FAILED, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
