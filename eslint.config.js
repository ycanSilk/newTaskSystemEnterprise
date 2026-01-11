// 极简版 ESLint 配置 - 无插件依赖
// 只使用ESLint核心功能，避免所有外部依赖问题

export default [
  {
    // 定义要检查的文件范围
    files: ['**/*.{js,jsx}'],
    // 忽略不需要检查的文件和目录
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'out/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '**/*.ts',
      '**/*.tsx'
    ],
    // ESLint 9正确的配置格式
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        // ecmaFeatures必须放在parserOptions内
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    // 几乎禁用所有规则
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off'
    }
  },
  // 单独忽略TypeScript文件
  {
    ignores: ['**/*.ts', '**/*.tsx']
  }
];