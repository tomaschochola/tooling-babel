/**
 * @file
 * @author Tomáš Chochola <tomaschochola@tomaschochola.cz>
 * @copyright © 2026 Tomáš Chochola <tomaschochola@tomaschochola.cz>
 *
 * @license CC-BY-ND-4.0
 *
 * @see {@link https://creativecommons.org/licenses/by-nd/4.0/} License
 * @see {@link https://github.com/tomaschochola} GitHub Profile
 * @see {@link https://github.com/sponsors/tomaschochola} GitHub Sponsors
 */

import { transformAsync } from '@babel/core';
import assert from 'node:assert/strict';
import test from 'node:test';
import { BabelConfigBuilder } from '../src/index.js';

const transform = async (builder, code, filename) => transformAsync(code, {
  ...builder.toConfig(),
  babelrc: false,
  configFile: false,
  filename,
});

test('empty builder exposes explicit readable-output defaults', () => {
  assert.deepEqual(new BabelConfigBuilder().toConfig(), {
    comments: true,
    compact: false,
    minified: false,
    plugins: [],
    presets: [],
  });
});

test('repeated presets update options without changing order or duplicating entries', () => {
  const config = new BabelConfigBuilder()
    .addPresetEnv({ bugfixes: false })
    .addPresetTypeScript()
    .addPresetEnv({ bugfixes: true })
    .toConfig();

  assert.equal(config.presets.length, 2);
  assert.equal(config.presets[0][1].bugfixes, true);
  assert.equal(config.presets[1][1].onlyRemoveTypeImports, true);
});

test('returned top-level preset and plugin options cannot mutate builder state', () => {
  const builder = new BabelConfigBuilder()
    .addPresetEnv({ bugfixes: true })
    .addReactCompilerPlugin({ target: '17' })
    .addReactCompilerPlugin({ target: '19' });

  const config = builder.toConfig();

  assert.equal(config.plugins.length, 1);
  config.presets[0][1].bugfixes = false;
  config.plugins[0][1].target = '17';

  const freshConfig = builder.toConfig();

  assert.equal(freshConfig.presets[0][1].bugfixes, true);
  assert.equal(freshConfig.plugins[0][1].target, '19');
});

test('environment preset preserves syntax supported by the declared browser baseline', async () => {
  const result = await transform(
    new BabelConfigBuilder().addPresetEnv({ targets: { chrome: '136' } }),
    'export const value = input?.value ?? 0;\n',
    'sample.js',
  );

  assert.match(result.code, /input\?\.value \?\? 0/u);
  assert.match(result.code, /export const value/u);
});

test('TypeScript preset removes explicit type syntax and type-only imports', async () => {
  const result = await transform(
    new BabelConfigBuilder().addPresetTypeScript(),
    'import type { Value } from \'./types.js\';\nexport const value: Value = 42;\n',
    'sample.ts',
  );

  assert.doesNotMatch(result.code, /import/u);
  assert.doesNotMatch(result.code, /: Value/u);
  assert.match(result.code, /export const value = 42/u);
});

test('React preset selects production and development automatic runtimes', async () => {
  const production = await transform(
    new BabelConfigBuilder().addPresetReact(),
    'export const App = () => <main>content</main>;\n',
    'sample.jsx',
  );

  const development = await transform(
    new BabelConfigBuilder({ mode: 'development' }).addPresetReact(),
    'export const App = () => <main>content</main>;\n',
    'sample.jsx',
  );

  assert.match(production.code, /react\/jsx-runtime/u);
  assert.doesNotMatch(production.code, /jsxDEV/u);
  assert.match(development.code, /react\/jsx-dev-runtime/u);
  assert.match(development.code, /jsxDEV/u);
});

test('React compiler transforms a typed component through the complete pipeline', async () => {
  const result = await transform(
    new BabelConfigBuilder()
      .addPresetEnv({ targets: { chrome: '136' } })
      .addPresetTypeScript()
      .addPresetReact()
      .addReactCompilerPlugin(),
    'export function App({ name }: { name: string }) { return <main>{name}</main>; }\n',
    'sample.tsx',
  );

  assert.match(result.code, /react\/compiler-runtime/u);
  assert.match(result.code, /react\/jsx-runtime/u);
  assert.doesNotMatch(result.code, /: string/u);
});

test('all copy templates resolve to non-empty Babel configurations', async () => {
  for (const template of ['base', 'typescript', 'typescript_react']) {
    const { default: config } = await import(`../templates/${template}.js?test=${template}`);

    assert.equal(Array.isArray(config.presets), true);
    assert.equal(config.presets.length > 0, true);
  }
});
