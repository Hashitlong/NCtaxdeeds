-- Add new rating values to teamRating enum
ALTER TABLE `properties` MODIFY COLUMN `teamRating` ENUM('good', 'bad', 'watching', 'needs_viewed', 'viewed');