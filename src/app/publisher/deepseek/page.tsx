import CommentGenerator from '@/components/deepseek/generate';

export default function DeepSeekPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            DeepSeek AI 抖音评论生成器
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            输入关键词，一键生成符合抖音风格的评论
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <CommentGenerator />
        </div>
      </div>
    </div>
  );
}