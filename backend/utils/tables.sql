CREATE DATABASE project_registor;
USE project_registor;


CREATE TABLE guide_requests (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_guide_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_semester` INT NOT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `to_guide_reg_num`),
  INDEX `idx_status` (status)
);


CREATE TABLE `project_completion_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reg_num` varchar(255) NOT NULL,
  `team_id` int NOT NULL,
  `project_id` int NOT NULL,
  `outcome` varchar(255) DEFAULT NULL,
  `report` varchar(255) DEFAULT NULL,
  `ppt` varchar(255) DEFAULT NULL,
  `file_classification` varchar(100) not null,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_team_id` (`team_id`),
  INDEX `idx_project_id` (`project_id`)
);

CREATE TABLE `projects` (
  `project_id` varchar(50) NOT NULL,
  `team_id` VARCHAR(200) NOT NULL,
  `project_name` varchar(500) DEFAULT NULL,
  `cluster` varchar(100) DEFAULT NULL,
  `description` text,
  `outcome` text,
  `hard_soft` varchar(50) NOT NULL,
  `project_type` varchar(50) DEFAULT NULL,
  `tl_reg_num` VARCHAR(20) DEFAULT NULL,
  `posted_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `unique_project_name` (`project_name`)
);

CREATE TABLE team_requests (
  team_id varchar(20),
  name varchar(255) DEFAULT NULL,
  emailId varchar(255) DEFAULT NULL,
  reg_num varchar(255) DEFAULT NULL,
  dept varchar(255) DEFAULT NULL,
  from_reg_num varchar(255) NOT NULL,
  to_reg_num varchar(255) NOT NULL,
  status varchar(255) DEFAULT 'interested',
  reason TEXT DEFAULT NULL,
  team_conformed int DEFAULT '0',
  UNIQUE KEY unique_request (from_reg_num,to_reg_num),
  PRIMARY KEY (from_reg_num, to_reg_num)
);

CREATE TABLE `queries` (
  `query_id` int NOT NULL AUTO_INCREMENT,
  `team_id` varchar(200) DEFAULT NULL,
  `project_id` varchar(200) DEFAULT NULL,
  `project_name` varchar(200) DEFAULT NULL,
  `team_member` varchar(200) DEFAULT NULL,
  `query` text,
  `reply` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `guide_reg_num` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`query_id`),
  INDEX `team_id` (`team_id`),
  INDEX `project_id` (`project_id`)
);

CREATE TABLE `scheduled_reviews` (
  `review_id` INT NOT NULL AUTO_INCREMENT,
  `project_id` VARCHAR(100) DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_lead` VARCHAR(300) DEFAULT NULL,
  `review_date` DATE DEFAULT NULL,
  `review_title` VARCHAR(100) NOT NULL,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `attendance` VARCHAR(255) DEFAULT null,
  `marks` VARCHAR(20) DEFAULT NULL,
  `remarks` VARCHAR(5000) DEFAULT NULL,
  `team_id` VARCHAR(300) DEFAULT NULL,
  `expert_reg_num` varchar(100) not null,
  `guide_reg_num` VARCHAR(100) NOT NULL,
  `meeting_link` varchar(500) default null,
  PRIMARY KEY (`review_id`)
);

CREATE TABLE `sub_expert_requests` (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `to_expert_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_semester` INT NOT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `to_expert_reg_num`),
  INDEX `idx_status` (`status`)
);



CREATE TABLE `weekly_logs_deadlines` (
  `team_id` varchar(50) NOT NULL,
  `project_id` varchar(100) NOT NULL,  -- Changed from DEFAULT NULL to NOT NULL
`semester` INT DEFAULT NULL,
  `week1` date DEFAULT NULL,
  `week2` date DEFAULT NULL,
  `week3` date DEFAULT NULL,
  `week4` date DEFAULT NULL,
  `week5` date DEFAULT NULL,
  `week6` date DEFAULT NULL,
  `week7` date DEFAULT NULL,
  `week8` date DEFAULT NULL,
  `week9` date DEFAULT NULL,
  `week10` date DEFAULT NULL,
  `week11` date DEFAULT NULL,
  `week12` date DEFAULT NULL,
  PRIMARY KEY (team_id, project_id),
  INDEX idx_team (team_id),
  INDEX idx_project (project_id)
);

CREATE TABLE `semester_wise_deadline` (
`semester` INT NOT NULL,
  `week1` date DEFAULT NULL,
  `week2` date DEFAULT NULL,
  `week3` date DEFAULT NULL,
  `week4` date DEFAULT NULL,
  `week5` date DEFAULT NULL,
  `week6` date DEFAULT NULL,
  `week7` date DEFAULT NULL,
  `week8` date DEFAULT NULL,
  `week9` date DEFAULT NULL,
  `week10` date DEFAULT NULL,
  `week11` date DEFAULT NULL,
  `week12` date DEFAULT NULL,
  PRIMARY KEY (semester)
);

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `emailId` VARCHAR(200) NOT NULL,
  `password` VARCHAR(200) DEFAULT NULL,
  `role` VARCHAR(200) DEFAULT NULL,
   google_id VARCHAR(255) UNIQUE,
