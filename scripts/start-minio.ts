const CONTAINER_NAME = "minio-dev";
const MINIO_PORT = 9000;
const MINIO_CONSOLE_PORT = 9001;
const MINIO_ROOT_PASSWORD = process.env.MINIO_ROOT_PASSWORD;

try {
	let proc = Bun.spawn(["docker", "ps", "-a", "--format", `"{{.Names}}"`]);
	let runningContainers = await new Response(proc.stdout).text();

	if (!runningContainers.includes(CONTAINER_NAME)) {
		console.log("Starting MinIO...");

		Bun.spawn(
			[
				"docker",
				"run",
				"-d",
				"--rm",
				"--name",
				CONTAINER_NAME,
				"-p",
				`${MINIO_PORT}:9000`,
				"-p",
				`${MINIO_CONSOLE_PORT}:9001`,
				"-e",
				"MINIO_ROOT_USER=admin",
				"-e",
				`MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}`,
				"quay.io/minio/minio",
				"server",
				"/data",
				"--console-address",
				":9001"
			],
			{
				stdout: "inherit"
			}
		);
	}
} catch (error) {
	console.error("Error starting MinIO:", error);
	process.exit(1);
}
