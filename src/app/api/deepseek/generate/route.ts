import { NextResponse } from 'next/server';
import config from '../config.json';

const SENSITIVE_WORDS = ['违规词1', '违规词2']; // 按需扩展

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = config.apiKey;
  const baseURL = config.baseURL;
  const model = config.model;

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content:
          '你是一个擅长创作短小精悍、生动有趣的抖音评论的助手。请确保每次生成的内容主题多样化，每次生成的评论不能重复，不能与之前生成的评论相同，生成评论符合要求的的评论。',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 1, // 提高随机性，让每次生成更丰富
    max_tokens: 500,
  };
  
  console.log('DeepSeek API 请求URL:', `${baseURL}/chat/completions`);
  console.log('DeepSeek API 请求体:', requestBody);
  console.log('DeepSeek API 提示词:', prompt);
  
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });
  
  console.log('DeepSeek API 响应状态:', response.status);
  console.log('DeepSeek API 响应头:', response.headers);

  if (!response.ok) {
    const error = await response.text();
    console.log('DeepSeek API 错误响应:', error);
    throw new Error(`网络超时，请刷新页面重新生成评论，错误信息：${error}`);
  }
  
  const data = await response.json();
  console.log('DeepSeek API 响应数据:', data);
  console.log('DeepSeek API 生成内容:', data.choices[0].message.content);
  return data.choices[0].message.content;
}

function containsSensitiveWords(text: string): boolean {
  return SENSITIVE_WORDS.some((word) => text.includes(word));
}

export async function POST(request: Request) {
  try {
    // 只解析 maxLength，不再需要 keyword
    const { maxLength = 15 } = await request.json();

    // 极简提示词：让 AI 随机生成，覆盖十二生肖、星座、成语等多种类型
    const prompt = `生成一条随机的抖音评论，要合规，字数不超过${maxLength}字`;

    let comment = await callDeepSeek(prompt);

    if (containsSensitiveWords(comment)) {
      return NextResponse.json(
        { error: '生成的内容包含违规词汇，请重试' },
        { status: 400 }
      );
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('生成评论失败:', error);
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}