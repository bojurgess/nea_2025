ALTER TABLE "laps" ADD COLUMN "assists" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "laps" ADD COLUMN "car_telemetry_data" jsonb;--> statement-breakpoint
ALTER TABLE "telemetry_sessions" DROP COLUMN "assists";--> statement-breakpoint
ALTER TABLE "telemetry_sessions" DROP COLUMN "car_telemetry_data";