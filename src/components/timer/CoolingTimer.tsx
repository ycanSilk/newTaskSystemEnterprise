import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

interface CoolingTimerProps {
  onCoolingStart?: (endTime: number) => void;
  onCoolingEnd?: () => void;
  initialMinutes?: number;
  initialSeconds?: number;
}

interface RemainingTime {
  minutes: number;
  seconds: number;
}

/**
 * 冷却计时器组件
 * 独立封装的计时逻辑，使用localStorage持久化状态
 */
export const CoolingTimer = forwardRef<{
  startCooling: (durationMinutes?: number) => void;
  endCooling: () => void;
  isCoolingDown: boolean;
  remainingTime: RemainingTime;
}, CoolingTimerProps>((props, ref) => {
  const { onCoolingStart, onCoolingEnd, initialMinutes = 5, initialSeconds = 0 } = props;
  const [coolingDown, setCoolingDown] = useState(false);
  const [coolingEndTime, setCoolingEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<RemainingTime>({ minutes: 0, seconds: 0 });

  // 从localStorage恢复冷却状态
  const restoreCoolingState = useCallback(() => {
   
    try {
      const isCoolingDown = localStorage.getItem('commenter_cooling_down') === 'true';
      const coolingEndTimeStr = localStorage.getItem('commenter_cooling_end_time');

      if (isCoolingDown && coolingEndTimeStr && coolingEndTimeStr.trim() !== '') {
        const coolingEndTime = parseInt(coolingEndTimeStr, 10);
        const now = Date.now();
        const remaining = coolingEndTime - now;
        
       
        
        if (remaining > 0) {
         
          setCoolingDown(true);
          setCoolingEndTime(coolingEndTime);
          
          // 计算剩余时间
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setRemainingTime({ minutes, seconds });
          
          return coolingEndTime;
        } else {
         
          localStorage.removeItem('commenter_cooling_down');
          localStorage.removeItem('commenter_cooling_end_time');
        }
      }
    } catch (e) {
      console.error('CoolingTimer: 恢复冷却状态出错:', e);
    }
    return null;
  }, []);

  // 初始化时恢复冷却状态
  useEffect(() => {

    restoreCoolingState();
  }, [restoreCoolingState]);

  // 冷却倒计时逻辑
  useEffect(() => {
  
    let timer: NodeJS.Timeout | undefined;
    
    if (coolingDown && coolingEndTime) {

      
      const calculateRemainingTime = () => {
        const now = Date.now();
        const diff = coolingEndTime - now;
        
       
        if (diff <= 0) {
        
          setCoolingDown(false);
          setCoolingEndTime(null);
          setRemainingTime({ minutes: 0, seconds: 0 });
          localStorage.removeItem('commenter_cooling_down');
          localStorage.removeItem('commenter_cooling_end_time');
          
          if (onCoolingEnd) {
            onCoolingEnd();
          }
          
          return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
      
        setRemainingTime({ minutes, seconds });
      };
      
      calculateRemainingTime();
      timer = setInterval(calculateRemainingTime, 1000);
    }
    
    return () => {
   
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [coolingDown, coolingEndTime, onCoolingEnd]);

  // 监听storage事件，同步多标签页状态
  useEffect(() => {
   
    
    const handleStorageChange = (e: StorageEvent) => {
  
      
      if (e.key === 'commenter_cooling_down' || e.key === 'commenter_cooling_end_time') {
        // 恢复冷却状态以同步
        restoreCoolingState();
      }
    };
    
    const handleStorageChangeWrapper = (e: Event) => {
      handleStorageChange(e as StorageEvent);
    };
    
    window.addEventListener('storage', handleStorageChangeWrapper);
    
    return () => {
      
      window.removeEventListener('storage', handleStorageChangeWrapper);
    };
  }, [restoreCoolingState]);

  // 开始冷却方法
  const startCooling = useCallback((durationMinutes: number = initialMinutes) => {

    const durationMs = durationMinutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    
    
    setCoolingDown(true);
    setCoolingEndTime(endTime);
    setRemainingTime({ minutes: durationMinutes, seconds: 0 });
    
    try {
      localStorage.setItem('commenter_cooling_down', 'true');
      localStorage.setItem('commenter_cooling_end_time', endTime.toString());
     
    } catch (e) {
      console.error('CoolingTimer: localStorage保存失败:', e);
    }
    
    if (onCoolingStart) {
      onCoolingStart(endTime);
    }
  }, [initialMinutes, onCoolingStart]);

  // 结束冷却方法
  const endCooling = useCallback(() => {

    setCoolingDown(false);
    setCoolingEndTime(null);
    setRemainingTime({ minutes: 0, seconds: 0 });
    
    try {
      localStorage.removeItem('commenter_cooling_down');
      localStorage.removeItem('commenter_cooling_end_time');
  
    } catch (e) {
      console.error('CoolingTimer: localStorage清除失败:', e);
    }
    
    if (onCoolingEnd) {
      onCoolingEnd();
    }
  }, [onCoolingEnd]);

  // 格式化剩余时间显示
  const formatRemainingTime = () => {
    const { minutes, seconds } = remainingTime;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 暴露给父组件的API
  useImperativeHandle(ref, () => ({
    startCooling,
    endCooling,
    isCoolingDown: coolingDown,
    remainingTime
  }));

  return (
    <div className="cooling-timer">
      {coolingDown && (
        <div className="cooling-info">
          冷却中: {formatRemainingTime()}
        </div>
      )}
    </div>
  );
});

export default CoolingTimer;