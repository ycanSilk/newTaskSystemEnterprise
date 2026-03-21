import { NextResponse } from 'next/server';
import config from '../config.json';
const SENSITIVE_WORDS = ['违规词1', '违规词2'];

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
          '你是一个擅长润色抖音评论的助手。使评论更有趣、更吸引人，可以添加表情符号，但保持原意不变。直接返回生成的评论，不要包含任何解释。每次生成的评论不能重复，不能与之前生成的评论相同。生成评论符合要求的行业的评论',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 1,
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
    console.log('DeepSeek API 响应状态:', response.status);
    const error = await response.text();
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
    const { draft, prompt: frontendPrompt } = await request.json();
    console.log('前端页面传递收到的草稿:', draft);
    console.log('前端页面传递收到的提示词:', frontendPrompt);
    if (!draft) {
      return NextResponse.json({ error: '草稿不能为空' }, { status: 400 });
    }

    // 优先使用前端传递的提示词，否则使用默认提示词
    const prompt = frontendPrompt || `润色这条抖音评论：${draft}`;

    let polished = await callDeepSeek(prompt);

    if (containsSensitiveWords(polished)) {
      return NextResponse.json(
        { error: '润色后的内容包含违规词汇，请修改草稿后重试' },
        { status: 400 }
      );
    }

    return NextResponse.json({ polished });
  } catch (error: any) {
    console.error('润色评论失败:', error);
    return NextResponse.json(
      { error: error.message || '润色失败，请稍后重试' },
      { status: 500 }
    );
  }
}