--     display_name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
   avatar VARCHAR(255),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reg_num` VARCHAR(200) NOT NULL UNIQUE,
  `name` VARCHAR(200) DEFAULT NULL,
  `dept` VARCHAR(200) DEFAULT NULL,
  `semester` INT DEFAULT NULL,
  `company_name` VARCHAR(300) DEFAULT NULL,
  `company_contact` VARCHAR(50) DEFAULT NULL,
  `company_address` VARCHAR(200) DEFAULT NULL,
  `project_type` VARCHAR(200) DEFAULT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `available` TINYINT DEFAULT 1,
  -- available_guide_request_count INT DEFAULT NULL,
  -- available_expert_request_count INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`emailId`)
);


select * from users;
	INSERT INTO users (emailId, password, role, reg_num, name, dept, semester, company_name, company_contact, company_address, project_type, phone_number, available)
	VALUES
	-- Student 1
	('student1@gmail.com', 'SamS12@123', 'student', 'REG001', 'John Doe', 'Computer Science', 5, NULL, NULL, NULL, 'internal', '9876543210', 1),
	-- Student 2
	('student2@gmail.com', 'SamS12@123', 'student', 'REG002', 'Jane Smith', 'Electrical Engineering', 7, NULL, NULL, NULL, 'external', '9876543211', 1),
	-- Student 3
	('student3@gmail.com', 'SamS12@123', 'student', 'REG003', 'Jane sree', 'marine Engineering', 5, NULL, NULL, NULL, 'internal', '9876543211', 1),
	-- Student 4
	('student4@gmail.com', 'SamS12@123', 'student', 'REG004', 'John ', 'Computer Science', 5, NULL, NULL, NULL, 'internal', '9876543210', 1),
	-- Student 5
	('student5@gmail.com', 'SamS12@123', 'student', 'REG005', 'Smith', 'Electrical Engineering', 7, NULL, NULL, NULL, 'external', '9876543211', 1),
	-- Student 6
	('student6@gmail.com', 'SamS12@123', 'student', 'REG006', 'sree', 'marine Engineering', 5, NULL, NULL, NULL, 'internal', '9876543211', 1),
	-- Admin
	('admin@gmail.com', 'SamS12@123', 'admin', 'ADMIN001', 'Admin User', NULL, NULL, NULL, NULL, NULL, NULL, '9876543215', 1);


	-- 	INSERT INTO users (emailId, password, role, reg_num, name, dept, semester, company_name, company_contact, company_address, project_type, phone_number, available, available_guide_request_count , available_expert_request_count)
	-- VALUES 	-- Guide/Professor 1
	-- ('prof1@gmail.com', 'SamS12@123', 'staff', 'GUIDE001', 'Dr. Robert Johnson', 'Computer Science', NULL, NULL, NULL, NULL, NULL, '9876543212', 1,4,4),
	-- -- Guide/Professor 2
	-- ('prof2@gmail.com', 'SamS12@123', 'staff', 'GUIDE002', 'Dr. Emily Davis', 'Electrical Engineering', NULL, NULL, NULL, NULL, NULL, '9876543213', 1,4,4),
	-- -- Guide/Professor 3
	-- ('prof3@gmail.com', 'SamS12@123', 'staff', 'GUIDE003', 'Dr. Michael Brown', ' Information technology', NULL, NULL, NULL, NULL, NULL, '9876543213', 1,4,4);

INSERT INTO users (emailId, role, reg_num, name, dept, semester, company_name, company_contact, company_address, project_type, phone_number, available)
	VALUES

	('kodeeswaranmanjunathan@gmail.com', 'student', '201EE15', 'USER1', 'Computer Science', 5, NULL, NULL, NULL,'internal',  '9876543210', 1),
    ('kodeeswaranm2221662@gmail.com', 'student', '201EE166', 'USER2', 'Computer Science', 5, NULL, NULL, NULL,'internal',  '9876543210', 1),
    ('kodeeswaran.ee20@bitsathy.ac.in', 'student', '201EE177', 'USER3', 'Computer Science', 5, NULL, NULL, NULL,'internal',  '9876543210', 1);

CREATE TABLE timeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    team_id INT,
    cron_executed boolean default false,
    INDEX index_start_date (start_date),
    INDEX index_end_date (end_date),
    INDEX index_date_range (start_date, end_date)
);
INSERT INTO `timeline` VALUES 
(1,'Team Formation','2025-06-10 00:00:00','2025-06-15 00:00:00',0,NULL),
(2,'Assign Guides and Mentors','2025-06-16 00:00:00','2025-06-19 00:00:00',0,NULL),
(3,'Submit Project Details','2025-06-20 00:00:00','2025-06-25 00:00:00',0,NULL),
(4,'Start Project Development','2025-06-26 00:00:00','2025-06-30 00:00:00',0,NULL),
(5,'Review 1','2025-07-01 00:00:00','2025-07-25 00:00:00',0,NULL),
(6,'Review 2','2025-07-26 00:00:00','2025-08-20 00:00:00',0,NULL),
(7,'Submit Report & PPT','2025-08-21 00:00:00','2025-08-31 00:00:00',0,NULL),
(8,'Optional Review','2025-09-01 00:00:00','2025-09-15 00:00:00',0,NULL);

CREATE TABLE weekly_logs_verification (
    team_id VARCHAR(100) NOT NULL,
    week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 12),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(100),
    verified_at DATETIME DEFAULT NULL,
    remarks TEXT,
    status varchar(50) default null,
    reason text default null,
    PRIMARY KEY (team_id, week_number)
);

CREATE TABLE review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(20),
  project_id VARCHAR(50) NOT NULL,
  project_name VARCHAR(100) NOT NULL,
  team_lead VARCHAR(50) NOT NULL,
  review_date DATE DEFAULT NULL,
  review_title VARCHAR(100) NOT NULL,
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  guide_status VARCHAR (100) DEFAULT 'interested',
  expert_status VARCHAR(100) default 'interested',
  expert_reg_num varchar(100) NOT NULL,
  guide_reg_num VARCHAR(100) NOT NULL,
  guide_reason text default null,
  expert_reason text default null,
  file text not null,
  temp_meeting_link varchar(500) default null,
  INDEX idx_team_id (team_id),
  INDEX idx_project_id (project_id),
  INDEX idx_review_date (review_date)
);

CREATE TABLE review_marks (
  review_no INT,
  review_date DATE NOT NULL,
  team_id INT,
  guide_literature_survey INT NOT NULL CHECK (guide_literature_survey BETWEEN 0 AND 5),
  expert_literature_survey INT NOT NULL CHECK (expert_literature_survey BETWEEN 0 AND 5),
  guide_aim INT NOT NULL CHECK (guide_aim BETWEEN 0 AND 5),
  expert_aim INT NOT NULL CHECK (expert_aim BETWEEN 0 AND 5),
  guide_scope INT NOT NULL CHECK (guide_scope BETWEEN 0 AND 5),
  expert_scope INT NOT NULL CHECK (expert_scope BETWEEN 0 AND 5),
  guide_need_for_study INT NOT NULL CHECK (guide_need_for_study BETWEEN 0 AND 5),
  expert_need_for_study INT NOT NULL CHECK (expert_need_for_study BETWEEN 0 AND 5),
  guide_proposed_methodology INT NOT NULL CHECK (guide_proposed_methodology BETWEEN 0 AND 10),
  expert_proposed_methodology INT NOT NULL CHECK (expert_proposed_methodology BETWEEN 0 AND 10),
  guide_work_plan INT NOT NULL CHECK (guide_work_plan BETWEEN 0 AND 5),
  expert_work_plan INT NOT NULL CHECK (expert_work_plan BETWEEN 0 AND 5),
  guide_oral_presentation INT NOT NULL CHECK (guide_oral_presentation BETWEEN 0 AND 5),
  expert_oral_presentation INT NOT NULL CHECK (expert_oral_presentation BETWEEN 0 AND 5),
  guide_viva_voce_and_ppt INT NOT NULL CHECK (guide_viva_voce_and_ppt BETWEEN 0 AND 5),
  expert_viva_voce_and_ppt INT NOT NULL CHECK (expert_viva_voce_and_ppt BETWEEN 0 AND 5),
  guide_contributions INT NOT NULL CHECK (guide_contributions BETWEEN 0 AND 5),
  expert_contributions INT NOT NULL CHECK (expert_contributions BETWEEN 0 AND 5),
  guide_remarks TEXT NOT NULL,
  expert_remarks TEXT NOT NULL,
  total_expert_marks INT NOT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_guide_marks INT NOT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_marks INT NOT NULL CHECK (total_marks BETWEEN 0 AND 100),
  PRIMARY KEY (review_no, team_id)
);
-- SHOW CREATE TABLE users;

CREATE TABLE teams (
  team_id VARCHAR(20),
  reg_num VARCHAR(255) ,
  is_leader BOOLEAN DEFAULT 0,
  semester INT DEFAULT NULL,
  project_id VARCHAR(250),
  guide_reg_num VARCHAR(500),
  sub_expert_reg_num VARCHAR(500),
  project_picked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  guide_verified INT DEFAULT 0,
  week1_progress VARCHAR(200),
  week2_progress VARCHAR(200),
  week3_progress VARCHAR(200),
  week4_progress VARCHAR(200),
  week5_progress VARCHAR(200),
  week6_progress VARCHAR(200),
  week7_progress VARCHAR(200),
  week8_progress VARCHAR(200),
  week9_progress VARCHAR(200),
  week10_progress VARCHAR(200),
  week11_progress VARCHAR(200),
  week12_progress VARCHAR(200),
  PRIMARY KEY (team_id, reg_num),
  FOREIGN KEY (reg_num) REFERENCES users(reg_num)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE mentor_requests (
  `from_team_id` VARCHAR(200) NOT NULL,
  `project_id` VARCHAR(200) NOT NULL,
  `mentor_reg_num` VARCHAR(200) NOT NULL,
  `status` VARCHAR(200) DEFAULT 'interested',
  `reason` TEXT DEFAULT NULL,
  `project_name` VARCHAR(500) DEFAULT NULL,
  `team_semester` INT NOT NULL,
  PRIMARY KEY (`from_team_id`, `project_id`, `mentor_reg_num`),
  INDEX `idx_status` (`status`)
);

CREATE TABLE mentors_mentees (
    mentee_name VARCHAR(100) NOT NULL,
    mentee_reg_num VARCHAR(100) NOT NULL,
    mentee_emailId VARCHAR(100) NOT NULL,
    mentee_sem INT NOT NULL,
    mentor_name VARCHAR(100) NOT NULL,
    mentor_reg_num VARCHAR(100),
    mentor_emailId VARCHAR(100),
    PRIMARY KEY (mentee_reg_num)
);

CREATE TABLE review_marks_team (
  review_no INT AUTO_INCREMENT,
  review_title VARCHAR(100) not null,
  review_date DATE NOT NULL,
  team_id varchar(20),
  guide_literature_survey INT NOT NULL CHECK (guide_literature_survey BETWEEN 0 AND 5),
  expert_literature_survey INT NOT NULL CHECK (expert_literature_survey BETWEEN 0 AND 5),
  guide_aim INT DEFAULT NULL CHECK (guide_aim BETWEEN 0 AND 5),
  expert_aim INT DEFAULT NULL CHECK (expert_aim BETWEEN 0 AND 5),
  guide_scope INT DEFAULT NULL CHECK (guide_scope BETWEEN 0 AND 5),
  expert_scope INT DEFAULT NULL CHECK (expert_scope BETWEEN 0 AND 5),
  guide_need_for_study INT DEFAULT NULL CHECK (guide_need_for_study BETWEEN 0 AND 5),
  expert_need_for_study INT DEFAULT NULL CHECK (expert_need_for_study BETWEEN 0 AND 5),
  guide_proposed_methodology INT DEFAULT NULL CHECK (guide_proposed_methodology BETWEEN 0 AND 10),
  expert_proposed_methodology INT DEFAULT NULL CHECK (expert_proposed_methodology BETWEEN 0 AND 10),
  guide_work_plan INT DEFAULT NULL CHECK (guide_work_plan BETWEEN 0 AND 5),
  expert_work_plan INT DEFAULT NULL CHECK (expert_work_plan BETWEEN 0 AND 5),
  total_guide_marks INT DEFAULT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_expert_marks INT DEFAULT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_marks INT DEFAULT NULL CHECK (total_marks BETWEEN 0 AND 100),
  guide_remarks text default null,
  expert_remarks text default null,
  guide_reg_num varchar(100) default null,
  expert_reg_num varchar(100) default null,
  PRIMARY KEY (review_no, team_id)
);

CREATE TABLE review_marks_individual (
  review_no INT AUTO_INCREMENT,
  review_title varchar(100) not null,
  review_date DATE NOT NULL,
  team_id varchar(20),
  student_reg_num VARCHAR(20) NOT NULL,
  guide_oral_presentation INT NOT NULL CHECK (guide_oral_presentation BETWEEN 0 AND 5),
  expert_oral_presentation INT NOT NULL CHECK (expert_oral_presentation BETWEEN 0 AND 5),
  guide_viva_voce_and_ppt INT NOT NULL CHECK (guide_viva_voce_and_ppt BETWEEN 0 AND 5),
  expert_viva_voce_and_ppt INT NOT NULL CHECK (expert_viva_voce_and_ppt BETWEEN 0 AND 5),
  guide_contributions INT NOT NULL CHECK (guide_contributions BETWEEN 0 AND 5),
  expert_contributions INT NOT NULL CHECK (expert_contributions BETWEEN 0 AND 5),
  total_expert_marks INT NOT NULL CHECK (total_expert_marks BETWEEN 0 AND 50),
  total_guide_marks INT NOT NULL CHECK (total_guide_marks BETWEEN 0 AND 50),
  total_marks INT NOT NULL CHECK (total_marks BETWEEN 0 AND 100),
  guide_remarks text default null,
  expert_remarks text default null,
  guide_reg_num varchar(100) default null,
  expert_reg_num varchar(100) default null,
  PRIMARY KEY (review_no, student_reg_num)
);

CREATE TABLE optional_review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  team_lead VARCHAR(100) NOT NULL,
  review_date DATE NOT NULL,
  start_time TIME NOT NULL,
  reason text not null,
  mentor_reg_num VARCHAR(100) NOT NULL,
  status VARCHAR(100) DEFAULT NULL,
  file text not null
);

CREATE TABLE challenge_review_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  project_id VARCHAR(100) NOT NULL,
  team_lead VARCHAR(100) NOT NULL,
  review_date DATE NOT NULL,
  start_time TIME NOT NULL,
  reason text not null,
  temp_expert VARCHAR(100) NOT NULL,
  temp_guide VARCHAR(100) NOT NULL,
  status VARCHAR(100) DEFAULT NULL,
  file text not null
);

create table admin_accesses (
optional_review_type enum('review-1', 'review-2') 
not null default 'review-1',
optional_review_access enum('enabled', 'disabled')
not null default 'disabled',
challenge_review_type enum('review-1', 'review-2') 
not null default 'review-1',
challege_review_access enum('enabled', 'disabled')
not null default 'disabled'
);

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    emailId VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200),
    role VARCHAR(200),
    google_id VARCHAR(255) UNIQUE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reg_num VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200),
    dept VARCHAR(200),
    semester INT,
    company_name VARCHAR(300),
    company_contact VARCHAR(50),
    company_address VARCHAR(200),
    project_type VARCHAR(200),
    phone_number VARCHAR(20),
    available TINYINT DEFAULT 1,
    PRIMARY KEY (id)
);

CREATE TABLE departments (
    dept_name VARCHAR(50) PRIMARY KEY,
    cluster VARCHAR(20) NOT NULL
);

INSERT INTO departments VALUES
('Aero', 'cluster-1'), ('Auto', 'cluster-1'), ('mech', 'cluster-1'), ('mtrs', 'cluster-1'),
('Agri', 'cluster-2'), ('civil', 'cluster-2'),
('Bio', 'cluster-3'), ('food', 'cluster-3'),
('EEE', 'cluster-4'), ('ECE', 'cluster-4'), ('EIE', 'cluster-4'), ('BM', 'cluster-4'),
('CSE', 'cluster-5'), ('IT', 'cluster-5'), ('AIDS', 'cluster-5'), ('AIML', 'cluster-5'),
('CT', 'cluster-5'), ('ISE', 'cluster-5'), ('CSBS', 'cluster-5'), ('CSD', 'cluster-5'),
('TXT', 'cluster-6'), ('Fashion', 'cluster-6');

CREATE TABLE challenge_review_reviewers_assignment (
    assignment_id INT NOT NULL AUTO_INCREMENT,
    semester ENUM('5','6','7','8') NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    project_id VARCHAR(20) NOT NULL,
    project_type VARCHAR(50) DEFAULT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    pmc1_reg_num VARCHAR(20) NOT NULL,
    pmc2_reg_num VARCHAR(20) NOT NULL,
    assigned_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (assignment_id)
);


CREATE TABLE department_clusters (
    id INT NOT NULL AUTO_INCREMENT,
    cluster_name VARCHAR(50) NOT NULL,
    department_codes VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE regular_review_schedules (
    review_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    guide_reg_num VARCHAR(255) NOT NULL,
    sub_expert_reg_num VARCHAR(255) NOT NULL,
    team_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    semester ENUM('5', '6', '7', '8') NOT NULL,
    review_type ENUM('review-1', 'review-2') NOT NULL,
    review_mode ENUM('online', 'offline') NOT NULL,
    venue VARCHAR(255) DEFAULT NULL,
    Date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_link VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Completed', 'Not completed', 'Rescheduled') DEFAULT 'Not completed'
);


CREATE TABLE optional_review_requests (
    request_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(250) NOT NULL,
    semester ENUM('5', '6', '7', '8') NOT NULL,
    review_type ENUM('review-1', 'review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    request_reason VARCHAR(500) NOT NULL,
    rejection_reason VARCHAR(500) DEFAULT NULL,
    request_status ENUM('pending', 'approved', 'rejected') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE optional_review_schedules (
    review_id VARCHAR(20) NOT NULL PRIMARY KEY,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) DEFAULT NULL,
    team_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(250) NOT NULL,
    semester ENUM('5', '6', '7', '8') NOT NULL,
    review_type ENUM('review-1', 'review-2') DEFAULT NULL,
    review_mode ENUM('online', 'offline') DEFAULT NULL,
    venue VARCHAR(255) DEFAULT NULL,
    date DATE NOT NULL,
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    meeting_link VARCHAR(500) DEFAULT NULL,
    guide_review_status ENUM('Completed', 'Not completed', 'Rescheduled') DEFAULT 'Not completed',
    sub_expert_review_status ENUM('Completed', 'Not completed', 'Rescheduled') DEFAULT 'Not completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- 5th & 6th Sem - First Review (Guide)
-- =========================
CREATE TABLE s5_s6_first_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    Aim_Objective_of_the_project INT,
    Scope_of_the_project INT,
    Need_for_the_current_study INT,
    Proposed_Methodology INT,
    Project_work_Plan INT,
    Oral_Presentation INT,
    Viva_Voce_PPT INT,
    Contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        Aim_Objective_of_the_project +
        Scope_of_the_project +
        Need_for_the_current_study +
        Proposed_Methodology +
        Project_work_Plan +
        Oral_Presentation +
        Viva_Voce_PPT +
        Contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - First Review (Sub Expert)
-- =========================
CREATE TABLE s5_s6_first_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    Aim_Objective_of_the_project INT,
    Scope_of_the_project INT,
    Need_for_the_current_study INT,
    Proposed_Methodology INT,
    Project_work_Plan INT,
    Oral_Presentation INT,
    Viva_Voce_PPT INT,
    Contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        Aim_Objective_of_the_project +
        Scope_of_the_project +
        Need_for_the_current_study +
        Proposed_Methodology +
        Project_work_Plan +
        Oral_Presentation +
        Viva_Voce_PPT +
        Contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - Second Review (Guide)
-- =========================
CREATE TABLE s5_s6_second_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    designs INT,
    novelty_of_the_project_partial_completion_of_report INT,
    analysis_of_results_and_discussions INT,
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce_ppt INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        designs +
        novelty_of_the_project_partial_completion_of_report +
        analysis_of_results_and_discussions +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce_ppt +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - Second Review (Sub Expert)
-- =========================
CREATE TABLE s5_s6_second_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    designs INT,
    novelty_of_the_project_partial_completion_of_report INT,
    analysis_of_results_and_discussions INT,
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce_ppt INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        designs +
        novelty_of_the_project_partial_completion_of_report +
        analysis_of_results_and_discussions +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce_ppt +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - First Review (Guide)
-- =========================
CREATE TABLE s7_first_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    aim_objective_of_the_project INT,
    scope_of_the_project INT,
    need_for_the_current_study INT,
    feasibility_analysis INT,
    proposed_methodology INT,
    choice_of_components_modules_equipment INT,
    designs_hardware_software_architecture INT,
    novelty_of_the_project_partial_completion INT,
    oral_presentation INT,
    viva_voce INT,
    contribution_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        aim_objective_of_the_project +
        scope_of_the_project +
        need_for_the_current_study +
        feasibility_analysis +
        proposed_methodology +
        choice_of_components_modules_equipment +
        designs_hardware_software_architecture +
        novelty_of_the_project_partial_completion +
        oral_presentation +
        viva_voce +
        contribution_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - First Review (Sub Expert)
-- =========================
CREATE TABLE s7_first_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    aim_objective_of_the_project INT,
    scope_of_the_project INT,
    need_for_the_current_study INT,
    feasibility_analysis INT,
    proposed_methodology INT,
    choice_of_components_modules_equipment INT,
    designs_hardware_software_architecture INT,
    novelty_of_the_project_partial_completion INT,
    oral_presentation INT,
    viva_voce INT,
    contribution_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        aim_objective_of_the_project +
        scope_of_the_project +
        need_for_the_current_study +
        feasibility_analysis +
        proposed_methodology +
        choice_of_components_modules_equipment +
        designs_hardware_software_architecture +
        novelty_of_the_project_partial_completion +
        oral_presentation +
        viva_voce +
        contribution_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - Second Review (Guide)
-- =========================
CREATE TABLE s7_second_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    project_work_plan INT,
    effective_utilization_of_modern_tools INT,
    analysis_of_results_and_discussion INT,
    cost_benefit_analysis INT,
    publications_conference_journal_patent VARCHAR(255),
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        project_work_plan +
        effective_utilization_of_modern_tools +
        analysis_of_results_and_discussion +
        cost_benefit_analysis +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - Second Review (Sub Expert)
-- =========================
CREATE TABLE s7_second_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    project_work_plan INT,
    effective_utilization_of_modern_tools INT,
    analysis_of_results_and_discussion INT,
    cost_benefit_analysis INT,
    publications_conference_journal_patent VARCHAR(255),
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        project_work_plan +
        effective_utilization_of_modern_tools +
        analysis_of_results_and_discussion +
        cost_benefit_analysis +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE `s5_s6_challenge_first_review_marks_bypmc1` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('5','6') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `guide_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  -- All mark fields default to NULL and only required when present
  `literature_review` INT NULL DEFAULT NULL,
  `Aim_Objective_of_the_project` INT NULL DEFAULT NULL,
  `Scope_of_the_project` INT NULL DEFAULT NULL,
  `Need_for_the_current_study` INT NULL DEFAULT NULL,
  `Proposed_Methodology` INT NULL DEFAULT NULL,
  `Project_work_Plan` INT NULL DEFAULT NULL,
  `Oral_Presentation` INT NULL DEFAULT NULL,
  `Viva_Voce_PPT` INT NULL DEFAULT NULL,
  `Contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  -- Generated column that handles NULL marks properly
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(literature_review, 0) + 
        COALESCE(Aim_Objective_of_the_project, 0) + 
        COALESCE(Scope_of_the_project, 0) + 
        COALESCE(Need_for_the_current_study, 0) + 
        COALESCE(Proposed_Methodology, 0) + 
        COALESCE(Project_work_Plan, 0) + 
        COALESCE(Oral_Presentation, 0) + 
        COALESCE(Viva_Voce_PPT, 0) + 
        COALESCE(Contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Add constraint to enforce mark requirements when present
  CONSTRAINT `chk_marks_when_present` CHECK (
    attendance = 'absent' OR (
      literature_review IS NOT NULL AND
      Aim_Objective_of_the_project IS NOT NULL AND
      Scope_of_the_project IS NOT NULL AND
      Need_for_the_current_study IS NOT NULL AND
      Proposed_Methodology IS NOT NULL AND
      Project_work_Plan IS NOT NULL AND
      Oral_Presentation IS NOT NULL AND
      Viva_Voce_PPT IS NOT NULL AND
      Contributions_to_the_work_and_worklog IS NOT NULL
    )
  )
);

CREATE TABLE `s5_s6_challenge_first_review_marks_bypmc2` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('5','6') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `sub_expert_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `literature_review` INT NULL DEFAULT NULL,
  `Aim_Objective_of_the_project` INT NULL DEFAULT NULL,
  `Scope_of_the_project` INT NULL DEFAULT NULL,
  `Need_for_the_current_study` INT NULL DEFAULT NULL,
  `Proposed_Methodology` INT NULL DEFAULT NULL,
  `Project_work_Plan` INT NULL DEFAULT NULL,
  `Oral_Presentation` INT NULL DEFAULT NULL,
  `Viva_Voce_PPT` INT NULL DEFAULT NULL,
  `Contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(literature_review, 0) + 
        COALESCE(Aim_Objective_of_the_project, 0) + 
        COALESCE(Scope_of_the_project, 0) + 
        COALESCE(Need_for_the_current_study, 0) + 
        COALESCE(Proposed_Methodology, 0) + 
        COALESCE(Project_work_Plan, 0) + 
        COALESCE(Oral_Presentation, 0) + 
        COALESCE(Viva_Voce_PPT, 0) + 
        COALESCE(Contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_pmc2_first_marks_when_present` CHECK (
    attendance = 'absent' OR (
      literature_review IS NOT NULL AND
      Aim_Objective_of_the_project IS NOT NULL AND
      Scope_of_the_project IS NOT NULL AND
      Need_for_the_current_study IS NOT NULL AND
      Proposed_Methodology IS NOT NULL AND
      Project_work_Plan IS NOT NULL AND
      Oral_Presentation IS NOT NULL AND
      Viva_Voce_PPT IS NOT NULL AND
      Contributions_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_pmc2_first_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `sub_expert_reg_num`, 
    `team_id`
  )
);


