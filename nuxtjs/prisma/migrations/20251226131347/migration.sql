-- CreateTable
CREATE TABLE `click_event` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `element_id` VARCHAR(200) NULL,
    `element_type` VARCHAR(50) NULL,
    `page_path` VARCHAR(500) NOT NULL,
    `click_position_x` INTEGER UNSIGNED NULL,
    `click_position_y` INTEGER UNSIGNED NULL,
    `related_id` BIGINT UNSIGNED NULL,
    `related_type` VARCHAR(50) NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `click_event_created_at_idx`(`created_at`),
    INDEX `click_event_event_type_idx`(`event_type`),
    INDEX `click_event_page_path_idx`(`page_path`),
    INDEX `click_event_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coin_transaction` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('recharge', 'consume', 'reward', 'refund') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `balance` DECIMAL(10, 2) NOT NULL,
    `description` VARCHAR(500) NULL,
    `related_id` BIGINT UNSIGNED NULL,
    `related_type` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coin_transaction_created_at_idx`(`created_at`),
    INDEX `coin_transaction_type_idx`(`type`),
    INDEX `coin_transaction_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `content` TEXT NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `like_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active', 'banned', 'deleted') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `comment_created_at_idx`(`created_at`),
    INDEX `comment_parent_id_idx`(`parent_id`),
    INDEX `comment_post_id_idx`(`post_id`),
    INDEX `comment_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_like` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `comment_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comment_like_comment_id_idx`(`comment_id`),
    INDEX `comment_like_user_id_idx`(`user_id`),
    UNIQUE INDEX `comment_like_user_id_comment_id_key`(`user_id`, `comment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `creator_application` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `real_name` VARCHAR(50) NULL,
    `id_card` VARCHAR(50) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `bio` TEXT NULL,
    `qualification_urls` JSON NULL,
    `social_platforms` JSON NULL,
    `social_account` VARCHAR(200) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reject_reason` TEXT NULL,
    `reviewed_by` BIGINT UNSIGNED NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `creator_application_user_id_key`(`user_id`),
    INDEX `creator_application_created_at_idx`(`created_at`),
    INDEX `creator_application_reviewed_by_fkey`(`reviewed_by`),
    INDEX `creator_application_status_idx`(`status`),
    INDEX `creator_application_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follow` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `follower_id` BIGINT UNSIGNED NOT NULL,
    `following_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `follow_follower_id_idx`(`follower_id`),
    INDEX `follow_following_id_idx`(`following_id`),
    UNIQUE INDEX `follow_follower_id_following_id_key`(`follower_id`, `following_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `cover` VARCHAR(500) NULL,
    `avatar` VARCHAR(500) NULL,
    `category` VARCHAR(50) NOT NULL,
    `owner_id` BIGINT UNSIGNED NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `member_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `post_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'active', 'banned', 'deleted') NOT NULL DEFAULT 'pending',
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `island_category_idx`(`category`),
    INDEX `island_created_at_idx`(`created_at`),
    INDEX `island_owner_id_idx`(`owner_id`),
    INDEX `island_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_member` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `island_id` BIGINT UNSIGNED NOT NULL,
    `join_type` ENUM('free', 'paid') NOT NULL DEFAULT 'free',
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `island_member_created_at_idx`(`created_at`),
    INDEX `island_member_island_id_idx`(`island_id`),
    INDEX `island_member_user_id_idx`(`user_id`),
    UNIQUE INDEX `island_member_user_id_island_id_key`(`user_id`, `island_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('system', 'interaction', 'payment') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NULL,
    `related_id` BIGINT UNSIGNED NULL,
    `related_type` VARCHAR(50) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_created_at_idx`(`created_at`),
    INDEX `notification_is_read_idx`(`is_read`),
    INDEX `notification_type_idx`(`type`),
    INDEX `notification_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_view` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `page_path` VARCHAR(500) NOT NULL,
    `page_title` VARCHAR(200) NULL,
    `device_type` VARCHAR(50) NULL,
    `platform` VARCHAR(50) NULL,
    `referrer` VARCHAR(500) NULL,
    `stay_duration` INTEGER UNSIGNED NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_view_created_at_idx`(`created_at`),
    INDEX `page_view_page_path_idx`(`page_path`),
    INDEX `page_view_platform_idx`(`platform`),
    INDEX `page_view_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `island_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(200) NULL,
    `content` TEXT NULL,
    `media_type` ENUM('text', 'image', 'video', 'mixed') NOT NULL DEFAULT 'text',
    `media_urls` JSON NULL,
    `like_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `comment_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `collect_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `view_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `share_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active', 'pending', 'banned', 'deleted') NOT NULL DEFAULT 'active',
    `is_top` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `post_created_at_idx`(`created_at`),
    INDEX `post_island_id_idx`(`island_id`),
    INDEX `post_media_type_idx`(`media_type`),
    INDEX `post_status_idx`(`status`),
    INDEX `post_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_collect` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `post_collect_post_id_idx`(`post_id`),
    INDEX `post_collect_user_id_idx`(`user_id`),
    UNIQUE INDEX `post_collect_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_like` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `post_like_post_id_idx`(`post_id`),
    INDEX `post_like_user_id_idx`(`user_id`),
    UNIQUE INDEX `post_like_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `nickname` VARCHAR(50) NOT NULL,
    `avatar` VARCHAR(500) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `bio` TEXT NULL,
    `background_image` VARCHAR(500) NULL,
    `gender` TINYINT NULL DEFAULT 0,
    `birthday` DATE NULL,
    `role` ENUM('user', 'creator', 'admin') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'banned', 'deleted') NOT NULL DEFAULT 'active',
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `coin_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `follow_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `follower_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `post_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `like_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_phone_key`(`phone`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_created_at_idx`(`created_at`),
    INDEX `user_role_idx`(`role`),
    INDEX `user_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_behavior` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `behavior_type` VARCHAR(50) NOT NULL,
    `target_type` VARCHAR(50) NOT NULL,
    `target_id` BIGINT UNSIGNED NOT NULL,
    `page_path` VARCHAR(500) NULL,
    `device_info` JSON NULL,
    `ip_address` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_behavior_behavior_type_idx`(`behavior_type`),
    INDEX `user_behavior_created_at_idx`(`created_at`),
    INDEX `user_behavior_target_type_target_id_idx`(`target_type`, `target_id`),
    INDEX `user_behavior_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `click_event` ADD CONSTRAINT `click_event_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coin_transaction` ADD CONSTRAINT `coin_transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_like` ADD CONSTRAINT `comment_like_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_like` ADD CONSTRAINT `comment_like_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_application` ADD CONSTRAINT `creator_application_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `creator_application` ADD CONSTRAINT `creator_application_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow` ADD CONSTRAINT `follow_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `island` ADD CONSTRAINT `island_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `island_member` ADD CONSTRAINT `island_member_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `island`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `island_member` ADD CONSTRAINT `island_member_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_view` ADD CONSTRAINT `page_view_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `island`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_collect` ADD CONSTRAINT `post_collect_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_collect` ADD CONSTRAINT `post_collect_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_like` ADD CONSTRAINT `post_like_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_like` ADD CONSTRAINT `post_like_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_behavior` ADD CONSTRAINT `user_behavior_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
