'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';

interface MiddleCommentGeneratorProps {
  onCommentsGenerated: (comments: string[]) => void;
  onProgressUpdate?: (current: number, total: number) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  commentCount: number;
  atUser?: string;
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
  userComments,
  industry,
  sessionId = 'default'
}: MiddleCommentGeneratorProps) {
  const [ruleConfig, setRuleConfig] = useState<CommentRule | null>(null);
  const [commentLibrary, setCommentLibrary] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [generateMode, setGenerateMode] = useState<'single' | 'batch'>('batch');
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 加载规则配置和评论词库
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // 加载规则配置
        const ruleResponse = await fetch('/rules/middle_comment.json');
        if (!ruleResponse.ok) throw new Error('加载规则配置失败');
        const ruleData = await ruleResponse.json();
        setRuleConfig(ruleData.rules);
        console.log('[Middle Comment Generator] 加载规则配置成功:', ruleData.rules);

        // 加载评论词库
        let libraryResponse;
        let libraryData;
        try {
          // 尝试加载带空格的文件名
          libraryResponse = await fetch('/file/comment .json');
          if (!libraryResponse.ok) throw new Error('加载评论词库失败');
          libraryData = await libraryResponse.json();
        } catch (e) {
          // 如果失败，尝试加载不带空格的文件名
          libraryResponse = await fetch('/file/comment.json');
          if (!libraryResponse.ok) throw new Error('加载评论词库失败');
          libraryData = await libraryResponse.json();
        }
        if (Array.isArray(libraryData)) {
          setCommentLibrary(libraryData);
          console.log('[Middle Comment Generator] 加载评论词库成功，共', libraryData.length, '条评论');
        } else {
          throw new Error('评论词库格式错误');
        }
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

  // 已使用的提示词索引
  const [usedPromptIndices, setUsedPromptIndices] = useState<number[]>([]);

  // 从词库随机获取提示词，移除[[]]标记
  const getRandomPrompt = (): string => {
    if (commentLibrary.length === 0) {
      // 如果词库为空，返回默认提示词
      return '真的假的？感谢分享';
    }
    
    // 生成一个随机索引，确保不重复
    let randomIndex: number;
    if (usedPromptIndices.length < commentLibrary.length) {
      // 如果还有未使用的提示词，随机选择一个
      do {
        randomIndex = Math.floor(Math.random() * commentLibrary.length);
      } while (usedPromptIndices.includes(randomIndex));
      // 添加到已使用索引列表
      setUsedPromptIndices(prev => [...prev, randomIndex]);
    } else {
      // 如果所有提示词都已使用，重置已使用列表并随机选择一个
      setUsedPromptIndices([]);
      randomIndex = Math.floor(Math.random() * commentLibrary.length);
    }
    
    let prompt = commentLibrary[randomIndex];
    // 移除[[]]标记
    prompt = prompt.replace(/\[\[@(.*?)\]\]/g, '@$1');
    // 应用文本处理
    prompt = processText(prompt);
    prompt = applyTextReplacements(prompt);
    console.log('[Middle Comment Generator] 选择的提示词索引:', randomIndex, '提示词:', prompt);
    return prompt;
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

  // 生成单条评论
  const generateSingleComment = useCallback(async (
    draft: string,
    index: number,
    previousComments: string[]
  ): Promise<string> => {
    try {
      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft: draft.trim() || `请生成一条关于${industry}的评论`,
          industry: industry || '无行业',
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
      console.error(`生成第${index + 1}条评论失败:`, error);
      throw error;
    }
  }, [industry, commentCount, sessionId]);

  // 批量生成评论
  const generateBatchComments = useCallback(async (
    drafts: string[]
  ): Promise<string[]> => {
    try {
      const response = await fetch('/api/generate-comment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drafts: drafts.map(d => d.trim() || `请生成一条关于${industry}的评论`),
          industry: industry || '无行业',
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
      console.error('批量生成失败:', error);
      throw error;
    }
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
        return drafts[i]?.trim() || getRandomPrompt();
      });
      
      if (generateMode === 'batch' && commentCount >= 3) {
        // 批量模式：一次请求生成所有
        onProgressUpdate?.(0, commentCount);
        
        const batchResults = await generateBatchComments(fullDrafts);
        results.push(...batchResults);
        
        onProgressUpdate?.(commentCount, commentCount);
      } else {
        // 单条模式：逐条生成，更可控
        for (let i = 0; i < commentCount; i++) {
          onProgressUpdate?.(i, commentCount);
          
          try {
            const comment = await generateSingleComment(
              fullDrafts[i],
              i,
              results // 传递已生成的结果作为历史
            );
            results.push(comment);
          } catch (error) {
            // 如果单条失败，使用原内容
            console.error(`第${i + 1}条生成失败，使用原内容`);
            results.push(fullDrafts[i] || '');
            
            // 重试计数
            setRetryCount(prev => prev + 1);
          }
          
          // 逐条生成时添加小延迟，避免限流
          if (i < commentCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      // 去重后返回
      const uniqueResults = results.map((r, idx) => {
        // 如果与前一条太相似，稍微修改
        if (idx > 0 && r === results[idx - 1]) {
          return r + '，';
        }
        return r;
      });
      
      // 处理@用户标识和文本替换
      const finalComments = uniqueResults.map((comment, i) => {
        let processedComment = processText(comment);
        processedComment = applyTextReplacements(processedComment);
        
        // 控制字数 - 对于包含@用户标识的最后一条评论，限制实际内容在10字以内
        if (atUser && i === commentCount - 1) {
          // 提取实际评论内容（排除@用户标识）
          const commentWithoutAt = processedComment.replace(new RegExp(`@${atUser}`, 'g'), '').trim();
          // 对于带有@用户标识的评论，限制实际内容在10字以内
          const lastCommentMaxWords = 10;
          console.log('[Middle Comment Generator] 最后一条评论字数限制:', lastCommentMaxWords);
          console.log('[Middle Comment Generator] 最后一条评论实际内容长度:', commentWithoutAt.length);
          
          if (commentWithoutAt.length > lastCommentMaxWords) {
            // 截取前lastCommentMaxWords个字符
            const trimmedContent = commentWithoutAt.slice(0, lastCommentMaxWords);
            console.log('[Middle Comment Generator] 截取后的内容:', trimmedContent);
            // 重新组合评论（保持@用户标识的位置）
            if (processedComment.startsWith(`@${atUser}`)) {
              // @用户标识在开头
              processedComment = `@${atUser} ${trimmedContent}`;
            } else if (processedComment.endsWith(`@${atUser}`)) {
              // @用户标识在结尾
              processedComment = `${trimmedContent} @${atUser}`;
            } else {
              // @用户标识在中间
              const parts = processedComment.split(new RegExp(`@${atUser}`));
              if (parts.length === 2) {
                processedComment = `${parts[0].trim()} @${atUser} ${trimmedContent}`;
              } else {
                //  fallback 情况
                processedComment = `${trimmedContent} @${atUser}`;
              }
            }
            console.log('[Middle Comment Generator] 处理后的最后一条评论:', processedComment);
          }
        } else {
          // 普通评论的字数控制，限制在20字以内
          if (processedComment.length > 20) {
            processedComment = processedComment.slice(0, 19) + '…';
          } else if (processedComment.length < ruleConfig.minWords) {
            processedComment = processedComment + ` ${randomPick(ruleConfig.vocabulary.结尾语气词)}`;
          }
        }
        
        // 只有最后一条评论才添加@用户标识，且用户输入中不包含@用户标识
        if (atUser && i === commentCount - 1 && !processedComment.includes(`@${atUser}`)) {
          processedComment = insertAtUser(processedComment, atUser);
        }
        
        return processedComment;
      });
      
      // 应用文本过滤，移除用户名关键词
      finalComments.forEach((comment, i) => {
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

      onCommentsGenerated(finalComments);
    } catch (err: any) {
      console.error('生成评论失败:', err);
      setError(err.message || '生成评论失败');
      
      // 如果失败，使用原内容
      const fallbackComments = userComments || [];
      onCommentsGenerated(fallbackComments);
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
      {/* 模式选择 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={generateMode === 'batch'}
              onChange={() => setGenerateMode('batch')}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">批量生成（更快）</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={generateMode === 'single'}
              onChange={() => setGenerateMode('single')}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">逐条生成（更准）</span>
          </label>
        </div>
        
        {retryCount > 0 && (
          <span className="text-xs text-orange-500">
            已重试{retryCount}次
          </span>
        )}
      </div>
      
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
            `AI生成${commentCount}条评论`
          )}
        </Button>
        
        {isLoading && (
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
          >
            取消
          </Button>
        )}
      </div>
      
      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>批量生成：一次性生成所有评论，速度快但风格变化较少</p>
        <p>逐条生成：逐条生成并参考历史，风格更多样，质量更高</p>
        <p>已生成评论会自动保存到历史，避免重复</p>
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}
