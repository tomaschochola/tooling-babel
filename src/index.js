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
import polyfillCoreJs from 'babel-plugin-polyfill-corejs3';
import reactCompiler from 'babel-plugin-react-compiler';

const coreJsPolyfillPlugin = polyfillCoreJs.default ?? polyfillCoreJs;
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
            presets: existingIndex === -1 ? [...this.#config.presets, preset] : this.#config.presets.map((item, index) => (index === existingIndex ? preset : item)),
        });
    }

    #addPlugin(name, options = {}, { prepend = false } = {}) {
        const plugin = [
            name,
            {
                ...options,
            },
        ];

        const existingIndex = this.#config.plugins.findIndex((item) => configItemName(item) === name);
        let plugins;

        if (existingIndex === -1) {
            plugins = prepend ? [plugin, ...this.#config.plugins] : [...this.#config.plugins, plugin];
        } else {
            plugins = this.#config.plugins.map((item, index) => (index === existingIndex ? plugin : item));
        }

        return this.#replaceConfig({
            ...this.#config,
            plugins,
        });
    }

    setTargets(targets) {
        let normalizedTargets = targets;

        if (Array.isArray(targets)) {
            normalizedTargets = [...targets];
        } else if (targets !== null && typeof targets === 'object') {
            normalizedTargets = { ...targets };
        }

        return this.#replaceConfig({
            ...this.#config,
            targets: normalizedTargets,
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

    addCoreJsEntryPolyfills() {
        return this.#addPlugin(coreJsPolyfillPlugin, {
            method: 'entry-global',
            version: '3.50',
        });
    }

    addReactCompilerPlugin(options = {}) {
        return this.#addPlugin(reactCompilerPlugin, options, { prepend: true });
    }

    toConfig() {
        const config = {
            ...this.#config,
            plugins: this.#config.plugins.map(([plugin, options]) => [plugin, { ...options }]),
            presets: this.#config.presets.map(([preset, options]) => [preset, { ...options }]),
        };

        if (Array.isArray(this.#config.targets)) {
            config.targets = [...this.#config.targets];
        } else if (typeof this.#config.targets === 'object') {
            config.targets = { ...this.#config.targets };
        }

        return config;
    }
}
