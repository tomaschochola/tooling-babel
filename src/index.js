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

export class Babel {
  config;

  constructor() {
    this.config = {
      comments: true,
      compact: false,
      minified: false,
      plugins: [],
      presets: [],
    };
  }

  get BABEL_ENV() {
    return process.env.BABEL_ENV;
  }

  get NODE_ENV() {
    return process.env.NODE_ENV;
  }

  get mode() {
    return this.BABEL_ENV ?? this.NODE_ENV ?? 'production';
  }

  replaceConfig(config) {
    this.config = { ...config };

    return this;
  }

  presetEnv(options = {}) {
    return this.replaceConfig({
      ...this.config,
      presets: [
        ...this.config.presets,
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

  presetTypeScript(options = {}) {
    return this.replaceConfig({
      ...this.config,
      presets: [
        ...this.config.presets,
        [
          '@babel/preset-typescript',
          {
            ...options,
          },
        ],
      ],
    });
  }

  presetReact(options = {}) {
    return this.replaceConfig({
      ...this.config,
      presets: [
        ...this.config.presets,
        [
          '@babel/preset-react',
          {
            development: this.mode === 'development',
            runtime: 'automatic',
            ...options,
          },
        ],
      ],
    });
  }

  pluginReactCompiler(options = {}) {
    return this.replaceConfig({
      ...this.config,
      plugins: [
        [
          'babel-plugin-react-compiler',
          {
            ...options,
          },
        ],
        ...this.config.plugins,
      ],
    });
  }

  buildConfig() {
    return { ...this.config };
  }
}
