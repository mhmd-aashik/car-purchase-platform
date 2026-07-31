ALTER TABLE "cars" ADD COLUMN "reserved_by" varchar(255);--> statement-breakpoint
ALTER TABLE "cars" ADD COLUMN "reserved_until" timestamp with time zone;