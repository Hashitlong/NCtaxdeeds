ALTER TABLE `properties` ADD `teamRating` enum('good','bad','watching');--> statement-breakpoint
ALTER TABLE `properties` ADD `ratedBy` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `ratedAt` timestamp;