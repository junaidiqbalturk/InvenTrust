#!/bin/sh

# Exit on error
set -e

echo "🚀 Starting InvenTrust Deployment Script..."

# Optimize Laravel for production
# These commands cache the configuration and routes for faster performance
echo "📦 Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
# The --force flag is required when running migrations in production
echo "🗄️ Running Migrations..."
php artisan migrate --force

# Seed the database with essential data (Admin user, Roles, initial Accounts)
# Only run this if the database is empty or if you want to ensure defaults exist
echo "🌱 Seeding Essential Data..."
php artisan db:seed --force

# Start Apache in the foreground
echo "🔥 Starting Apache Web Server..."
exec apache2-foreground
