<?php
/**
 * Token 管理类（纯原生实现，无第三方依赖）
 * 
 * 功能：
 * - 生成 base64(JSON) 格式的 token
 * - 校验 token 有效性
 * - 跨端访问拦截
 */

class Token
{
    // 用户类型常量
    const TYPE_C = 1;      // C端
    const TYPE_B = 2;      // B端
    const TYPE_ADMIN = 3;  // Admin端

    // Token 有效期（秒）
    const EXPIRE_TIME = 7 * 24 * 3600; // 7天

    /**
     * 生成 Token
     * 
     * @param int $userId 用户ID
     * @param int $type 用户类型 1=C端 2=B端 3=Admin端
     * @param int $expireSeconds Token有效期（秒，默认7天）
     * @return array ['token' => string, 'expired_at' => timestamp]
     */
    public static function generate($userId, $type, $expireSeconds = self::EXPIRE_TIME)
    {
        // 计算过期时间戳
        $exp = time() + $expireSeconds;

        // 构建 payload
        $payload = [
            'user_id' => (int)$userId,
            'type' => (int)$type,
            'exp' => $exp
        ];

        // 转 JSON 并 base64 编码
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $token = base64_encode($json);

        return [
            'token' => $token,
            'expired_at' => date('Y-m-d H:i:s', $exp)
        ];
    }

    /**
     * 解析 Token（仅解码，不校验）
     * 
     * @param string $token
     * @return array|null 返回 ['user_id', 'type', 'exp'] 或 null
     */
    public static function decode($token)
    {
        if (empty($token)) {
            return null;
        }

        // base64 解码
        $json = base64_decode($token, true);
        if ($json === false) {
            return null;
        }

        // JSON 解析
        $payload = json_decode($json, true);
        if (!is_array($payload)) {
            return null;
        }

        // 验证必需字段
        if (!isset($payload['user_id']) || !isset($payload['type']) || !isset($payload['exp'])) {
            return null;
        }

        return $payload;
    }

    /**
     * 校验 Token 合法性（完整校验）
     * 
     * @param string $token 待校验的token
     * @param int $expectedType 期望的用户类型 1=C端 2=B端 3=Admin端
     * @param PDO $db 数据库连接
     * @param string $deviceId 设备ID（可选）
     * @return array 成功返回 ['valid' => true, 'user_id' => xxx, 'type' => xxx]
     *               失败返回 ['valid' => false, 'error' => '错误原因', 'code' => 错误代码]
     */
    public static function verify($token, $expectedType, $db, $deviceId = null)
    {
        // 1. 解码 Token
        $payload = self::decode($token);
        if (!$payload) {
            return ['valid' => false, 'error' => 'Token 格式无效', 'code' => 401];
        }

        // 2. 校验过期时间
        if ($payload['exp'] < time()) {
            return ['valid' => false, 'error' => 'Token 已过期', 'code' => 401];
        }

        // 3. 校验用户类型是否匹配（防止跨端访问）
        if ((int)$payload['type'] !== (int)$expectedType) {
            return ['valid' => false, 'error' => '权限不足，禁止跨端访问', 'code' => 403];
        }

        // 4. 从数据库校验 Token 是否一致
        $tableName = self::getTableName($payload['type']);
        if (!$tableName) {
            return ['valid' => false, 'error' => '用户类型错误', 'code' => 400];
        }

        try {
            $stmt = $db->prepare("
                SELECT id, token, token_expired_at, status, device_id, device_list 
                FROM {$tableName} 
                WHERE id = :user_id
            ");
            $stmt->execute(['user_id' => $payload['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // 用户不存在
            if (!$user) {
                return ['valid' => false, 'error' => '用户不存在', 'code' => 404];
            }

            // 用户已被禁用
            if ($user['status'] != 1) {
                return ['valid' => false, 'error' => '账号已被禁用', 'code' => 403];
            }

            // 检查token一致性，确保每次登录后旧token失效
            if ($user['token'] !== $token) {
                return ['valid' => false, 'error' => '账号已在其他设备登录，请重新登录', 'code' => 4011];
            }

            // 数据库中的过期时间二次校验
            if (strtotime($user['token_expired_at']) < time()) {
                return ['valid' => false, 'error' => 'Token 已过期', 'code' => 401];
            }

            // 5. 校验设备ID（如果提供）
            if ($deviceId && !empty($user['device_id'])) {
                if ($user['device_id'] !== $deviceId) {
                    // 检查设备是否在设备列表中
                    $deviceExists = false;
                    if (!empty($user['device_list'])) {
                        $deviceList = json_decode($user['device_list'], true) ?: [];
                        foreach ($deviceList as $device) {
                            if ($device['device_id'] == $deviceId) {
                                $deviceExists = true;
                                break;
                            }
                        }
                    }
                    
                    if (!$deviceExists) {
                        return ['valid' => false, 'error' => '设备未授权，请重新登录', 'code' => 4012];
                    }
                }
            }

            // 校验通过
            return [
                'valid' => true,
                'user_id' => $payload['user_id'],
                'type' => $payload['type']
            ];

        } catch (PDOException $e) {
            return ['valid' => false, 'error' => '数据库查询失败', 'code' => 500];
        }
    }

    /**
     * 更新数据库中的 Token（登录时调用）
     * 
     * @param int $userId 用户ID
     * @param int $type 用户类型
     * @param string $token 新token
     * @param string $expiredAt 过期时间（Y-m-d H:i:s格式）
     * @param PDO $db 数据库连接
     * @return bool
     */
    public static function updateToDatabase($userId, $type, $token, $expiredAt, $db)
    {
        $tableName = self::getTableName($type);
        if (!$tableName) {
            return false;
        }

        try {
            $stmt = $db->prepare("
                UPDATE {$tableName} 
                SET token = :token, token_expired_at = :expired_at 
                WHERE id = :user_id
            ");
            return $stmt->execute([
                'token' => $token,
                'expired_at' => $expiredAt,
                'user_id' => $userId
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * 清除 Token（退出登录时调用）
     * 
     * @param int $userId 用户ID
     * @param int $type 用户类型
     * @param PDO $db 数据库连接
     * @return bool
     */
    public static function clearFromDatabase($userId, $type, $db)
    {
        $tableName = self::getTableName($type);
        if (!$tableName) {
            return false;
        }

        try {
            $stmt = $db->prepare("
                UPDATE {$tableName} 
                SET token = NULL, token_expired_at = NULL 
                WHERE id = :user_id
            ");
            return $stmt->execute(['user_id' => $userId]);
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * 根据用户类型获取表名
     * 
     * @param int $type 用户类型
     * @return string|null
     */
    private static function getTableName($type) {
        switch ((int)$type) {
            case self::TYPE_C:
                return 'c_users';
            case self::TYPE_B:
                return 'b_users';
            case self::TYPE_ADMIN:
                return 'system_users';
            default:
                return null;
        }
    }

    /**
     * 从 HTTP 请求头中获取 Token
     * 
     * 支持多种方式：
     * 1. Authorization: Bearer <token>
     * 2. X-Token: <token>
     * 3. Token: <token>
     * 4. 从GET参数中获取token
     * 
     * @return string|null
     */
    public static function getFromRequest()
    {
        // 方式1：Authorization Bearer
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        // 方式2：X-Token
        if (!empty($_SERVER['HTTP_X_TOKEN'])) {
            return $_SERVER['HTTP_X_TOKEN'];
        }


        // 方式4：从GET参数中获取token（备用方案）
        if (!empty($_GET['token'])) {
            return $_GET['token'];
        }

        return null;
    }
}