CREATE TABLE `s5_s6_challenge_second_review_marks_bypmc1` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('5','6') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `guide_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `designs` INT NULL DEFAULT NULL,
  `novelty_of_the_project_partial_completion_of_report` INT NULL DEFAULT NULL,
  `analysis_of_results_and_discussions` INT NULL DEFAULT NULL,
  `originality_score_for_final_project_report` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce_ppt` INT NULL DEFAULT NULL,
  `contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(designs, 0) + 
        COALESCE(novelty_of_the_project_partial_completion_of_report, 0) + 
        COALESCE(analysis_of_results_and_discussions, 0) + 
        COALESCE(originality_score_for_final_project_report, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce_ppt, 0) + 
        COALESCE(contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_pmc1_second_marks_when_present` CHECK (
    attendance = 'absent' OR (
      designs IS NOT NULL AND
      novelty_of_the_project_partial_completion_of_report IS NOT NULL AND
      analysis_of_results_and_discussions IS NOT NULL AND
      originality_score_for_final_project_report IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce_ppt IS NOT NULL AND
      contributions_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_pmc1_second_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `guide_reg_num`, 
    `team_id`
  )
);

CREATE TABLE `s5_s6_challenge_second_review_marks_bypmc2` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('5','6') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `sub_expert_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `designs` INT NULL DEFAULT NULL,
  `novelty_of_the_project_partial_completion_of_report` INT NULL DEFAULT NULL,
  `analysis_of_results_and_discussions` INT NULL DEFAULT NULL,
  `originality_score_for_final_project_report` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce_ppt` INT NULL DEFAULT NULL,
  `contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(designs, 0) + 
        COALESCE(novelty_of_the_project_partial_completion_of_report, 0) + 
        COALESCE(analysis_of_results_and_discussions, 0) + 
        COALESCE(originality_score_for_final_project_report, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce_ppt, 0) + 
        COALESCE(contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_pmc2_second_marks_when_present` CHECK (
    attendance = 'absent' OR (
      designs IS NOT NULL AND
      novelty_of_the_project_partial_completion_of_report IS NOT NULL AND
      analysis_of_results_and_discussions IS NOT NULL AND
      originality_score_for_final_project_report IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce_ppt IS NOT NULL AND
      contributions_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_pmc2_second_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `sub_expert_reg_num`, 
    `team_id`
  )
);

