CREATE TYPE "public"."purchase_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"car_brand" varchar(100) NOT NULL,
	"car_model" varchar(100) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" "purchase_status" DEFAULT 'COMPLETED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
