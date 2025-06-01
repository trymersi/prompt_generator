<?php
require_once '../config.php';
require_once '../includes/Database.php';

// Set content type
header('Content-Type: application/json');

// Capture any output/errors that might happen during initialization
ob_start();

try {
    // Get request method and endpoint
    $method = $_SERVER['REQUEST_METHOD'];
    $endpoint = $_GET['endpoint'] ?? '';
    $id = $_GET['id'] ?? '';

    // Clear any previous output
    ob_clean();

    // Initialize database
    $db = Database::getInstance();

    // Response helper
    function sendResponse($data, $status = 200) {
        // Clear any previous output
        if (ob_get_level()) {
            ob_clean();
        }
        
        http_response_code($status);
        echo json_encode([
            'status' => $status < 400 ? 'success' : 'error',
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    // Error handler
    function sendError($message, $status = 400) {
        sendResponse(['error' => $message], $status);
    }

    // Route handling
    switch ($endpoint) {
        case 'themes':
            handleThemes($db, $method, $id);
            break;
            
        case 'parameters':
            handleParameters($db, $method, $id);
            break;
            
        case 'generate':
            handleGenerate($db, $method);
            break;
            
        case 'projects':
            handleProjects($db, $method, $id);
            break;
            
        case 'analytics':
            handleAnalytics($db, $method);
            break;
            
        case 'history':
            handleHistory($db, $method, $id);
            break;
            
        default:
            sendError('Endpoint not found', 404);
    }

} catch (Exception $e) {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    sendError('Server error: ' . $e->getMessage(), 500);
} catch (Error $e) {
    // Clear any previous output
    if (ob_get_level()) {
        ob_clean();
    }
    
    sendError('Fatal error: ' . $e->getMessage(), 500);
}

// Themes handler
function handleThemes($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $theme = $db->fetchOne("SELECT * FROM themes WHERE theme_id = ?", [$id]);
                if (!$theme) sendError('Theme not found', 404);
                
                // Convert tags string to array
                if ($theme['tags']) {
                    $theme['tags'] = array_map('trim', explode(',', $theme['tags']));
                } else {
                    $theme['tags'] = [];
                }
                
                // Get parameters for this theme
                $parameters = $db->fetchAll("SELECT param_name, param_values FROM parameters WHERE theme_id = ?", [$id]);
                $theme['parameters'] = [];
                foreach ($parameters as $param) {
                    $theme['parameters'][$param['param_name']] = json_decode($param['param_values'], true);
                }
                
                sendResponse($theme);
            } else {
                $themes = $db->fetchAll("SELECT * FROM themes ORDER BY created_at DESC");
                // Convert tags for all themes
                foreach ($themes as &$theme) {
                    if ($theme['tags']) {
                        $theme['tags'] = array_map('trim', explode(',', $theme['tags']));
                    } else {
                        $theme['tags'] = [];
                    }
                }
                sendResponse($themes);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['theme_id'], $input['name'], $input['template'])) {
                sendError('Missing required fields');
            }
            
            $sql = "INSERT INTO themes (theme_id, name, description, template, negative_prompt, category, tags) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $params = [
                $input['theme_id'],
                $input['name'],
                $input['description'] ?? '',
                $input['template'],
                $input['negative_prompt'] ?? '',
                $input['category'] ?? '',
                is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? '')
            ];
            
            if ($db->query($sql, $params)) {
                sendResponse(['message' => 'Theme created successfully', 'theme_id' => $input['theme_id']], 201);
            } else {
                sendError('Failed to create theme');
            }
            break;
            
        case 'PUT':
            if (!$id) sendError('Theme ID required');
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) sendError('Invalid JSON input');
            
            $sql = "UPDATE themes SET name = ?, description = ?, template = ?, negative_prompt = ?, 
                    category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE theme_id = ?";
            $params = [
                $input['name'],
                $input['description'] ?? '',
                $input['template'],
                $input['negative_prompt'] ?? '',
                $input['category'] ?? '',
                is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? ''),
                $id
            ];
            
            if ($db->query($sql, $params)) {
                sendResponse(['message' => 'Theme updated successfully']);
            } else {
                sendError('Failed to update theme');
            }
            break;
            
        case 'DELETE':
            if (!$id) sendError('Theme ID required');
            
            if ($db->query("DELETE FROM themes WHERE theme_id = ?", [$id])) {
                sendResponse(['message' => 'Theme deleted successfully']);
            } else {
                sendError('Failed to delete theme');
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

// Parameters handler
function handleParameters($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $parameters = $db->fetchAll("SELECT param_name, param_values FROM parameters WHERE theme_id = ?", [$id]);
                $result = [];
                foreach ($parameters as $param) {
                    $result[$param['param_name']] = json_decode($param['param_values'], true);
                }
                sendResponse($result);
            } else {
                sendError('Theme ID required');
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Check if this is a single parameter or multiple parameters
            if (isset($input['theme_id']) && isset($input['parameters'])) {
                // Multiple parameters format
                $themeId = $input['theme_id'];
                $parameters = $input['parameters'];
                
                // Delete all existing parameters for this theme
                $db->query("DELETE FROM parameters WHERE theme_id = ?", [$themeId]);
                
                // Insert all new parameters
                foreach ($parameters as $paramName => $paramValues) {
                    $sql = "INSERT INTO parameters (theme_id, param_name, param_values) VALUES (?, ?, ?)";
                    $params = [
                        $themeId,
                        $paramName,
                        json_encode($paramValues)
                    ];
                    
                    if (!$db->query($sql, $params)) {
                        sendError('Failed to save parameter: ' . $paramName);
                    }
                }
                
                sendResponse(['message' => 'All parameters saved successfully'], 201);
                
            } else if (isset($input['theme_id'], $input['param_name'], $input['param_values'])) {
                // Single parameter format (legacy)
                // Delete existing parameter
                $db->query("DELETE FROM parameters WHERE theme_id = ? AND param_name = ?", 
                          [$input['theme_id'], $input['param_name']]);
                
                // Insert new parameter
                $sql = "INSERT INTO parameters (theme_id, param_name, param_values) VALUES (?, ?, ?)";
                $params = [
                    $input['theme_id'],
                    $input['param_name'],
                    json_encode($input['param_values'])
                ];
                
                if ($db->query($sql, $params)) {
                    sendResponse(['message' => 'Parameter saved successfully'], 201);
                } else {
                    sendError('Failed to save parameter');
                }
            } else {
                sendError('Missing required fields');
            }
            break;
            
        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['theme_id'], $input['param_name'])) {
                sendError('Missing required fields');
            }
            
            if ($db->query("DELETE FROM parameters WHERE theme_id = ? AND param_name = ?", 
                          [$input['theme_id'], $input['param_name']])) {
                sendResponse(['message' => 'Parameter deleted successfully']);
            } else {
                sendError('Failed to delete parameter');
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

// Generate prompt handler
function handleGenerate($db, $method) {
    if ($method !== 'POST') sendError('Method not allowed', 405);
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['theme_id'], $input['parameters'])) {
        sendError('Missing required fields');
    }
    
    // Debug logging
    error_log('🔍 Debug Generate Backend:');
    error_log('Theme ID: ' . $input['theme_id']);
    error_log('Parameters: ' . json_encode($input['parameters']));
    
    // Get theme
    $theme = $db->fetchOne("SELECT * FROM themes WHERE theme_id = ?", [$input['theme_id']]);
    if (!$theme) sendError('Theme not found', 404);
    
    error_log('Template: ' . $theme['template']);
    
    // Generate prompt
    $template = $theme['template'];
    $negativeTemplate = $theme['negative_prompt'] ?? '';
    
    error_log('🔄 Starting replacements:');
    foreach ($input['parameters'] as $key => $value) {
        // Check if key already has brackets
        if (strpos($key, '[') === 0 && strrpos($key, ']') === strlen($key) - 1) {
            // Key already has brackets: [PARAMETER_NAME]
            $placeholder = $key;
        } else {
            // Key doesn't have brackets: PARAMETER_NAME
            $placeholder = "[{$key}]";
        }
        
        error_log("Replacing {$placeholder} with {$value}");
        
        $oldTemplate = $template;
        $template = str_replace($placeholder, $value, $template);
        
        if ($oldTemplate === $template) {
            error_log("⚠️ No replacement made for {$placeholder}");
        } else {
            error_log("✅ Replacement successful for {$placeholder}");
        }
        
        if ($negativeTemplate) {
            $negativeTemplate = str_replace($placeholder, $value, $negativeTemplate);
        }
    }
    
    error_log('Final Template: ' . $template);
    
    // Calculate stats
    $wordCount = str_word_count($template);
    $charCount = strlen($template);
    
    // Save to history
    $db->query("INSERT INTO prompt_history (theme_id, project_id, prompt_text, negative_prompt, parameters_used, word_count, char_count) 
                VALUES (?, ?, ?, ?, ?, ?, ?)", [
        $input['theme_id'],
        $input['project_id'] ?? null,
        $template,
        $negativeTemplate,
        json_encode($input['parameters']),
        $wordCount,
        $charCount
    ]);
    
    // Track analytics
    $db->query("INSERT INTO analytics (event_type, theme_id, data) VALUES (?, ?, ?)", [
        'prompt_generated',
        $input['theme_id'],
        json_encode(['parameters' => $input['parameters'], 'word_count' => $wordCount])
    ]);
    
    sendResponse([
        'prompt' => $template,
        'negative_prompt' => $negativeTemplate,
        'word_count' => $wordCount,
        'char_count' => $charCount,
        'theme' => $theme['name']
    ]);
}

