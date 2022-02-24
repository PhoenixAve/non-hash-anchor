import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve'; // 你的包用到第三方npm包
const typescript = require('rollup-plugin-typescript2');
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import del from 'rollup-plugin-delete';
import filesize from 'rollup-plugin-filesize'

import {
  terser
} from 'rollup-plugin-terser'; // 压缩，可以判断模式，开发模式不加入到plugins

const isProduction = process.env.NODE_ENV === 'production'

const outputConfig = ['umd', 'esm', 'commonjs'].map(format => ({
  file: `lib/index${format === 'umd' ? '' : '.' + format}.js`,
  format,
  name: 'Anchor',
}))

const getPlugins = () => {
  const plugins = [
    //自动清除lib文件夹
    del({
      targets: 'lib/*'
    }),
    json(),
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
    }),
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
  ]
  if (!isProduction) {
    plugins.push(serve({
        openPage: '/demo/index.html',
        contentBase: '', //服务器启动的文件夹，默认是项目根目录，需要在该文件下创建index.html
        port: 8020 //端口号，默认10001
      }),
      livereload({
        watch: 'lib',
        delay: 1000
      }))
  } else {
    plugins.push(filesize())
    plugins.push(terser())
  }
  return plugins
}

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: outputConfig,
  watch: {
    include: 'src/**'
  },
  external: isProduction ? ['lodash-es', 'resize-observer-polyfill'] : [],
  plugins: getPlugins(),
}

export default config
