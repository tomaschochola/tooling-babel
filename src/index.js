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

const coreJsPolyfillPlugin = polyfillCoreJs;
const reactCompilerPlugin = reactCompiler;
const supportedModes = new Set(['development', 'production', 'test']);

const configItemName = ([name]) => name;

function isPlainObject(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

function normalizeOptions(options, name) {
    if (!isPlainObject(options)) {
        throw new TypeError(`${name} must be a plain object.`);
    }

    return { ...options };
}

function normalizeTargets(targets) {
    if (typeof targets === 'string' && targets.length > 0) {
        return targets;
    }

    if (Array.isArray(targets) && targets.length > 0 && targets.every((target) => typeof target === 'string' && target.length > 0)) {
        return [...targets];
    }

    if (isPlainObject(targets) && Object.keys(targets).length > 0) {
        return { ...targets };
    }

    throw new TypeError('targets must be a non-empty Browserslist query, query array, or target object.');
}

export class BabelConfigBuilder {
    #config;
    #mode;

    constructor(options = {}) {
        const normalizedOptions = normalizeOptions(options, 'options');
        const unknownOption = Object.keys(normalizedOptions).find((name) => name !== 'mode');

        if (unknownOption !== undefined) {
            throw new TypeError(`Unknown BabelConfigBuilder option: ${unknownOption}.`);
        }

        const mode = normalizedOptions.mode ?? 'production';

        if (!supportedModes.has(mode)) {
            throw new TypeError('mode must be development, production, or test.');
        }

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
        const normalizedOptions = normalizeOptions(options, 'preset options');
        const preset = [name, normalizedOptions];

        const existingIndex = this.#config.presets.findIndex((item) => configItemName(item) === name);

        return this.#replaceConfig({
            ...this.#config,
            presets: existingIndex === -1 ? [...this.#config.presets, preset] : this.#config.presets.map((item, index) => (index === existingIndex ? preset : item)),
        });
    }

    #addPlugin(name, options = {}, { prepend = false } = {}) {
        const normalizedOptions = normalizeOptions(options, 'plugin options');
        const plugin = [name, normalizedOptions];

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
        return this.#replaceConfig({
            ...this.#config,
            targets: normalizeTargets(targets),
        });
    }

    addPresetEnv(options = {}) {
        return this.#addPreset(presetEnv, options);
    }

    addPresetTypeScript(options = {}) {
        const normalizedOptions = normalizeOptions(options, 'preset options');

        return this.#addPreset(presetTypeScript, {
            onlyRemoveTypeImports: true,
            ...normalizedOptions,
        });
    }

    addPresetReact(options = {}) {
        const normalizedOptions = normalizeOptions(options, 'preset options');

        return this.#addPreset(presetReact, {
            development: this.#mode === 'development',
            runtime: 'automatic',
            ...normalizedOptions,
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
        } else if (isPlainObject(this.#config.targets)) {
            config.targets = { ...this.#config.targets };
        }

        return config;
    }
}
