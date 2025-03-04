module.exports = {
  presets: [[require.resolve('@babel/preset-react'), { runtime: 'automatic' }]],

  env: {
    production: {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: 'auto',
            targets: { browsers: ['last 1 Chrome version'] },
          },
        ],
      ],
    },

    development: {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: 'auto',
            targets: { browsers: ['last 1 Chrome version'] },
          },
        ],
      ],
      plugins: [require.resolve('react-refresh/babel')],
    },

    test: {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: 'auto',
            targets: { node: 'current' },
          },
        ],
      ],
    },
  },
};
