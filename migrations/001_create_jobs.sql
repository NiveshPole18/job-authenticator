CREATE TABLE IF NOT EXISTS jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taskName VARCHAR(255) NOT NULL,
  payload JSON NULL,
  priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Low',
  status ENUM('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  lastError TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  startedAt DATETIME NULL,
  completedAt DATETIME NULL,
  runDurationMs INT NULL,
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_createdAt (createdAt)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jobId INT NOT NULL,
  url VARCHAR(500),
  requestBody JSON,
  responseStatus INT,
  responseBody TEXT,
  attempt INT,
  error TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jobId (jobId),
  INDEX idx_createdAt (createdAt),
  CONSTRAINT fk_webhook_job FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
);

