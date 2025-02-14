import { S3Client, ListBucketsCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import { S3_SECRET_KEY, S3_ACCESS_KEY, S3_ENDPOINT } from "$env/static/private";

const MOTION_DATA_BUCKET = "telemetry-motion-data";

const S3 = new S3Client({
	endpoint: S3_ENDPOINT,
	credentials: {
		accessKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_KEY,
	},
	region: "us-east-1",
	forcePathStyle: true,
});

const { Buckets } = await S3.send(new ListBucketsCommand({}));
if (Buckets?.filter((b) => b.Name === MOTION_DATA_BUCKET).length === 0) {
	await S3.send(
		new CreateBucketCommand({
			Bucket: MOTION_DATA_BUCKET,
		}),
	);
}

export { S3, MOTION_DATA_BUCKET };
