'use client';

import { useState } from 'react';

export default function CommentTool() {
  // 生成相关
  const [maxLength, setMaxLength] = useState(10);
  const [generated, setGenerated] = useState('');

  // 润色相关
  const [draft, setDraft] = useState('');
  const [polished, setPolished] = useState('');

  // 通用状态
  const [loading, setLoading] = useState<'generate' | 'polish' | null>(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState<'generated' | 'polished' | null>(null);

  const handleGenerate = async () => {
    setLoading('generate');
    setError('');
    setGenerated('');

    try {
      const res = await fetch('/api/deepseek/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxLength }), // 只发送 maxLength
      });
      const data = await res.json();
      console.log('DeepSeek API 响应:', data);
      if (!res.ok) throw new Error(data.error || '生成失败');
      setGenerated(data.comment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handlePolish = async () => {
    if (!draft.trim()) {
      setError('请输入要润色的草稿');
      return;
    }
    setLoading('polish');
    setError('');
    setPolished('');

    try {
      const res = await fetch('/api/deepseek/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      console.log('DeepSeek API 响应:', data);
      if (!res.ok) throw new Error(data.error || '润色失败');
      setPolished(data.polished);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string, type: 'generated' | 'polished') => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>抖音评论助手</h2>

      {/* 一键生成区域（无需关键词） */}
      <div style={{ marginBottom: 30, border: '1px solid #eee', padding: 20 }}>
        <h3>一键生成评论</h3>
        <div style={{ marginBottom: 10 }}>
          <label>最大字数（1-10）：</label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
            style={{ width: 60, padding: 8 }}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading === 'generate'}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading === 'generate' ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'generate' ? '生成中...' : '🎲 随机生成一条'}
        </button>
        {generated && (
          <div style={{ marginTop: 15, padding: 10, background: '#f5f5f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <strong>生成结果：</strong>
              <button
                onClick={() => copyToClipboard(generated, 'generated')}
                style={{
                  padding: '5px 10px',
                  background: '#17a2b8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {copySuccess === 'generated' ? '已复制' : '复制'}
              </button>
            </div>
            <div>{generated}</div>
          </div>
        )}
      </div>

      {/* 润色区域（保持不变） */}
      <div style={{ border: '1px solid #eee', padding: 20 }}>
        <h3>评论润色</h3>
        <div style={{ marginBottom: 10 }}>
          <label>草稿：</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="输入你想润色的评论草稿"
            rows={3}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button
          onClick={handlePolish}
          disabled={loading === 'polish'}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading === 'polish' ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'polish' ? '润色中...' : '✨ 润色评论'}
        </button>
        {polished && (
          <div style={{ marginTop: 15, padding: 10, background: '#f5f5f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <strong>润色结果：</strong>
              <button
                onClick={() => copyToClipboard(polished, 'polished')}
                style={{
                  padding: '5px 10px',
                  background: '#17a2b8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                {copySuccess === 'polished' ? '已复制' : '复制'}
              </button>
            </div>
            <p>{polished}</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginTop: 15 }}>错误：{error}</div>
      )}
    </div>
  );
}