CREATE TABLE `s7_challenge_first_review_marks_bypmc1` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('7') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `guide_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `literature_review` INT NULL DEFAULT NULL,
  `aim_objective_of_the_project` INT NULL DEFAULT NULL,
  `scope_of_the_project` INT NULL DEFAULT NULL,
  `need_for_the_current_study` INT NULL DEFAULT NULL,
  `feasibility_analysis` INT NULL DEFAULT NULL,
  `proposed_methodology` INT NULL DEFAULT NULL,
  `choice_of_components_modules_equipment` INT NULL DEFAULT NULL,
  `designs_hardware_software_architecture` INT NULL DEFAULT NULL,
  `novelty_of_the_project_partial_completion` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce` INT NULL DEFAULT NULL,
  `contribution_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(literature_review, 0) + 
        COALESCE(aim_objective_of_the_project, 0) + 
        COALESCE(scope_of_the_project, 0) + 
        COALESCE(need_for_the_current_study, 0) + 
        COALESCE(feasibility_analysis, 0) + 
        COALESCE(proposed_methodology, 0) + 
        COALESCE(choice_of_components_modules_equipment, 0) + 
        COALESCE(designs_hardware_software_architecture, 0) + 
        COALESCE(novelty_of_the_project_partial_completion, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce, 0) + 
        COALESCE(contribution_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_s7_pmc1_first_marks_when_present` CHECK (
    attendance = 'absent' OR (
      literature_review IS NOT NULL AND
      aim_objective_of_the_project IS NOT NULL AND
      scope_of_the_project IS NOT NULL AND
      need_for_the_current_study IS NOT NULL AND
      feasibility_analysis IS NOT NULL AND
      proposed_methodology IS NOT NULL AND
      choice_of_components_modules_equipment IS NOT NULL AND
      designs_hardware_software_architecture IS NOT NULL AND
      novelty_of_the_project_partial_completion IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce IS NOT NULL AND
      contribution_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_s7_pmc1_first_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `guide_reg_num`, 
    `team_id`
  )
);

