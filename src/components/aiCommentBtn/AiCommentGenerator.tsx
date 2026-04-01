'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Input } from '@/components/ui';

interface AiCommentGeneratorProps {
  onCommentsGenerated: (comments: string[]) => void;
  onProgressUpdate?: (current: number, total: number) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  commentCount: number;
  userComments?: string[];
  industry?: string;
  sessionId?: string;
}

interface CommentRule {
  description: string;
  fixedNickname: string;
  commentCount: number;
  minWords: number;
  maxWords: number;
  atPositionDist: {
    开头: number;
    中间: number;
    结尾: number;
  };
  homophoneReplace: Record<string, string>;
  forbiddenPatterns: string[];
  vocabulary: {
    开头语: string[];
    中间连接: string[];
    感受: string[];
    结尾语气: string[];
  };
  examples: string[];
}

export default function AiCommentGenerator({
  onCommentsGenerated,
  onProgressUpdate,
  isLoading,
  onLoadingChange,
  commentCount,
  userComments,
  industry,
  sessionId = 'default'
}: AiCommentGeneratorProps) {
  const [nickname, setNickname] = useState('');
  const [ruleConfig, setRuleConfig] = useState<CommentRule | null>(null);
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

  // 加载规则配置
  useEffect(() => {
    const loadRuleConfig = async () => {
      try {
        const response = await fetch('/rules/atUser.json');
        if (!response.ok) throw new Error('加载规则配置失败');
        const data = await response.json();
        setRuleConfig(data.rules);
        setNickname(data.rules.fixedNickname);
      } catch (err) {
        console.error('加载规则配置失败:', err);
        setError('加载规则配置失败');
      }
    };

    loadRuleConfig();
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

  // 应用文本处理
  const processText = (text: string): string => {
    // 移除[[@...]]格式的字符
    let processedText = text.replace(/\[\[@[^\]]+\]\]/g, '');
    // 移除×××占位符
    processedText = processedText.replace(/×××/g, '');
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
    console.log(`[AI Comment Generator] 开始执行替换逻辑，原始文本:`, text);
    
    // 处理全角和半角字符
    for (const [orig, repl] of Object.entries(replaceRules)) {
      // 创建包含全角和半角的正则表达式
      const regex = new RegExp(orig, 'g');
      const beforeReplace = replacedText;
      replacedText = replacedText.replace(regex, repl);
      if (beforeReplace !== replacedText) {
        console.log(`[AI Comment Generator] 执行替换: ${orig} → ${repl}`);
        console.log(`[AI Comment Generator] 替换前:`, beforeReplace);
        console.log(`[AI Comment Generator] 替换后:`, replacedText);
      }
    }
    
    console.log(`[AI Comment Generator] 替换逻辑执行完成，最终文本:`, replacedText);
    return replacedText;
  };

  // 生成草稿评论
  const generateDraftComment = (nick: string): string => {
    if (!ruleConfig) return '';

    // 随机选择词汇，确保每次都不一样
    const startWord = randomPick(ruleConfig.vocabulary.开头语);
    const middleWord = randomPick(ruleConfig.vocabulary.中间连接);
    const feelingWord = randomPick(ruleConfig.vocabulary.感受);
    const endingWord = randomPick(ruleConfig.vocabulary.结尾语气);

    // 构建裸评论
    let comment = `${startWord}${middleWord}，${feelingWord}，${endingWord}`;

    // 如果有昵称，随机添加到不同位置
    if (nick.trim()) {
      const posRand = Math.random();
      let atPos: '开头' | '中间' | '结尾' = '开头';
      if (posRand < ruleConfig.atPositionDist.开头) {
        atPos = '开头';
        comment = `${nick} ${comment}`;
      } else if (posRand < ruleConfig.atPositionDist.开头 + ruleConfig.atPositionDist.中间) {
        atPos = '中间';
        const parts = comment.split('，');
        if (parts.length >= 2) {
          parts.splice(1, 0, ` ${nick} `);
          comment = parts.join('，');
        } else {
          comment = `试了${nick} 的方法，${feelingWord}，${endingWord}`;
        }
      } else {
        atPos = '结尾';
        comment = `${comment}${nick}`;
      }
    }

    // 处理空格和同音替换
    comment = comment.replace(/\s+/g, ' ').trim();
    comment = applyHomophone(comment);

    // 检查禁止词
    if (containsForbidden(comment)) {
      const feelingWord2 = randomPick(
        ruleConfig.vocabulary.感受.filter(f => !ruleConfig.forbiddenPatterns.some(b => f.includes(b)))
      );
      const endingWord2 = randomPick(ruleConfig.vocabulary.结尾语气);
      let bare2 = `${startWord}${middleWord}，${feelingWord2}，${endingWord2}`;
      
      if (nick.trim()) {
        const posRand = Math.random();
        if (posRand < ruleConfig.atPositionDist.开头) {
          comment = `${nick} ${bare2}`;
        } else if (posRand < ruleConfig.atPositionDist.开头 + ruleConfig.atPositionDist.中间) {
          const parts = bare2.split('，');
          parts.splice(1, 0, ` ${nick} `);
          comment = parts.join('，');
        } else {
          comment = `${bare2}${nick}`;
        }
      } else {
        comment = bare2;
      }
      comment = applyHomophone(comment);
    }

    // 字数控制 - 对于包含固定昵称的评论，限制实际内容在10字以内
    if (nick.trim()) {
      // 提取实际评论内容（排除固定昵称）
      const commentWithoutNick = comment.replace(new RegExp(`${nick}`, 'g'), '').trim();
      if (commentWithoutNick.length > 10) {
        // 截取前10个字符
        const trimmedContent = commentWithoutNick.slice(0, 10);
        // 重新组合评论（保持昵称的位置）
        if (comment.startsWith(`${nick}`)) {
          // 昵称在开头
          comment = `${nick} ${trimmedContent}`;
        } else if (comment.endsWith(`${nick}`)) {
          // 昵称在结尾
          comment = `${trimmedContent} ${nick}`;
        } else {
          // 昵称在中间
          const parts = comment.split(new RegExp(`${nick}`));
          if (parts.length === 2) {
            comment = `${parts[0].trim()} ${nick} ${trimmedContent}`;
          } else {
            // fallback 情况
            comment = `${trimmedContent} ${nick}`;
          }
        }
      }
    } else {
      // 普通评论的字数控制，限制在20字以内
      if (comment.length > 20) {
        comment = comment.slice(0, 19) + '…';
      } else if (comment.length < ruleConfig.minWords) {
        comment = comment.replace('，', ` ${randomPick(ruleConfig.vocabulary.感受)}，`);
      }
    }

    // 应用文本处理
    comment = processText(comment);
    comment = applyTextReplacements(comment);

    console.log('[AI Comment Generator] 生成的草稿评论:', comment);
    return comment;
  };

  // 处理评论存储格式，使用[[]]标记固定昵称
  const formatCommentForStorage = (comment: string, nick: string): string => {
    if (!nick) return comment;
    return comment.replace(new RegExp(`${nick}`, 'g'), `[[${nick}]]`);
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
          industry: industry || '无',
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
          industry: industry || '无',
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
        return drafts[i]?.trim() || generateDraftComment(nickname);
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
      
      // 处理昵称和文本替换
      const finalComments = uniqueResults.map(comment => {
        let processedComment = processText(comment);
        processedComment = applyTextReplacements(processedComment);
        
        // 确保昵称位置随机且保留
        if (!processedComment.includes(`${nickname}`)) {
          const posRand = Math.random();
          if (posRand < 0.3) {
            processedComment = `${nickname} ${processedComment}`;
          } else if (posRand < 0.7) {
            const parts = processedComment.split('，');
            if (parts.length >= 2) {
              parts.splice(1, 0, ` ${nickname} `);
              processedComment = parts.join('，');
            } else {
              processedComment = `${processedComment} ${nickname}`;
            }
          } else {
            processedComment = `${processedComment} ${nickname}`;
          }
        }
        
        return processedComment;
      });
      
      // 应用文本过滤，移除用户名关键词
      const filteredComments = finalComments.map(comment => {
        const filteredComment = filterUsernames(comment);
        storageComments.push(formatCommentForStorage(filteredComment, nickname));
        return comment;
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

      onCommentsGenerated(filteredComments);
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
      {/* 固定昵称输入 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          固定昵称
        </label>
        <div className="flex items-center space-x-2">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入固定昵称"
            className="flex-1"
          />
        </div>
      </div>

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
