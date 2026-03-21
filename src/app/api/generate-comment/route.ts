import { NextResponse } from 'next/server';
import config from '../deepseek/config.json';

const SENSITIVE_WORDS = ['违规词1', '违规词2'];

// 会话缓存管理
interface SessionCache {
  comments: string[];  // 已生成的评论
  lastAccess: number;  // 最后访问时间
}

class CommentCacheManager {
  private static instance: CommentCacheManager;
  private sessions: Map<string, SessionCache> = new Map();
  private readonly MAX_SESSIONS = 100; // 最大会话数
  private readonly SESSION_TTL = 30 * 60 * 1000; // 30分钟过期
  private readonly MAX_HISTORY = 20; // 最大历史记录数

  private constructor() {
    // 定期清理过期会话
    setInterval(() => this.cleanExpiredSessions(), 5 * 60 * 1000);
  }

  static getInstance(): CommentCacheManager {
    if (!CommentCacheManager.instance) {
      CommentCacheManager.instance = new CommentCacheManager();
    }
    return CommentCacheManager.instance;
  }

  // 获取会话缓存
  getSession(sessionId: string): SessionCache {
    const now = Date.now();
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // 如果会话数超限，删除最旧的会话
      if (this.sessions.size >= this.MAX_SESSIONS) {
        const oldestKey = Array.from(this.sessions.entries())
          .sort((a, b) => a[1].lastAccess - b[1].lastAccess)[0][0];
        this.sessions.delete(oldestKey);
      }
      
      session = { comments: [], lastAccess: now };
      this.sessions.set(sessionId, session);
    }
    
    session.lastAccess = now;
    return session;
  }

  // 添加评论到历史
  addComment(sessionId: string, comment: string) {
    const session = this.getSession(sessionId);
    session.comments.push(comment);
    
    // 限制历史记录数量
    if (session.comments.length > this.MAX_HISTORY) {
      session.comments = session.comments.slice(-this.MAX_HISTORY);
    }
  }

  // 获取最近的历史评论
  getRecentComments(sessionId: string, count: number = 5): string[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.comments.slice(-Math.min(count, this.MAX_HISTORY));
  }

  // 清理过期会话
  private cleanExpiredSessions() {
    const now = Date.now();
    // 使用Array.from()避免MapIterator迭代问题
    Array.from(this.sessions.entries()).forEach(([key, session]) => {
      if (now - session.lastAccess > this.SESSION_TTL) {
        this.sessions.delete(key);
      }
    });
  }
}

// 计算文本相似度
function calculateSimilarity(text1: string, text2: string): number {
  // 简单分词
  const words1 = new Set(text1.split(/[\s，。！？,.!?、]/).filter(w => w.length > 1));
  const words2 = new Set(text2.split(/[\s，。！？,.!?、]/).filter(w => w.length > 1));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// 检查是否与历史评论太相似
function isTooSimilar(newComment: string, historyComments: string[], threshold: number = 0.6): boolean {
  for (const history of historyComments) {
    const similarity = calculateSimilarity(newComment, history);
    if (similarity > threshold) {
      console.log(`相似度检测: ${similarity.toFixed(2)} - 新评论与历史评论相似`);
      return true;
    }
  }
  return false;
}

// 生成风格提示词
function getStyleHint(index: number, totalComments: number): string {
  const stylePool = [
    '用轻松活泼、带表情符号的语气',
    '用专业客观、分析性的语气',
    '用热情激动、感叹的语气',
    '用简洁有力、金句式的语气',
    '用疑问探讨、引发讨论的语气',
    '用幽默风趣、调侃的语气',
    '用真诚朴实、接地气的语气',
    '用文艺优美、诗意的语气',
    '用夸张搞笑、网络流行语的语气',
    '用理性客观、数据支撑的语气'
  ];
  
  // 根据索引循环使用不同风格
  return stylePool[index % stylePool.length];
}

// 清理字符串，确保它是有效的 JSON 字符串
function cleanString(str: string): string {
  // 移除不完整的 Unicode 转义序列
  str = str.replace(/\\u([0-9a-fA-F]{0,3})/g, '');
  // 移除控制字符
  str = str.replace(/[\x00-\x1F\x7F]/g, '');
  // 移除可能导致 JSON 解析错误的字符
  str = str.replace(/[\ud800-\udfff]/g, ''); // 移除代理对
  return str;
}

// 构建提示词
function buildPrompt(
  draft: string,
  industry: string,
  commentIndex: number,
  totalComments: number,
  recentHistory: string[]
): string {
  // 清理草稿内容
  const cleanedDraft = cleanString(draft);
  
  let prompt = `请润色以下评论，使其更加自然、口语化，保持原有的语义和情感，生成的评论要和原评论差异在80%以上。\n\n`;
  
  // 添加行业要求
  if (industry && industry !== '无行业') {
    prompt += `请确保评论内容与${industry}行业高度相关。\n\n`;
  }
  
  // 添加风格要求
  const styleHint = getStyleHint(commentIndex, totalComments);
  prompt += `要求：${styleHint}，使用不同的句式结构和表达方式。\n`;
  
  // 添加字数限制要求
  // 检查是否包含@用户标识或固定昵称
  const hasAtUser = cleanedDraft.includes('@');
  const hasNickname = cleanedDraft.includes('[[@') || cleanedDraft.includes(']]');
  
  if (hasAtUser || hasNickname) {
    // 带有@用户标识或固定昵称的评论，生成内容（不包含@用户标识和固定昵称）限制在10个文字以内
    prompt += `字数限制：请确保生成的评论内容（不包含@用户标识和固定昵称本身）不超过10个文字，保持简洁有力。\n`;
  } else {
    // 普通评论，生成内容限制在20个文字以内
    prompt += `字数限制：请确保生成的评论内容不超过20个文字，保持简洁有力。\n`;
  }
  
  // 添加历史评论提醒（避免重复）
  if (recentHistory.length > 0) {
    prompt += `避免与以下已生成的评论风格雷同：\n`;
    recentHistory.forEach((comment, idx) => {
      const cleanedComment = cleanString(comment);
      prompt += `历史评论${idx + 1}：${cleanedComment.substring(0, 30)}...\n`;
    });
    prompt += `\n`;
  }
  
  // 添加原评论内容
  prompt += `评论内容：${cleanedDraft}\n`;
  prompt += `不要生成包含用户名、人名、姓名、抖音名称相关的评论，直接返回生成的评论。`;
  
  return prompt;
}

async function callDeepSeek(
  prompt: string,
  temperature: number = 1.3
): Promise<string> {
  const apiKey = config.apiKey;
  const baseURL = config.baseURL;
  const model = config.model;

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: '你是一个擅长润色抖音评论的助手。使评论更有趣、更吸引人，可以适当添加表情符号，但保持原意不变。直接返回生成的评论，不要包含任何解释。每次生成的评论必须在风格、用词、句式上有明显差异，避免重复。',
      },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: 60, // 限制输出长度，节省token
    top_p: 0.95,
    frequency_penalty: 0.6, // 降低重复词频率
    presence_penalty: 0.6,  // 鼓励谈论新内容
  };
  
  console.log('DeepSeek API 请求体:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API调用失败：${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('DeepSeek API 生成内容:', content);
  
  return content;
}

