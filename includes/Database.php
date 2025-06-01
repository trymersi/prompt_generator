<?php

class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        $this->connect();
        $this->createTables();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function connect() {
        try {
            if (DB_TYPE === 'sqlite') {
                // Debug info
                if (APP_DEBUG) {
                    error_log("Database path: " . DB_PATH);
                    error_log("Database directory exists: " . (is_dir(dirname(DB_PATH)) ? 'Yes' : 'No'));
                    error_log("Database directory writable: " . (is_writable(dirname(DB_PATH)) ? 'Yes' : 'No'));
                }
                
                $this->connection = new PDO('sqlite:' . DB_PATH);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                if (APP_DEBUG) {
                    error_log("SQLite database connected successfully");
                }
            } else if (DB_TYPE === 'mysql') {
                $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
                $this->connection = new PDO($dsn, DB_USER, DB_PASS);
                $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            }
        } catch (PDOException $e) {
            $error = "Database connection failed: " . $e->getMessage();
            if (APP_DEBUG) {
                error_log($error);
                error_log("DB_PATH: " . DB_PATH);
                error_log("Current working directory: " . getcwd());
            }
            die($error);
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    private function createTables() {
        $sql = [
            // Themes table
            "CREATE TABLE IF NOT EXISTS themes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                theme_id VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                template TEXT NOT NULL,
                negative_prompt TEXT,
                category VARCHAR(100),
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // Parameters table
            "CREATE TABLE IF NOT EXISTS parameters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                theme_id VARCHAR(100) NOT NULL,
                param_name VARCHAR(100) NOT NULL,
                param_values TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (theme_id) REFERENCES themes(theme_id) ON DELETE CASCADE
            )",
            
            // Projects table
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                tags TEXT,
                auto_backup BOOLEAN DEFAULT 0,
                settings TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // Generated prompts history
            "CREATE TABLE IF NOT EXISTS prompt_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                theme_id VARCHAR(100),
                project_id VARCHAR(100),
                prompt_text TEXT NOT NULL,
                negative_prompt TEXT,
                parameters_used TEXT,
                word_count INTEGER,
                char_count INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // Analytics data
            "CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type VARCHAR(50) NOT NULL,
                theme_id VARCHAR(100),
                data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            
            // User preferences
            "CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key_name VARCHAR(100) UNIQUE NOT NULL,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )"
        ];
        
        foreach ($sql as $query) {
            try {
                $this->connection->exec($query);
                if (APP_DEBUG) {
                    error_log("Created table successfully");
                }
            } catch (PDOException $e) {
                $error = "Error creating table: " . $e->getMessage();
                error_log($error);
                if (APP_DEBUG) {
                    die($error);
                }
            }
        }
        
        // Insert default data if tables are empty
        $this->insertDefaultData();
    }
    
    private function insertDefaultData() {
        try {
            // Check if themes table is empty
            $stmt = $this->connection->query("SELECT COUNT(*) as count FROM themes");
            $result = $stmt->fetch();
            
            if ($result['count'] == 0) {
                if (APP_DEBUG) {
                    error_log("Inserting default data...");
                }
                
                // Insert default theme
                $this->connection->exec("
                    INSERT INTO themes (theme_id, name, description, template, category, tags) 
                    VALUES (
                        'truck_mountain',
                        'Truk di Pegunungan',
                        'Truk melintasi jalan tanah di pegunungan tropis yang berliku',
                        'Sebuah [TRUCK_TYPE] dengan [CARGO_TYPE] dan plat nomor [PLATE_NUMBER] serta tulisan ''[WINDSHIELD_TEXT]'' di kaca depan sedang melaju [MOVEMENT_STYLE] melalui jalan berliku di pegunungan tropis. [DRIVER_DESCRIPTION] berada di kursi kemudi. Di sekitar jalan terdapat [PEOPLE_DESCRIPTION]. Video diambil dengan [CAMERA_ANGLE]. Pemandangan menunjukkan pepohonan hijau, jalan tanah yang berliku naik turun, dan suasana pedesaan Indonesia yang asri.',
                        'transport',
                        'truck,mountain,indonesia,rural'
                    )
                ");
                
                // Insert default parameters
                $params = [
                    'TRUCK_TYPE' => ['a small pickup truck', 'a medium-sized box truck (truk engkel)', 'a yellow dump truck', 'a 3-axle cargo truck (tronton)', 'a 4-axle heavy-duty truck (trintin)', 'a 5-axle cargo truck (trinton)', 'a flatbed trailer truck', 'a wing box truck'],
                    'CARGO_TYPE' => ['sacks of rice', 'crates of vegetables', 'construction tools', 'timber logs', 'bottled water', 'fruit baskets', 'livestock cages', 'industrial machinery'],
                    'PLATE_NUMBER' => ['BM 8124 TC', 'B 9981 KYZ', 'DK 3412 JF', 'AB 3421 CN', 'F 8891 XN', 'H 7410 VR', 'L 2024 AP', 'D 5301 KB'],
                    'WINDSHIELD_TEXT' => ['Doa Ibu', 'Sahabat Jalan', 'Putra Mandiri', 'Langit Biru', 'Restu Ayah', 'Anak Rantau', 'Lestari Alam', 'Berkah Usaha'],
                    'DRIVER_DESCRIPTION' => ['a young man in a t-shirt and cap', 'a middle-aged man wearing a uniform', 'a female driver with a hijab', 'a man in a tank top', 'a calm elderly man', 'a delivery worker in a vest'],
                    'PEOPLE_DESCRIPTION' => ['villagers in sarongs and conical hats', 'children playing by the roadside', 'farmers carrying baskets of produce', 'women walking with babies', 'local vendors under makeshift stalls', 'people waving at the truck'],
                    'MOVEMENT_STYLE' => ['slow and steady', 'slipping and struggling', 'powerful and confident', 'jerky and bouncing', 'cautious with occasional stops'],
                    'CAMERA_ANGLE' => ['drone shot from behind', 'low angle side tracking shot', 'in-cabin POV from the driver', 'cinematic front view', 'high wide shot showing road curve', 'third-person over-the-shoulder']
                ];
                
                foreach ($params as $paramName => $values) {
                    $valuesJson = json_encode($values);
                    $stmt = $this->connection->prepare("
                        INSERT INTO parameters (theme_id, param_name, param_values) 
                        VALUES (?, ?, ?)
                    ");
                    $stmt->execute(['truck_mountain', $paramName, $valuesJson]);
                }
                
                if (APP_DEBUG) {
                    error_log("Default data inserted successfully");
                }
            }
        } catch (PDOException $e) {
            $error = "Error inserting default data: " . $e->getMessage();
            error_log($error);
            if (APP_DEBUG) {
                die($error);
            }
        }
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage());
            return false;
        }
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetchAll() : [];
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt ? $stmt->fetch() : false;
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}
?> 