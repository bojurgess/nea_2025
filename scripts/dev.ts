const { $ } = await import("bun");

const containerName = "postgres_dev";
const composeFile = "docker/postgresql/docker-compose.dev.yml";

try {
  const { stdout } = await $`docker ps --filter name=${containerName} --format "{{.Names}}"`;

  if (!stdout.toString().trim().includes(containerName)) {
    console.log(`🔄 Starting ${containerName}...`);
    await $`docker compose -f ${composeFile} up -d`;
  } else {
    console.log(`✅ ${containerName} is already running.`);
  }

  console.log("🚀 Starting dev...");
  await $`bun run --filter './apps/*' dev`;

} catch (err) {
  console.error("❌ Error running dev script:", err);
  process.exit(1);
}