function containsSensitiveWords(text: string): boolean {
  return SENSITIVE_WORDS.some((word) => text.includes(word));
}

export async function POST(request: Request) {
  try {
    const { 
      draft, 
      industry = '无行业',
      commentIndex = 0,
      totalComments = 1,
      sessionId = 'default',
      previousComments = []
    } = await request.json();
    
    console.log('收到请求:', { draft, industry, commentIndex, totalComments, sessionId });
    
    if (!draft) {
      return NextResponse.json({ error: '草稿不能为空' }, { status: 400 });
    }

    // 获取会话缓存管理器
    const cacheManager = CommentCacheManager.getInstance();
    
    // 获取历史评论（优先使用传入的，否则从缓存获取）
    const historyComments = previousComments.length > 0 
      ? previousComments 
      : cacheManager.getRecentComments(sessionId, 5);
    
    // 构建提示词
    const prompt = buildPrompt(draft, industry, commentIndex, totalComments, historyComments);
    
    console.log('生成的提示词:', prompt);

    // 生成评论，最多重试2次
    let polished = '';
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      // 每次重试提高temperature增加多样性
      const temperature = 1.3 + (attempts * 0.1);
      polished = await callDeepSeek(prompt, temperature);
      
      // 检查敏感词
      if (containsSensitiveWords(polished)) {
        attempts++;
        continue;
      }
      
      // 检查是否与历史评论太相似（除了第一条）
      if (historyComments.length > 0 && isTooSimilar(polished, historyComments)) {
        console.log(`第${attempts + 1}次生成内容与历史相似，重试中...`);
        attempts++;
        continue;
      }
      
      // 生成成功
      break;
    }
    
    // 如果重试后仍然相似，接受结果但记录日志
    if (attempts >= maxAttempts) {
      console.log('达到最大重试次数，接受当前生成结果');
    }

    // 保存到会话缓存
    cacheManager.addComment(sessionId, polished);

    return NextResponse.json({ 
      polished,
      attempts: attempts + 1,
      fromCache: false 
    });
    
  } catch (error: any) {
    console.error('生成评论失败:', error);
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 批量生成评论的接口
export async function PUT(request: Request) {
  try {
    const { 
      drafts,
      industry = '无行业',
      sessionId = 'default'
    } = await request.json();
    
    if (!drafts || !Array.isArray(drafts) || drafts.length === 0) {
      return NextResponse.json({ error: '草稿列表不能为空' }, { status: 400 });
    }

    const cacheManager = CommentCacheManager.getInstance();
    const results: string[] = [];
    const batchSize = 3; // 每批处理3条，避免历史过长
    
    for (let i = 0; i < drafts.length; i += batchSize) {
      const batch = drafts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (draft, index) => {
        const globalIndex = i + index;
        
        // 获取当前已生成的结果作为历史
        const currentHistory = [...results, ...cacheManager.getRecentComments(sessionId, 3)];
        
        const prompt = buildPrompt(
          draft, 
          industry, 
          globalIndex, 
          drafts.length,
          currentHistory.slice(-5) // 只取最近5条
        );
        
        const comment = await callDeepSeek(prompt);
        
        // 保存到缓存
        cacheManager.addComment(sessionId, comment);
        
        return comment;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // 批次间稍作延迟，避免限流
      if (i + batchSize < drafts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return NextResponse.json({ comments: results });
    
  } catch (error: any) {
    console.error('批量生成评论失败:', error);
    return NextResponse.json(
      { error: error.message || '批量生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}