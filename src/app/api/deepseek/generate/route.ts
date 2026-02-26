import { NextResponse } from 'next/server';

const SENSITIVE_WORDS = ['违规词1', '违规词2']; // 按需扩展

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = 'sk-0f35e0a14ee34eeda82422c7ffb1c02e';
  const baseURL = 'https://api.deepseek.com';
  const model = 'deepseek-chat';

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个擅长创作短小精悍、生动有趣的抖音评论的助手。请确保每次生成的内容主题多样化，避免重复使用同一主题（例如不要总是生成龙年相关内容）。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9, // 提高随机性，让每次生成更丰富
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API 调用失败: ${error}`);
  }
  console.log('DeepSeek API 请求URL:', `${baseURL}/chat/completions`);
  console.log('DeepSeek API 请求:', prompt);
  console.log('DeepSeek API 响应:', response);
  const data = await response.json();
  console.log('DeepSeek API 响应:', data.choices[0].message.content);
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