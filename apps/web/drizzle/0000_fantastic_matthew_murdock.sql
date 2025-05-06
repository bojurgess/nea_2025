CREATE TABLE "laps" (
	"id" integer NOT NULL,
	"session_uid" text NOT NULL,
	"lap_time_in_ms" integer NOT NULL,
	"sector_1_time_in_ms" integer NOT NULL,
	"sector_2_time_in_ms" integer NOT NULL,
	"sector_3_time_in_ms" integer NOT NULL,
	"lap_valid_bit_flags" integer NOT NULL,
	CONSTRAINT "laps_id_session_uid_pk" PRIMARY KEY("id","session_uid")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"jti" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "refresh_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" integer NOT NULL,
	"session_ip" text,
	"session_country" text,
	"session_city" text,
	"session_region" text,
	"device_type" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "telemetry_sessions" (
	"uid" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"player_car_index" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"total_distance" integer NOT NULL,
	"weather" integer NOT NULL,
	"time_of_day" integer NOT NULL,
	"total_laps" integer NOT NULL,
	"track_id" integer NOT NULL,
	"assists" integer NOT NULL,
	"car_telemetry_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" integer PRIMARY KEY NOT NULL,
	"gp_name" text NOT NULL,
	"first_gp" timestamp NOT NULL,
	"real_lap_record" integer NOT NULL,
	"country" text NOT NULL,
	"location" text NOT NULL,
	"track_name" text NOT NULL,
	"track_length" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"avatar" text,
	"flag" text,
	"hashed_password" text NOT NULL,
	"join_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "laps" ADD CONSTRAINT "laps_session_uid_telemetry_sessions_uid_fk" FOREIGN KEY ("session_uid") REFERENCES "public"."telemetry_sessions"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_sessions" ADD CONSTRAINT "telemetry_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telemetry_sessions" ADD CONSTRAINT "telemetry_sessions_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;