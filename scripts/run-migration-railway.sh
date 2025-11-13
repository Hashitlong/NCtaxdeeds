#!/bin/bash
# Run this in your Railway shell terminal
# This will update the teamRating enum to include the new values

echo "Running migration to add new rating values..."
echo "ALTER TABLE \`properties\` MODIFY COLUMN \`teamRating\` ENUM('good', 'bad', 'watching', 'needs_viewed', 'viewed');" | mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD -P $MYSQLPORT $MYSQLDATABASE

echo "Migration complete! The new rating values should now work."