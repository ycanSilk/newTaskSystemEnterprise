// 用户信息加密工具函数
// 用于加密和解密用户信息，确保客户端存储的用户信息安全

/**
 * 简单的加密函数，使用Base64编码实现基本加密
 * @param data 要加密的数据
 * @returns 加密后的字符串
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // 使用Base64编码加密
    const base64String = btoa(jsonString);
    // 添加简单的字符替换，增强加密效果
    return base64String
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (error) {
    console.error('加密失败:', error);
    throw error;
  }
};

/**
 * 简单的解密函数，对应encryptData的解密
 * @param encryptedData 要解密的字符串
 * @returns 解密后的数据
 */
export const decryptData = <T>(encryptedData: string): T => {
  try {
    // 恢复字符替换
    const base64String = encryptedData
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    // 添加适当的填充
    const paddedString = base64String + '='.repeat((4 - base64String.length % 4) % 4);
    // 使用Base64解码解密
    const jsonString = atob(paddedString);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('解密失败:', error);
    throw error;
  }
};

/**
 * 生成随机密钥，用于更复杂的加密（预留）
 * @returns 随机密钥
 */
export const generateRandomKey = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
