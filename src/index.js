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

export class BabelStack {
  config;

  constructor() {
    this.config = {
      comments: true,
      compact: this.mode === 'production',
      minified: this.mode === 'production',
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

  replace(config) {
    this.config = { ...config };

    return this;
  }

  env(options = {}) {
    return this.replace({
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

  typescript(options = {}) {
    return this.replace({
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

  react(options = {}) {
    return this.replace({
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

  reactCompiler(options = {}) {
    return this.replace({
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

  build() {
    return { ...this.config };
  }
}
