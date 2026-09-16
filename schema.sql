-- ============================================================
-- DDMIS Database Schema
-- Structure only
-- ============================================================

CREATE DATABASE IF NOT EXISTS ddms;
USE ddms;

-- ------------------------------------------------------------
-- Districts
-- ------------------------------------------------------------
CREATE TABLE districts (
    district_id     INT AUTO_INCREMENT PRIMARY KEY,
    district_name   VARCHAR(100) NOT NULL UNIQUE,
    province        VARCHAR(50) NOT NULL
);

-- ------------------------------------------------------------
-- District Info (yearly demographic records — one district
-- can have multiple rows, one per year)
-- ------------------------------------------------------------
CREATE TABLE district_info (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    district_id             INT NOT NULL,
    year                    INT NOT NULL,
    total_population        INT,
    no_of_male              INT,
    no_of_female            INT,
    total_households        INT,
    population_density      DECIMAL(10,2),
    growth_rate             DECIMAL(5,3),
    sex_ratio               DECIMAL(5,2),
    avg_household_size      DECIMAL(4,2),
    literacy_rate           DECIMAL(5,2),
    literate_male_rate      DECIMAL(5,2),
    literate_female_rate    DECIMAL(5,2),
    tap_within_compound     DECIMAL(5,3),
    tap_outside_compound    DECIMAL(5,3),
    tubewell                DECIMAL(5,3),
    covered_well            DECIMAL(5,3),
    uncovered_well          DECIMAL(5,3),
    spout_water             DECIMAL(5,3),
    river_stream            DECIMAL(5,3),
    jar_bottle              DECIMAL(5,3),
    water_other             DECIMAL(5,3),
    work_below_3months      DECIMAL(5,3),
    work_3to6months         DECIMAL(5,3),
    work_6months_plus       DECIMAL(5,3),
    did_not_work            DECIMAL(5,3),
    sector_government       DECIMAL(5,3),
    sector_financial        DECIMAL(5,3),
    sector_non_financial    DECIMAL(5,3),
    sector_non_profit       DECIMAL(5,3),
    sector_household        DECIMAL(5,3),
    UNIQUE KEY unique_district_year (district_id, year),
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id      INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    phone        VARCHAR(15) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
    district_id  INT NULL,
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

-- ------------------------------------------------------------
-- Facilities (schools, healthcare, banks, shelters)
-- ------------------------------------------------------------
CREATE TABLE facilities (
    facility_id  INT AUTO_INCREMENT PRIMARY KEY,
    district_id  INT NOT NULL,
    category     ENUM('school', 'healthcare', 'bank', 'shelter') NOT NULL,
    name         VARCHAR(200) NOT NULL,
    type         VARCHAR(100),
    ownership    VARCHAR(100),
    ward         VARCHAR(50),
    address      VARCHAR(255),
    phone        VARCHAR(100),
    details      TEXT,
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

-- ------------------------------------------------------------
-- Projects
-- ------------------------------------------------------------
CREATE TABLE projects (
    project_id       INT AUTO_INCREMENT PRIMARY KEY,
    district_id      INT NOT NULL,
    name             VARCHAR(200) NOT NULL,
    details          TEXT,
    budget           DECIMAL(15,2),
    funding_source   VARCHAR(150),
    start_date       DATE,
    completion_date  DATE,
    fiscal_year      VARCHAR(50),
    status           ENUM('planned', 'ongoing', 'completed', 'delayed') NOT NULL DEFAULT 'planned',
    remarks          TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);
 
 -- ------------------------------------------------------------
-- Feedback
-- ------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    details         TEXT NOT NULL,
    status          ENUM('pending', 'reviewed', 'resolved') NOT NULL DEFAULT 'pending',
    creation_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    district_id     INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (district_id) REFERENCES districts(district_id)
);
 
-- ------------------------------------------------------------
-- Feedback History (audit log of status changes)
-- ------------------------------------------------------------
CREATE TABLE feedback_history (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id   INT NOT NULL,
    user_id       INT NOT NULL,
    old_status    ENUM('pending', 'reviewed', 'resolved') NOT NULL,
    new_status    ENUM('pending', 'reviewed', 'resolved') NOT NULL,
    change_note   TEXT,
    date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES feedback(feedback_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
 