CREATE TABLE `s7_challenge_first_review_marks_bypmc2` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('7') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `sub_expert_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `literature_review` INT NULL DEFAULT NULL,
  `aim_objective_of_the_project` INT NULL DEFAULT NULL,
  `scope_of_the_project` INT NULL DEFAULT NULL,
  `need_for_the_current_study` INT NULL DEFAULT NULL,
  `feasibility_analysis` INT NULL DEFAULT NULL,
  `proposed_methodology` INT NULL DEFAULT NULL,
  `choice_of_components_modules_equipment` INT NULL DEFAULT NULL,
  `designs_hardware_software_architecture` INT NULL DEFAULT NULL,
  `novelty_of_the_project_partial_completion` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce` INT NULL DEFAULT NULL,
  `contribution_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(literature_review, 0) + 
        COALESCE(aim_objective_of_the_project, 0) + 
        COALESCE(scope_of_the_project, 0) + 
        COALESCE(need_for_the_current_study, 0) + 
        COALESCE(feasibility_analysis, 0) + 
        COALESCE(proposed_methodology, 0) + 
        COALESCE(choice_of_components_modules_equipment, 0) + 
        COALESCE(designs_hardware_software_architecture, 0) + 
        COALESCE(novelty_of_the_project_partial_completion, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce, 0) + 
        COALESCE(contribution_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_s7_pmc2_first_marks_when_present` CHECK (
    attendance = 'absent' OR (
      literature_review IS NOT NULL AND
      aim_objective_of_the_project IS NOT NULL AND
      scope_of_the_project IS NOT NULL AND
      need_for_the_current_study IS NOT NULL AND
      feasibility_analysis IS NOT NULL AND
      proposed_methodology IS NOT NULL AND
      choice_of_components_modules_equipment IS NOT NULL AND
      designs_hardware_software_architecture IS NOT NULL AND
      novelty_of_the_project_partial_completion IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce IS NOT NULL AND
      contribution_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_s7_pmc2_first_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `sub_expert_reg_num`, 
    `team_id`
  )
);

