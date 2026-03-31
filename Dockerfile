# Use PHP 8.3 with Apache as the base image for Laravel 11
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libicu-dev \
    libxslt-dev \
    fonts-liberation \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required for Laravel, PDF generation, and Internationalization
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    xml \
    xsl \
    opcache

# Enable Apache mod_rewrite for Laravel routing
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Environment variables for Composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy project files
COPY . .

# Install PHP dependencies
# We use --no-scripts first to avoid issues with artisan commands during build
# Then we run the scripts after setting permissions
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Update Apache configuration to serve from /public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Expose port 80
EXPOSE 80

# Make deployment script executable
RUN chmod +x /var/www/html/deploy.sh

# Start using the specialized deployment script
CMD ["/var/www/html/deploy.sh"]
