/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  dev: {
    '/oauth/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
    '/system/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
    '/init/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
  },
  test: {
    '/oauth/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
    '/system/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
    '/init/': {
      target: 'http://127.0.0.1:18080',
      changeOrigin: true,
    },
  },
  pre: {
    '/oauth/': {
      target: 'http://your-pre-url',
      changeOrigin: true,
    },
    '/system/': {
      target: 'http://your-pre-url',
      changeOrigin: true,
    },
    '/init/': {
      target: 'http://your-pre-url',
      changeOrigin: true,
    },
  },
};