// Projects handler
function handleProjects($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $project = $db->fetchOne("SELECT * FROM projects WHERE project_id = ?", [$id]);
                if (!$project) sendError('Project not found', 404);
                $project['settings'] = json_decode($project['settings'] ?? '{}', true);
                sendResponse($project);
            } else {
                $projects = $db->fetchAll("SELECT * FROM projects ORDER BY updated_at DESC");
                foreach ($projects as &$project) {
                    $project['settings'] = json_decode($project['settings'] ?? '{}', true);
                }
                sendResponse($projects);
            }
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['project_id'], $input['name'])) {
                sendError('Missing required fields');
            }
            
            $sql = "INSERT INTO projects (project_id, name, description, category, tags, auto_backup, settings) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            $params = [
                $input['project_id'],
                $input['name'],
                $input['description'] ?? '',
                $input['category'] ?? '',
                is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? ''),
                $input['auto_backup'] ?? 0,
                json_encode($input['settings'] ?? [])
            ];
            
            if ($db->query($sql, $params)) {
                sendResponse(['message' => 'Project created successfully', 'project_id' => $input['project_id']], 201);
            } else {
                sendError('Failed to create project');
            }
            break;
            
        case 'PUT':
            if (!$id) sendError('Project ID required');
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) sendError('Invalid JSON input');
            
            $sql = "UPDATE projects SET name = ?, description = ?, category = ?, tags = ?, 
                    auto_backup = ?, settings = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?";
            $params = [
                $input['name'],
                $input['description'] ?? '',
                $input['category'] ?? '',
                is_array($input['tags']) ? implode(',', $input['tags']) : ($input['tags'] ?? ''),
                $input['auto_backup'] ?? 0,
                json_encode($input['settings'] ?? []),
                $id
            ];
            
            if ($db->query($sql, $params)) {
                sendResponse(['message' => 'Project updated successfully']);
            } else {
                sendError('Failed to update project');
            }
            break;
            
        case 'DELETE':
            if (!$id) sendError('Project ID required');
            
            if ($db->query("DELETE FROM projects WHERE project_id = ?", [$id])) {
                sendResponse(['message' => 'Project deleted successfully']);
            } else {
                sendError('Failed to delete project');
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}

