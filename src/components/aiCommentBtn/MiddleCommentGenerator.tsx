'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';

interface MiddleCommentGeneratorProps {
  onCommentsGenerated: (comments: string[]) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  commentCount: number;
  atUser?: string;
  userComments?: string[];
}

interface CommentRule {
  description: string;
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
    中间连接词: string[];
    结果感受词: string[];
    结尾语气词: string[];
  };
}

export default function MiddleCommentGenerator({
  onCommentsGenerated,
  isLoading,
  onLoadingChange,
  commentCount,
  atUser,
  userComments,
}: MiddleCommentGeneratorProps) {
  const [ruleConfig, setRuleConfig] = useState<CommentRule | null>(null);
  const [commentLibrary, setCommentLibrary] = useState<string[]>([]);
  const [error, setError] = useState('');

  // 加载规则配置和评论词库
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        // 加载规则配置
        const ruleResponse = await fetch('/rules/middle_comment.json');
        if (!ruleResponse.ok) throw new Error('加载规则配置失败');
        const ruleData = await ruleResponse.json();
        setRuleConfig(ruleData.rules);

        // 加载评论词库
        const libraryResponse = await fetch('/file/comment .json');
        if (!libraryResponse.ok) throw new Error('加载评论词库失败');
        const libraryData = await libraryResponse.json();
        if (Array.isArray(libraryData)) {
          setCommentLibrary(libraryData);
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

  // 从词库随机获取提示词，移除[[]]标记
  const getRandomPrompt = (): string => {
    if (commentLibrary.length === 0) {
      // 如果词库为空，返回默认提示词
      return '真的假的？感谢分享';
    }
    let prompt = randomPick(commentLibrary);
    // 移除[[]]标记
    prompt = prompt.replace(/\[\[@(.*?)\]\]/g, '@$1');
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

  // 生成评论
  const handleGenerateComments = async () => {
    if (!ruleConfig) {
      setError('规则配置未加载');
      return;
    }

    try {
      onLoadingChange(true);
      setError('');

      const comments: string[] = [];
      const storageComments: string[] = [];

      for (let i = 0; i < commentCount; i++) {
        // 优先使用用户输入的评论，否则从词库随机获取提示词
        const draftPrompt = userComments?.[i]?.trim() || getRandomPrompt();
        console.log(`[Middle Comment Generator] 使用的提示词 ${i + 1}:`, draftPrompt);
        console.log(`[Middle Comment Generator] 用户输入的评论 ${i + 1}:`, userComments?.[i] || '无');
        
        // 检查用户输入是否已经包含@用户标识
        const hasAtUser = draftPrompt.includes('@');
        
        // 构建详细的提示词
        const aiPrompt = `请润色以下评论，使其更加自然、口语化，保持原有的语义和情感。控制字数在7-17字之间，使用口语化表达，模拟真实用户交流语气。${atUser && !hasAtUser ? `如果需要添加@用户标识，请按照规则随机分布在开头40%、中间40%、结尾20%的位置。` : ''}

评论内容：${draftPrompt}`;
        console.log(`[Middle Comment Generator] 发送给AI的提示词 ${i + 1}:`, aiPrompt);
        
        // 调用AI润色
        const response = await fetch('/api/deepseek/polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            draft: draftPrompt,
            prompt: aiPrompt,
            variation: i + 1
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '生成失败');
        }

        const result = await response.json();
        let polishedComment = result.polished || '';

        // 如果 API 返回空值，使用默认生成的评论
        if (!polishedComment) {
          const startWord = randomPick(ruleConfig.vocabulary.开头语);
          const middleWord = randomPick(ruleConfig.vocabulary.中间连接词);
          const feelingWord = randomPick(ruleConfig.vocabulary.结果感受词);
          const endingWord = randomPick(ruleConfig.vocabulary.结尾语气词);
          polishedComment = `${startWord}${middleWord}，${feelingWord}，${endingWord}`;
        }

        // 控制字数
        if (polishedComment.length > ruleConfig.maxWords) {
          polishedComment = polishedComment.slice(0, ruleConfig.maxWords - 1) + '…';
        } else if (polishedComment.length < ruleConfig.minWords) {
          polishedComment = polishedComment + ` ${randomPick(ruleConfig.vocabulary.结尾语气词)}`;
        }

        // 只有最后一条评论才添加@用户标识，且用户输入中不包含@用户标识
        let storageComment = polishedComment;
        if (atUser && i === commentCount - 1 && !hasAtUser) {
          polishedComment = insertAtUser(polishedComment, atUser);
          storageComment = formatCommentForStorage(polishedComment, atUser);
        } else if (atUser && i === commentCount - 1 && hasAtUser) {
          // 如果用户输入已经包含@用户标识，直接格式化存储
          storageComment = formatCommentForStorage(polishedComment, atUser);
        }

        comments.push(polishedComment);
        storageComments.push(storageComment);
      }

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

      onCommentsGenerated(comments);
    } catch (err: any) {
      console.error('生成评论失败:', err);
      setError(err.message || '生成评论失败');
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI生成评论按钮 */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerateComments}
          disabled={isLoading || !ruleConfig}
          className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1 max-w-md"
        >
          {isLoading ? '生成中...' : 'AI生成评论'}
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
