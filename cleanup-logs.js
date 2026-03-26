const fs = require('fs');
const path = require('path');

// 配置
const LOG_ROOT = 'D:\\github\\newTaskSystemEnterprise\\src';
const DAYS_TO_KEEP = 7;

/**
 * 获取当前日期（YYYYMMDD格式）
 * @returns {string} 格式化后的日期字符串
 */
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 计算目标日期（当前日期减去指定天数）
 * @param {number} days 要减去的天数
 * @returns {string} 计算后的日期字符串
 */
const getTargetDate = (days) => {
  const target = new Date();
  target.setDate(target.getDate() - days);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 清理过期日志
 */
const cleanupLogs = () => {
  console.log('开始清理过期日志...');
  
  try {
    // 获取目标日期（7天前）
    const targetDate = getTargetDate(DAYS_TO_KEEP);
    console.log(`清理目标日期：${targetDate} 之前的日志`);
    
    // 读取src目录下的所有条目
    const entries = fs.readdirSync(LOG_ROOT, { withFileTypes: true });
    
    // 遍历所有条目
    entries.forEach(entry => {
      // 检查是否为目录且目录名是8位数字的日期格式
      if (entry.isDirectory() && /^\d{8}$/.test(entry.name)) {
        // 比较日期
        if (entry.name < targetDate) {
          const dirPath = path.join(LOG_ROOT, entry.name);
          console.log(`删除过期日志目录：${dirPath}`);
          
          // 删除目录及其所有内容
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
    });
    
    console.log('日志清理完成！');
  } catch (error) {
    console.error('清理日志时发生错误：', error);
  }
};

// 执行清理
cleanupLogs();
