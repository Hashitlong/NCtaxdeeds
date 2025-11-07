CREATE TABLE `counties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`fipsCode` varchar(5),
	`population` int,
	`websiteUrl` text,
	`taxOfficeUrl` text,
	`foreclosureUrl` text,
	`primarySource` varchar(100),
	`scraperEnabled` int NOT NULL DEFAULT 1,
	`lastSuccessfulScrape` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `counties_id` PRIMARY KEY(`id`),
	CONSTRAINT `counties_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`county` varchar(50) NOT NULL,
	`address` text,
	`city` varchar(100),
	`zipCode` varchar(10),
	`parcelId` varchar(100) NOT NULL,
	`saleDate` timestamp,
	`saleTime` varchar(20),
	`saleStatus` enum('scheduled','in_upset_period','sold','cancelled') DEFAULT 'scheduled',
	`saleLocation` text,
	`openingBid` int,
	`currentBid` int,
	`upsetBidCloseDate` timestamp,
	`upsetBidCount` int DEFAULT 0,
	`propertyType` varchar(100),
	`propertyDescription` text,
	`acreage` varchar(50),
	`squareFootage` int,
	`legalDescription` text,
	`taxAmountOwed` int,
	`assessedValue` int,
	`courtFileNumber` varchar(100),
	`caseNumber` varchar(100),
	`attorneyFirm` varchar(200),
	`attorneyFileNumber` varchar(100),
	`sourceUrl` text,
	`sourceType` varchar(50),
	`firstScrapedAt` timestamp NOT NULL DEFAULT (now()),
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propertyHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	`fieldName` varchar(50),
	`oldValue` text,
	`newValue` text,
	`changeType` varchar(50),
	CONSTRAINT `propertyHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scrapeHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceName` varchar(100) NOT NULL,
	`sourceType` varchar(50) NOT NULL,
	`scrapeStartedAt` timestamp NOT NULL,
	`scrapeCompletedAt` timestamp,
	`status` enum('success','failed','partial'),
	`propertiesFound` int,
	`propertiesNew` int,
	`propertiesUpdated` int,
	`errorMessage` text,
	`metadata` text,
	CONSTRAINT `scrapeHistory_id` PRIMARY KEY(`id`)
);