CREATE TABLE `s7_challenge_second_review_marks_bypmc1` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('7') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `guide_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `project_work_plan` INT NULL DEFAULT NULL,
  `effective_utilization_of_modern_tools` INT NULL DEFAULT NULL,
  `analysis_of_results_and_discussion` INT NULL DEFAULT NULL,
  `cost_benefit_analysis` INT NULL DEFAULT NULL,
  `publications_conference_journal_patent` VARCHAR(255) NULL DEFAULT NULL,
  `originality_score_for_final_project_report` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce` INT NULL DEFAULT NULL,
  `contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(project_work_plan, 0) + 
        COALESCE(effective_utilization_of_modern_tools, 0) + 
        COALESCE(analysis_of_results_and_discussion, 0) + 
        COALESCE(cost_benefit_analysis, 0) + 
        COALESCE(originality_score_for_final_project_report, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce, 0) + 
        COALESCE(contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_s7_pmc1_second_marks_when_present` CHECK (
    attendance = 'absent' OR (
      project_work_plan IS NOT NULL AND
      effective_utilization_of_modern_tools IS NOT NULL AND
      analysis_of_results_and_discussion IS NOT NULL AND
      cost_benefit_analysis IS NOT NULL AND
      originality_score_for_final_project_report IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce IS NOT NULL AND
      contributions_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_s7_pmc1_second_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `guide_reg_num`, 
    `team_id`
  )
);

