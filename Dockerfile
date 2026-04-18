# Use PHP 8.3 with Apache as the base image for Laravel 11
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    zip \
    unzip \
    git \
    curl \
    libsqlite3-dev \
    libsodium-dev \
    zlib1g-dev \
    libssl-dev \
    fonts-liberation \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Add the mlocati/php-extension-installer to simplify PHP extension management
# This tool automatically installs required system dependencies for extensions
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install PHP extensions required for Laravel, PDF generation, and Internationalization
# We removed 'tokenizer' as it is already part of the PHP 8.3 core
RUN install-php-extensions \
    pdo_mysql \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    xsl \
    opcache \
    mbstring

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Environment variables for Composer
# Using -1 for memory limit to prevent build-time OOM errors
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1

# Copy project files
COPY . .

# Install PHP dependencies - "Nuclear Option"
# 1. Added --ignore-platform-reqs to bypass strict extension version checks during build
# 2. Removed --optimize-autoloader to drastically reduce RAM usage (the most common cause of exit code 2)
# 3. Added --no-progress to reduce log overhead
RUN composer install --no-dev --no-interaction --no-scripts --no-progress --ignore-platform-reqs

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Configure Apache for Laravel
# 1. Copy our custom configuration
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# 2. Enable mod_rewrite and our site
RUN a2enmod rewrite

# Expose port 80
EXPOSE 80

# Make deployment script executable
RUN chmod +x /var/www/html/deploy.sh

# Start using the specialized deployment script
CMD ["/var/www/html/deploy.sh"]
