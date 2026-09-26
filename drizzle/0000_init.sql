CREATE TYPE "public"."price_unit" AS ENUM('job', 'visit', 'hour', 'day', 'sqft');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('draft', 'pending', 'approved', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('wrong_number', 'not_real', 'bad_behaviour', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('open', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('published', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."verification_kind" AS ENUM('nic');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"visitor_id" text,
	"user_id" uuid,
	"provider_id" uuid,
	"category_id" integer,
	"town_id" integer,
	"query" text,
	"source" text,
	"props" jsonb
);
--> statement-breakpoint
CREATE TABLE "otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_categories" (
	"provider_id" uuid NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "provider_categories_provider_id_category_id_pk" PRIMARY KEY("provider_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "provider_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" uuid NOT NULL,
	"key" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" uuid NOT NULL,
	"name" text NOT NULL,
	"price_from" integer,
	"price_unit" "price_unit" DEFAULT 'job' NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"business_name" text,
	"bio" text,
	"phone" text NOT NULL,
	"whatsapp" text,
	"photo_key" text,
	"town_id" integer,
	"service_radius_km" smallint DEFAULT 10 NOT NULL,
	"status" "provider_status" DEFAULT 'draft' NOT NULL,
	"setup_step" smallint DEFAULT 1 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"available_until" timestamp with time zone,
	"last_active_at" timestamp with time zone,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL,
	"suspended_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	CONSTRAINT "providers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"visitor_id" text,
	"user_id" uuid,
	"reason" "report_reason" NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "review_tag_links" (
	"review_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "review_tag_links_review_id_tag_id_pk" PRIMARY KEY("review_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "review_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"names" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sort" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "review_tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"status" "review_status" DEFAULT 'published' NOT NULL,
	"had_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"names" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"icon" text DEFAULT 'wrench' NOT NULL,
	"search_terms" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "service_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "towns" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"names" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"district" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "towns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text NOT NULL,
	"name" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"kind" "verification_kind" DEFAULT 'nic' NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"nic_hmac" text,
	"nic_last4" text,
	"document_key" text,
	"reviewer_id" uuid,
	"reviewed_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_photos" ADD CONSTRAINT "provider_photos_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_services" ADD CONSTRAINT "provider_services_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_town_id_towns_id_fk" FOREIGN KEY ("town_id") REFERENCES "public"."towns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_tag_id_review_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."review_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_type_time_idx" ON "events" USING btree ("type","occurred_at");--> statement-breakpoint
CREATE INDEX "events_provider_type_time_idx" ON "events" USING btree ("provider_id","type","occurred_at");--> statement-breakpoint
CREATE INDEX "events_visitor_time_idx" ON "events" USING btree ("visitor_id","occurred_at");--> statement-breakpoint
CREATE INDEX "otp_phone_created_idx" ON "otp_challenges" USING btree ("phone","created_at");--> statement-breakpoint
CREATE INDEX "otp_ip_created_idx" ON "otp_challenges" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX "provider_categories_cat_idx" ON "provider_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "provider_photos_provider_idx" ON "provider_photos" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "provider_services_provider_idx" ON "provider_services" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "providers_status_town_idx" ON "providers" USING btree ("status","town_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_provider_user_uq" ON "reviews" USING btree ("provider_id","user_id");--> statement-breakpoint
CREATE INDEX "reviews_provider_created_idx" ON "reviews" USING btree ("provider_id","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_status_idx" ON "verifications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "verifications_nic_idx" ON "verifications" USING btree ("nic_hmac");