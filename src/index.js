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
        ...this.#config.presets.filter((preset) => namedConfigItemName(preset) !== '@babel/preset-env'),
        [
          '@babel/preset-env',
          {
            bugfixes: true,
            corejs: {
              proposals: false,
              version: '3.49.0',
            },
            modules: false,
            useBuiltIns: 'entry',
            ...options,
          },
        ],
      ],
    });
  }

  addPresetTypeScript(options = {}) {
    return this.#addPreset('@babel/preset-typescript', options);
  }

  addPresetReact(options = {}) {
    return this.#replaceConfig({
      ...this.#config,
      presets: [
        ...this.#config.presets.filter((preset) => namedConfigItemName(preset) !== '@babel/preset-react'),
        [
          '@babel/preset-react',
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
          'babel-plugin-react-compiler',
          {
            ...options,
          },
        ],
        ...this.#config.plugins.filter((plugin) => namedConfigItemName(plugin) !== 'babel-plugin-react-compiler'),
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
