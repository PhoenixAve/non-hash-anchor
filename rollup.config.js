import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve'; // 你的包用到第三方npm包
const typescript = require('rollup-plugin-typescript2');
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import {
  cleandir
} from 'rollup-plugin-cleandir';

import {
  terser
} from 'rollup-plugin-terser'; // 压缩，可以判断模式，开发模式不加入到plugins

const outputConfig = ['umd', 'esm'].map(format => ({
  file: `lib/index${format === 'umd' ? '' : '.' + format}.js`,
  format,
  name: 'Anchor',
}))

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  output: outputConfig,
  watch: {
    include: 'src/**'
  },
  plugins: [
    json(),
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
    }),
    //自动清除文件夹
    cleandir('lib'),
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    terser(),
    serve({
      openPage: '/demo/index.html',
      contentBase: '', //服务器启动的文件夹，默认是项目根目录，需要在该文件下创建index.html
      port: 8020 //端口号，默认10001
    }),
    livereload({
      watch: 'lib',
      delay: 1000
    })
  ]
}

export default config
