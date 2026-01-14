export default {
  plugins: {
    'postcss-preset-env': {
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-media-queries': true,
      },
    },
    autoprefixer: {},
  },
};


