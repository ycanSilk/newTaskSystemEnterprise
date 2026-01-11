module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 生产环境下启用CSS压缩和优化
    'cssnano': process.env.NODE_ENV === 'production' ? {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
          minifySelectors: true,
          minifyGradients: true,
          mergeLonghand: true,
          reduceIdents: true,
          zindex: true,
        },
      ],
    } : false,
  },
}