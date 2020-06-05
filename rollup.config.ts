import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import react from 'react';
import { RollupDirOptions } from 'rollup';
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import path from 'path';
const pkg = require('./package.json')

const libraryName = pkg.name;
const inputFiles=[`src/index.ts`, 'src/store-presentation.tsx'];
export default inputFiles.map(input => {
  const {name}=path.parse(input);
  return {
    input,
    output: [
      { file:name=='index' ?  pkg.main : pkg.main.replace('safe-hook',name), 
        name:name=='index' ? libraryName : name, format: 'umd', sourcemap: false },
      { file: name=='index'? pkg.module : pkg.module.replace('safe-hook',name),
       format: 'es', 
       sourcemap: false },
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    plugins: [
      // Allow json resolution
      json(),
      // Compile TypeScript files
      typescript({ useTsconfigDeclarationDir: true }),
      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs({
        include: 'node_modules/**',
        namedExports: {
          react: Object.keys(react),
        }
      }),
      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve(),

      // Resolve source maps to the original source
      sourceMaps(),
    ],
  }
}) //as RollupDirOptions;
