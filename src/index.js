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

import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';
import presetTypeScript from '@babel/preset-typescript';
import reactCompiler from 'babel-plugin-react-compiler';

const reactCompilerPlugin = reactCompiler.default ?? reactCompiler;

const configItemName = ([name]) => name;

export class BabelConfigBuilder {
  #config;
  #mode;

  constructor({ mode = 'production' } = {}) {
    this.#mode = mode;
    this.#config = {
      comments: true,
      compact: false,
      minified: false,
      plugins: [],
      presets: [],
    };
  }

  #replaceConfig(config) {
    this.#config = { ...config };

    return this;
  }

  #addPreset(name, options = {}) {
    const preset = [
      name,
      {
        ...options,
      },
    ];

    const existingIndex = this.#config.presets.findIndex((item) => configItemName(item) === name);

    return this.#replaceConfig({
      ...this.#config,
      presets: existingIndex === -1
        ? [...this.#config.presets, preset]
        : this.#config.presets.map((item, index) => (index === existingIndex ? preset : item)),
    });
  }

  addPresetEnv(options = {}) {
    return this.#addPreset(presetEnv, options);
  }

  addPresetTypeScript(options = {}) {
    return this.#addPreset(presetTypeScript, {
      onlyRemoveTypeImports: true,
      ...options,
    });
  }

  addPresetReact(options = {}) {
    return this.#addPreset(presetReact, {
      development: this.#mode === 'development',
      runtime: 'automatic',
      ...options,
    });
  }

  addReactCompilerPlugin(options = {}) {
    const plugin = [
      reactCompilerPlugin,
      {
        ...options,
      },
    ];

    const existingIndex = this.#config.plugins.findIndex((item) => configItemName(item) === reactCompilerPlugin);

    return this.#replaceConfig({
      ...this.#config,
      plugins: existingIndex === -1
        ? [plugin, ...this.#config.plugins]
        : this.#config.plugins.map((item, index) => (index === existingIndex ? plugin : item)),
    });
  }

  toConfig() {
    return {
      ...this.#config,
      plugins: this.#config.plugins.map(([plugin, options]) => [plugin, { ...options }]),
      presets: this.#config.presets.map(([preset, options]) => [preset, { ...options }]),
    };
  }
}
