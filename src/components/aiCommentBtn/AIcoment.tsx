'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';

interface MiddleCommentGeneratorProps {
  onCommentsGenerated: (comments: string[], success: boolean) => void;
  onProgressUpdate?: (current: number, total: number) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  commentCount: number;
  atUser?: string;
  name?: string;
  userComments?: string[];
  industry?: string;
  sessionId?: string;
}

interface CommentRule {
  description: string;
  minWords: number;
  maxWords: number;
  lastCommentMaxWords?: number;
  atPositionDist: {
    开头: number;
    中间: number;
    结尾: number;
  };
  homophoneReplace: Record<string, string>;
  forbiddenPatterns: string[];
  vocabulary: {
    开头语: string[];
    中间连接词: string[];
    结果感受词: string[];
    结尾语气词: string[];
  };
}

export default function MiddleCommentGenerator({
  onCommentsGenerated,
  onProgressUpdate,
  isLoading,
  onLoadingChange,
  commentCount,
  atUser,
  name,
  userComments,
  industry,
  sessionId = 'default'
}: MiddleCommentGeneratorProps) {
  const [ruleConfig, setRuleConfig] = useState<CommentRule | null>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  // 默认使用批量生成模式（快捷模式）
  const generateMode = 'batch';
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 组件加载时自动生成评论
  useEffect(() => {
    // 当规则配置加载完成后，自动开始生成评论
    if (ruleConfig && !isLoading) {
      console.log('AIcoment组件加载完成，自动开始生成评论');
      handleGenerateComments();
    }
  }, [ruleConfig, isLoading]);



  // 选项列表
  const industryOptions = [
      "竞技足球",
      "游戏",
      "付业",
      "信息咨询",
      "宣传类"
  ];

  // 获取随机
  const getRandomIndustry = () => {
    return industryOptions[Math.floor(Math.random() * industryOptions.length)];
  };

  // 加载规则配置
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // 加载规则配置
        const ruleResponse = await fetch('/rules/middle_comment.json');
        if (!ruleResponse.ok) throw new Error('加载规则配置失败');
        const ruleData = await ruleResponse.json();
        setRuleConfig(ruleData.rules);
        console.log('[Middle Comment Generator] 加载规则配置成功:', ruleData.rules);
      } catch (err) {
        console.error('加载配置失败:', err);
        setError('加载配置失败，请稍后重试');
      }
    };

    loadConfigs();
  }, []);

  // 随机选取数组元素
  const randomPick = (arr: string[]): string => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // 同音替换
  const applyHomophone = (text: string): string => {
    if (!ruleConfig?.homophoneReplace) return text;
    let newText = text;
    for (const [orig, repl] of Object.entries(ruleConfig.homophoneReplace)) {
      newText = newText.replace(new RegExp(orig, 'g'), repl);
    }
    return newText;
  };

  // 检查是否包含禁止词
  const containsForbidden = (text: string): boolean => {
    if (!ruleConfig?.forbiddenPatterns) return false;
    return ruleConfig.forbiddenPatterns.some(word => text.includes(word));
  };

  // 处理文本，移除×××占位符，但保留@用户标识
  const processText = (text: string): string => {
    // 移除×××占位符
    let processedText = text.replace(/×××/g, '');
    // 移除[[@...]]格式的字符，但保留@用户标识
    processedText = processedText.replace(/\[\[@([^\]]+)\]\]/g, '@$1');
    // 过滤掉乱码字符（如 � 等）
    processedText = processedText.replace(/[\uFFFD]/g, '').trim();
    // 过滤掉"/"符号
    processedText = processedText.replace(/\//g, '').trim();
    return processedText;
  };

  // 文本过滤函数，移除用户名关键词
  const filterUsernames = (text: string): string => {
    const usernameKeywords = ['小王', '啊浩', '豪哥', '上善若水'];
    let filteredText = text;
    for (const keyword of usernameKeywords) {
      filteredText = filteredText.replace(new RegExp(keyword, 'g'), '');
    }
    // 移除多余的空格
    filteredText = filteredText.replace(/\s+/g, ' ').trim();
    return filteredText;
  };

  // 替换规则存储
  const [replaceRules, setReplaceRules] = useState<Record<string, string>>({});

  // 加载替换规则
  useEffect(() => {
    const loadReplaceRules = async () => {
      try {
        const response = await fetch('/file/textReplac.json');
        if (!response.ok) throw new Error('加载替换规则失败');
        const data = await response.json();
        setReplaceRules(data);
      } catch (err) {
        console.error('加载替换规则失败:', err);
        // 使用默认替换规则作为 fallback
        setReplaceRules({
          '跟': '根',
          '操': '曹',
          '赢': '营',
          '投注':'投助',
          '投资':'投咨',
          '下注':'下住'
        });
      }
    };

    loadReplaceRules();
  }, []);

  // 执行文本替换操作
  const applyTextReplacements = (text: string): string => {
    let replacedText = text;
    console.log(`[Middle Comment Generator] 开始执行替换逻辑，原始文本:`, text);
    
    // 处理全角和半角字符
    for (const [orig, repl] of Object.entries(replaceRules)) {
      // 创建包含全角和半角的正则表达式
      const regex = new RegExp(orig, 'g');
      const beforeReplace = replacedText;
      replacedText = replacedText.replace(regex, repl);
      if (beforeReplace !== replacedText) {
        console.log(`[Middle Comment Generator] 执行替换: ${orig} → ${repl}`);
        console.log(`[Middle Comment Generator] 替换前:`, beforeReplace);
        console.log(`[Middle Comment Generator] 替换后:`, replacedText);
      }
    }
    
    console.log(`[Middle Comment Generator] 替换逻辑执行完成，最终文本:`, replacedText);
    return replacedText;
  };

  // 生成默认提示词
  const getDefaultPrompt = (): string => {
    const defaultPrompts = [
      '真的假的？感谢分享',
      '学到了！太实用了',
      '这方法真不错',
      '谢谢分享，很有帮助',
      '太棒了，值得学习',
      '真的很有用，感谢',
      '学到了新知识',
      '这分享太及时了',
      '非常实用的信息',
      '感谢分享，受益匪浅'
    ];
    return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
  };

  // 根据规则随机插入@用户标识
  const insertAtUser = (comment: string, atUser: string): string => {
    if (!ruleConfig || !atUser) return comment;

    const posRand = Math.random();
    let newComment = comment;

    if (posRand < ruleConfig.atPositionDist.开头) {
      // 开头
      newComment = `@${atUser} ${comment}`;
    } else if (posRand < ruleConfig.atPositionDist.开头 + ruleConfig.atPositionDist.中间) {
      // 中间
      const parts = comment.split('，');
      if (parts.length >= 2) {
        const insertIndex = Math.floor(Math.random() * (parts.length - 1)) + 1;
        parts.splice(insertIndex, 0, `@${atUser}`);
        newComment = parts.join('，');
      } else {
        // 如果评论只有一部分，放在开头
        newComment = `@${atUser} ${comment}`;
      }
    } else {
      // 结尾
      newComment = `${comment} @${atUser}`;
    }

    return newComment;
  };

  // 处理评论存储格式，使用[[]]标记@用户标识
  const formatCommentForStorage = (comment: string, atUser: string): string => {
    if (!atUser) return comment;
    return comment.replace(new RegExp(`@${atUser}`, 'g'), `[[@${atUser}]]`);
  };

  // 生成单条评论（带重试）
  const generateSingleComment = useCallback(async (
    draft: string,
    index: number,
    previousComments: string[]
  ): Promise<string> => {
    const maxRetries = 3;
    let lastError: any;
    // 使用随机
    const industryOptions = [
      "竞技足球",
      "游戏",
      "付页",
      "信息咨询",
      "宣传类"
    ];
    const randomIndustry = industryOptions[Math.floor(Math.random() * industryOptions.length)];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/generate-comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draft: draft.trim() || `请生成一条关于${randomIndustry}的评论`,
            industry: randomIndustry,
            commentIndex: index,
            totalComments: commentCount,
            sessionId,
            previousComments: previousComments.slice(-10) // 只传最近10条
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '生成失败');
        }

        const data = await response.json();
        return data.polished;
      } catch (error) {
        console.error(`生成第${index + 1}条评论失败 (尝试 ${attempt + 1}/${maxRetries}):`, error);
        lastError = error;
        
        // 重试前添加延迟
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }, [commentCount, sessionId]);

  // 批量生成评论（带重试）
  const generateBatchComments = useCallback(async (
    drafts: string[]
  ): Promise<string[]> => {
    const maxRetries = 3;
    let lastError: any;
    // 使用随机
    const industryOptions = [
      '无', '科技', '教育', '医疗', '金融', '旅游', '餐饮', '娱乐', '体育', '艺术',
      '时尚', '汽车', '房产', '电商', '物流', '制造', '能源', '环保', '农业', '服务业'
    ];
    const randomIndustry = industryOptions[Math.floor(Math.random() * industryOptions.length)];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('/api/generate-comment', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            drafts: drafts.map(d => d.trim() || `请生成一条关于${randomIndustry}的评论`),
            industry: randomIndustry,
            sessionId
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '批量生成失败');
        }

        const data = await response.json();
        return data.comments;
      } catch (error) {
        console.error(`批量生成失败 (尝试 ${attempt + 1}/${maxRetries}):`, error);
        lastError = error;
        
        // 重试前添加延迟
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }, [industry, sessionId]);

  // 生成评论
  const handleGenerateComments = async () => {
    if (!ruleConfig) {
      setError('规则配置未加载');
      return;
    }

    if (isLoading) return;
    
    // 创建新的 AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    onLoadingChange(true);
    setError('');
    setRetryCount(0);

    try {
      const results: string[] = [];
      const storageComments: string[] = [];
      
      // 准备草稿评论
      const drafts = userComments || [];
      const fullDrafts = Array.from({ length: commentCount }, (_, i) => {
        return drafts[i]?.trim() || getDefaultPrompt();
      });
      
      // 始终使用批量模式生成评论
      onProgressUpdate?.(0, commentCount);
      
      const batchResults = await generateBatchComments(fullDrafts);
      results.push(...batchResults);
      
      onProgressUpdate?.(commentCount, commentCount);
      
      // 去重后返回
      const uniqueResults = results.map((r, idx) => {
        // 如果与前一条太相似，稍微修改
        if (idx > 0 && r === results[idx - 1]) {
          return r + '，';
        }
        return r;
      });
      
      // 计算两个字符串的相似度（使用编辑距离算法）
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + cost // 替换
        );
      }
    }

    const maxLength = Math.max(len1, len2);
    const similarity = 1 - matrix[len1][len2] / maxLength;
    return similarity;
  };

  // 处理@用户标识和文本替换
  const finalComments = uniqueResults.map((comment, i) => {
    let processedComment = processText(comment);
    processedComment = applyTextReplacements(processedComment);
    
    // 上评评论（第一条）：固定带name参数
    if (i === 0) {
      // 普通评论的字数控制，限制在20字以内
      if (processedComment.length > 20) {
        processedComment = processedComment.slice(0, 19) + '…';
      } else if (processedComment.length < ruleConfig.minWords) {
        processedComment = processedComment + ` ${randomPick(ruleConfig.vocabulary.结尾语气词)}`;
      }
      
      // 确保添加name参数
      if (name && !processedComment.includes(name)) {
        const namePos = Math.random();
        if (namePos < 0.33) {
          processedComment = `${name} ${processedComment}`;
        } else if (namePos < 0.66) {
          const parts = processedComment.split('，');
          if (parts.length >= 2) {
            const insertIndex = Math.floor(Math.random() * (parts.length - 1)) + 1;
            parts.splice(insertIndex, 0, name);
            processedComment = parts.join('，');
          } else {
            processedComment = `${processedComment} ${name}`;
          }
        } else {
          processedComment = `${processedComment} ${name}`;
        }
      }
      
    }
    // 中评评论的第二条（第三条评论）：固定带atUser参数
    else if (i === 2 && atUser) {
      // 提取实际评论内容（排除@用户标识）
      let commentWithoutAt = processedComment.replace(new RegExp(`@${atUser}`, 'g'), '').trim();
      // 对于带有@用户标识的评论，限制实际内容在7字以内（不包含@用户标识）
      const lastCommentMaxWords = 7;
      console.log('[Middle Comment Generator] 最后一条评论字数限制:', lastCommentMaxWords);
      console.log('[Middle Comment Generator] 最后一条评论实际内容长度:', commentWithoutAt.length);
      
      // 确保截取的内容不包含乱码，并且长度正确
      let trimmedContent = commentWithoutAt;
      if (commentWithoutAt.length > lastCommentMaxWords) {
        // 截取前lastCommentMaxWords个字符
        trimmedContent = commentWithoutAt.slice(0, lastCommentMaxWords);
        console.log('[Middle Comment Generator] 截取后的内容:', trimmedContent);
      }
      // 插入@用户标识
      processedComment = insertAtUser(trimmedContent, atUser);
      console.log('[Middle Comment Generator] 处理后的最后一条评论:', processedComment);
      
    }
    // 其他评论（中评第一条）
    else {
      // 普通评论的字数控制，限制在20字以内
      if (processedComment.length > 20) {
        processedComment = processedComment.slice(0, 19) + '…';
      } else if (processedComment.length < ruleConfig.minWords) {
        processedComment = processedComment + ` ${randomPick(ruleConfig.vocabulary.结尾语气词)}`;
      }
      
    }
    
    return processedComment;
  });

  // 确保生成的评论与历史评论的差异度在50%以上
  const filteredComments = finalComments.filter((comment, index) => {
    // 对于第一条评论，不需要检查相似度
    if (index === 0) return true;
    
    // 检查与之前所有评论的相似度
    for (let i = 0; i < index; i++) {
      const similarity = calculateSimilarity(comment, finalComments[i]);
      console.log(`[Middle Comment Generator] 评论 ${i} 与评论 ${index} 的相似度: ${(similarity * 100).toFixed(2)}%`);
      // 如果相似度超过50%，则过滤掉
      if (similarity > 0.5) {
        return false;
      }
    }
    return true;
  });

  // 如果过滤后评论数量不足，使用默认提示词补充
  while (filteredComments.length < commentCount) {
    const randomPrompt = getDefaultPrompt();
    let isUnique = true;
    
    // 检查与现有评论的相似度
    for (const existingComment of filteredComments) {
      const similarity = calculateSimilarity(randomPrompt, existingComment);
      if (similarity > 0.5) {
        isUnique = false;
        break;
      }
    }
    
    if (isUnique) {
      filteredComments.push(randomPrompt);
    }
  }
      
      // 应用文本过滤，移除用户名关键词
      filteredComments.forEach((comment, i) => {
        let storageComment = comment;
        if (atUser && i === commentCount - 1) {
          storageComment = formatCommentForStorage(comment, atUser);
        }
        const filteredStorageComment = filterUsernames(storageComment);
        storageComments.push(filteredStorageComment);
      });
      
      // 将生成的评论添加到词库
      try {
        const addToLibraryResponse = await fetch('/api/task/addCommentToLibrary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: storageComments }),
        });
        
        if (!addToLibraryResponse.ok) {
          const errorData = await addToLibraryResponse.json();
          console.error('添加评论到词库失败:', errorData.message);
        }
      } catch (err) {
        console.error('添加评论到词库失败:', err);
      }

      // 只有生成足够数量的评论后，才传递成功状态
      if (filteredComments.length >= commentCount) {
        console.log('全部评论生成完成，传递成功状态');
        onCommentsGenerated(filteredComments, true);
      } else {
        console.log('评论生成数量不足，传递失败状态');
        onCommentsGenerated(filteredComments, false);
      }
    } catch (err: any) {
      console.error('生成评论失败:', err);
      setError(err.message || '生成评论失败');
      
      // 如果失败，使用原内容
      const fallbackComments = userComments || [];
      onCommentsGenerated(fallbackComments, false);
    } finally {
      onLoadingChange(false);
      abortControllerRef.current = null;
    }
  };

  // 取消生成
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    onLoadingChange(false);
  }, [onLoadingChange]);

  return (
    <div className="space-y-3">
      {/* 生成按钮 */}
      <div className="flex space-x-2">
        <Button
          onClick={handleGenerateComments}
          disabled={isLoading || !ruleConfig}
          className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md font-medium disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </span>
          ) : (
            `生成评论`
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
