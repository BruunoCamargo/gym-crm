CREATE TABLE `payment_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`planId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`paymentMethod` enum('cash','card','pix','transfer') NOT NULL DEFAULT 'cash',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('monthly','quarterly','semiannual','annual') NOT NULL,
	`name` varchar(100) NOT NULL,
	`durationMonths` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_type_unique` UNIQUE(`type`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`address` text NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`planId` int NOT NULL,
	`paymentStatus` enum('paid','pending','overdue') NOT NULL DEFAULT 'pending',
	`startDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