CREATE TABLE `s7_challenge_second_review_marks_bypmc2` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `semester` ENUM('7') NOT NULL,
  `review_type` ENUM('review-1','review-2') NOT NULL,
  `student_reg_num` VARCHAR(20) NOT NULL,
  `sub_expert_reg_num` VARCHAR(20) NOT NULL,
  `team_id` VARCHAR(20) NOT NULL,
  `attendance` ENUM('present','absent') NOT NULL DEFAULT 'absent',
  
  `project_work_plan` INT NULL DEFAULT NULL,
  `effective_utilization_of_modern_tools` INT NULL DEFAULT NULL,
  `analysis_of_results_and_discussion` INT NULL DEFAULT NULL,
  `cost_benefit_analysis` INT NULL DEFAULT NULL,
  `publications_conference_journal_patent` VARCHAR(255) NULL DEFAULT NULL,
  `originality_score_for_final_project_report` INT NULL DEFAULT NULL,
  `oral_presentation` INT NULL DEFAULT NULL,
  `viva_voce` INT NULL DEFAULT NULL,
  `contributions_to_the_work_and_worklog` INT NULL DEFAULT NULL,
  
  `total_marks` INT AS (
    CASE 
      WHEN attendance = 'absent' THEN 0
      ELSE 
        COALESCE(project_work_plan, 0) + 
        COALESCE(effective_utilization_of_modern_tools, 0) + 
        COALESCE(analysis_of_results_and_discussion, 0) + 
        COALESCE(cost_benefit_analysis, 0) + 
        COALESCE(originality_score_for_final_project_report, 0) + 
        COALESCE(oral_presentation, 0) + 
        COALESCE(viva_voce, 0) + 
        COALESCE(contributions_to_the_work_and_worklog, 0)
    END
  ) STORED,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `chk_s7_pmc2_second_marks_when_present` CHECK (
    attendance = 'absent' OR (
      project_work_plan IS NOT NULL AND
      effective_utilization_of_modern_tools IS NOT NULL AND
      analysis_of_results_and_discussion IS NOT NULL AND
      cost_benefit_analysis IS NOT NULL AND
      originality_score_for_final_project_report IS NOT NULL AND
      oral_presentation IS NOT NULL AND
      viva_voce IS NOT NULL AND
      contributions_to_the_work_and_worklog IS NOT NULL
    )
  ),
  
  UNIQUE KEY `unique_s7_pmc2_second_review` (
    `semester`, 
    `review_type`, 
    `student_reg_num`, 
    `sub_expert_reg_num`, 
    `team_id`
  )
);


