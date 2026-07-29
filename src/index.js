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

const namedConfigItemName = (item) => (Array.isArray(item) ? item[0] : item);

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
    return this.#replaceConfig({
      ...this.#config,
      presets: [
        ...this.#config.presets.filter((preset) => namedConfigItemName(preset) !== name),
        [
          name,
          {
            ...options,
          },
        ],
      ],
    });
  }

  addPresetEnv(options = {}) {
    return this.#replaceConfig({
      ...this.#config,
      presets: [
        ...this.#config.presets.filter((preset) => namedConfigItemName(preset) !== presetEnv),
        [
          presetEnv,
          {
            modules: false,
            ...options,
          },
        ],
      ],
    });
  }

  addPresetTypeScript(options = {}) {
    return this.#addPreset(presetTypeScript, options);
  }

  addPresetReact(options = {}) {
    return this.#replaceConfig({
      ...this.#config,
      presets: [
        ...this.#config.presets.filter((preset) => namedConfigItemName(preset) !== presetReact),
        [
          presetReact,
          {
            development: this.#mode === 'development',
            runtime: 'automatic',
            ...options,
          },
        ],
      ],
    });
  }

  addReactCompilerPlugin(options = {}) {
    return this.#replaceConfig({
      ...this.#config,
      plugins: [
        [
          reactCompilerPlugin,
          {
            ...options,
          },
        ],
        ...this.#config.plugins.filter((plugin) => namedConfigItemName(plugin) !== reactCompilerPlugin),
      ],
    });
  }

  toConfig() {
    return {
      ...this.#config,
      plugins: [...this.#config.plugins],
      presets: [...this.#config.presets],
    };
  }
}
