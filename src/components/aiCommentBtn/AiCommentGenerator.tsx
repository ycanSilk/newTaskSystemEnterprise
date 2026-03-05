'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';

interface AiCommentGeneratorProps {
  onCommentsGenerated: (comments: string[]) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  commentCount: number;
  prompt?: string;
  userComments?: string[];
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
  isLoading,
  onLoadingChange,
  commentCount,
  prompt,
  userComments,
}: AiCommentGeneratorProps) {
  const [nickname, setNickname] = useState('');
  const [ruleConfig, setRuleConfig] = useState<CommentRule | null>(null);
  const [error, setError] = useState('');

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

  // 生成一条评论
  const generateSingleComment = (nick: string): string => {
    if (!ruleConfig) return '';

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

    // 字数控制
    if (comment.length > ruleConfig.maxWords) {
      comment = comment.slice(0, ruleConfig.maxWords - 1) + '…';
    } else if (comment.length < ruleConfig.minWords) {
      comment = comment.replace('，', ` ${randomPick(ruleConfig.vocabulary.感受)}，`);
    }

    return comment;
  };

  // 处理评论存储格式，使用[[]]标记固定昵称
  const formatCommentForStorage = (comment: string, nick: string): string => {
    if (!nick) return comment;
    return comment.replace(new RegExp(`${nick}`, 'g'), `[[${nick}]]`);
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
        // 使用用户提供的评论或生成草稿评论
        const draftComment = userComments?.[i]?.trim() || generateSingleComment(nickname);
        console.log(`[AI Comment Generator] 使用的评论 ${i + 1}:`, draftComment);
        
        // 构建详细的提示词
        const aiPrompt = prompt || `请润色以下评论，使其更加自然、口语化，保持原有的语义和情感。如果包含固定昵称，请确保昵称位置合理且保留。

评论内容：${draftComment}`;
        console.log(`[AI Comment Generator] 发送给AI的提示词 ${i + 1}:`, aiPrompt);
        
        // 调用AI润色
        const response = await fetch('/api/deepseek/polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            draft: draftComment,
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

        // 确保昵称位置随机且保留
        if (!polishedComment.includes(`${nickname}`)) {
          const posRand = Math.random();
          if (posRand < 0.3) {
            polishedComment = `${nickname} ${polishedComment}`;
          } else if (posRand < 0.7) {
            const parts = polishedComment.split('，');
            if (parts.length >= 2) {
              parts.splice(1, 0, ` ${nickname} `);
              polishedComment = parts.join('，');
            } else {
              polishedComment = `${polishedComment} ${nickname}`;
            }
          } else {
            polishedComment = `${polishedComment} ${nickname}`;
          }
        }

        comments.push(polishedComment);

        // 为存储准备评论，使用[[]]标记固定昵称
        const storageComment = formatCommentForStorage(polishedComment, nickname);
        storageComments.push(storageComment);
        console.log(`[AI Comment Generator] 格式化后的存储评论 ${i + 1}:`, storageComment);
        console.log(`[AI Comment Generator] 原始评论 ${i + 1}:`, draftComment);
        console.log('-------------------------分割线-------------------------')
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