use project_registor;

-- =========================
-- 5th & 6th Sem - First Review (Guide)
-- =========================
CREATE TABLE s5_s6_optional_first_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    Aim_Objective_of_the_project INT,
    Scope_of_the_project INT,
    Need_for_the_current_study INT,
    Proposed_Methodology INT,
    Project_work_Plan INT,
    Oral_Presentation INT,
    Viva_Voce_PPT INT,
    Contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        Aim_Objective_of_the_project +
        Scope_of_the_project +
        Need_for_the_current_study +
        Proposed_Methodology +
        Project_work_Plan +
        Oral_Presentation +
        Viva_Voce_PPT +
        Contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - First Review (Sub Expert)
-- =========================
CREATE TABLE s5_s6_optional_first_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    Aim_Objective_of_the_project INT,
    Scope_of_the_project INT,
    Need_for_the_current_study INT,
    Proposed_Methodology INT,
    Project_work_Plan INT,
    Oral_Presentation INT,
    Viva_Voce_PPT INT,
    Contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        Aim_Objective_of_the_project +
        Scope_of_the_project +
        Need_for_the_current_study +
        Proposed_Methodology +
        Project_work_Plan +
        Oral_Presentation +
        Viva_Voce_PPT +
        Contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - Second Review (Guide)
-- =========================
CREATE TABLE s5_s6_optional_second_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    designs INT,
    novelty_of_the_project_partial_completion_of_report INT,
    analysis_of_results_and_discussions INT,
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce_ppt INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        designs +
        novelty_of_the_project_partial_completion_of_report +
        analysis_of_results_and_discussions +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce_ppt +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 5th & 6th Sem - Second Review (Sub Expert)
-- =========================
CREATE TABLE s5_s6_optional_second_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('5','6') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    designs INT,
    novelty_of_the_project_partial_completion_of_report INT,
    analysis_of_results_and_discussions INT,
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce_ppt INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        designs +
        novelty_of_the_project_partial_completion_of_report +
        analysis_of_results_and_discussions +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce_ppt +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - First Review (Guide)
-- =========================
CREATE TABLE s7_optional_first_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    aim_objective_of_the_project INT,
    scope_of_the_project INT,
    need_for_the_current_study INT,
    feasibility_analysis INT,
    proposed_methodology INT,
    choice_of_components_modules_equipment INT,
    designs_hardware_software_architecture INT,
    novelty_of_the_project_partial_completion INT,
    oral_presentation INT,
    viva_voce INT,
    contribution_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        aim_objective_of_the_project +
        scope_of_the_project +
        need_for_the_current_study +
        feasibility_analysis +
        proposed_methodology +
        choice_of_components_modules_equipment +
        designs_hardware_software_architecture +
        novelty_of_the_project_partial_completion +
        oral_presentation +
        viva_voce +
        contribution_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - First Review (Sub Expert)
-- =========================
CREATE TABLE s7_optional_first_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    literature_review INT,
    aim_objective_of_the_project INT,
    scope_of_the_project INT,
    need_for_the_current_study INT,
    feasibility_analysis INT,
    proposed_methodology INT,
    choice_of_components_modules_equipment INT,
    designs_hardware_software_architecture INT,
    novelty_of_the_project_partial_completion INT,
    oral_presentation INT,
    viva_voce INT,
    contribution_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        literature_review +
        aim_objective_of_the_project +
        scope_of_the_project +
        need_for_the_current_study +
        feasibility_analysis +
        proposed_methodology +
        choice_of_components_modules_equipment +
        designs_hardware_software_architecture +
        novelty_of_the_project_partial_completion +
        oral_presentation +
        viva_voce +
        contribution_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - Second Review (Guide)
-- =========================
CREATE TABLE s7_optional_second_review_marks_byguide (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    guide_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    project_work_plan INT,
    effective_utilization_of_modern_tools INT,
    analysis_of_results_and_discussion INT,
    cost_benefit_analysis INT,
    publications_conference_journal_patent VARCHAR(255),
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        project_work_plan +
        effective_utilization_of_modern_tools +
        analysis_of_results_and_discussion +
        cost_benefit_analysis +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 7th Sem - Second Review (Sub Expert)
-- =========================
CREATE TABLE s7_optional_second_review_marks_bysubexpert (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    semester ENUM('7') NOT NULL,
    review_type ENUM('review-1','review-2') NOT NULL,
    student_reg_num VARCHAR(20) NOT NULL,
    sub_expert_reg_num VARCHAR(20) NOT NULL,
    team_id VARCHAR(20) NOT NULL,
    attendance ENUM('present','absent') NOT NULL DEFAULT 'absent',
    project_work_plan INT,
    effective_utilization_of_modern_tools INT,
    analysis_of_results_and_discussion INT,
    cost_benefit_analysis INT,
    publications_conference_journal_patent VARCHAR(255),
    originality_score_for_final_project_report INT,
    oral_presentation INT,
    viva_voce INT,
    contributions_to_the_work_and_worklog INT,
    total_marks INT GENERATED ALWAYS AS (
        project_work_plan +
        effective_utilization_of_modern_tools +
        analysis_of_results_and_discussion +
        cost_benefit_analysis +
        originality_score_for_final_project_report +
        oral_presentation +
        viva_voce +
        contributions_to_the_work_and_worklog
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


