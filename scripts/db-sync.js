const { execSync } = require("child_process");

if (process.env.POSTGRES_PRISMA_URL) {
  console.log("⚡ Vercel Postgres detected! Synchronizing database tables...");
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    console.log("✅ Database tables successfully created/updated!");
  } catch (err) {
    console.error("Warning: prisma db push encountered an issue:", err.message);
  }
} else {
  console.log("ℹ️ No POSTGRES_PRISMA_URL found. Skipping database push.");
}
