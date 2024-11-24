CREATE TABLE `images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`ai_analysis` text NOT NULL,
	`violates_rules` integer NOT NULL
);
