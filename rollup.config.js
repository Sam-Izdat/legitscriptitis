import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import strip from '@rollup/plugin-strip';
import legacy from '@rollup/plugin-legacy';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: 'src/main.js', // Your entry point file
  output: {
    file: 'dist/legitscriptitis.js', // Output file path
    format: 'umd', // UMD format
    name: 'legitscriptitis', // Global variable name
  },
  treeshake: false,
  plugins: [
    nodePolyfills(  ),
    resolve({
      browser: true
    }), // Resolves npm packages in node_modules
    commonjs(), // Converts CommonJS modules to ES6
    strip({
      include: 'src/*.(js|ts)',
      labels: ['dbg']
    }),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') }
      ]
    }),
  ]
}; 