// Analytics handler
function handleAnalytics($db, $method) {
    if ($method !== 'GET') sendError('Method not allowed', 405);
    
    // Get total prompts
    $totalPrompts = $db->fetchOne("SELECT COUNT(*) as count FROM prompt_history")['count'];
    
    // Get theme usage
    $themeUsage = $db->fetchAll("
        SELECT t.name, COUNT(ph.id) as usage_count 
        FROM themes t 
        LEFT JOIN prompt_history ph ON t.theme_id = ph.theme_id 
        GROUP BY t.theme_id, t.name 
        ORDER BY usage_count DESC
    ");
    
    // Get today's prompts
    $todayPrompts = $db->fetchOne("
        SELECT COUNT(*) as count 
        FROM prompt_history 
        WHERE DATE(created_at) = DATE('now')
    ")['count'];
    
    // Get popular parameters
    $popularParams = $db->fetchAll("
        SELECT theme_id, parameters_used, COUNT(*) as usage_count 
        FROM prompt_history 
        WHERE parameters_used IS NOT NULL 
        GROUP BY theme_id, parameters_used 
        ORDER BY usage_count DESC 
        LIMIT 10
    ");
    
    sendResponse([
        'total_prompts' => $totalPrompts,
        'theme_usage' => $themeUsage,
        'today_prompts' => $todayPrompts,
        'popular_parameters' => $popularParams
    ]);
}

// History handler
function handleHistory($db, $method, $id) {
    switch ($method) {
        case 'GET':
            if ($id) {
                $history = $db->fetchOne("SELECT * FROM prompt_history WHERE id = ?", [$id]);
                if (!$history) sendError('History not found', 404);
                $history['parameters_used'] = json_decode($history['parameters_used'] ?? '[]', true);
                sendResponse($history);
            } else {
                $limit = $_GET['limit'] ?? 50;
                $offset = $_GET['offset'] ?? 0;
                $search = $_GET['search'] ?? '';
                
                $sql = "SELECT ph.*, t.name as theme_name 
                        FROM prompt_history ph 
                        LEFT JOIN themes t ON ph.theme_id = t.theme_id";
                $params = [];
                
                if ($search) {
                    $sql .= " WHERE ph.prompt_text LIKE ? OR t.name LIKE ?";
                    $params = ["%{$search}%", "%{$search}%"];
                }
                
                $sql .= " ORDER BY ph.created_at DESC LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                $history = $db->fetchAll($sql, $params);
                foreach ($history as &$item) {
                    $item['parameters_used'] = json_decode($item['parameters_used'] ?? '[]', true);
                }
                
                sendResponse($history);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                if ($db->query("DELETE FROM prompt_history WHERE id = ?", [$id])) {
                    sendResponse(['message' => 'History item deleted successfully']);
                } else {
                    sendError('Failed to delete history item');
                }
            } else {
                // Clear all history
                if ($db->query("DELETE FROM prompt_history")) {
                    sendResponse(['message' => 'All history cleared successfully']);
                } else {
                    sendError('Failed to clear history');
                }
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }
}
?> 