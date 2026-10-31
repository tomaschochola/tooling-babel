import { BabelConfigBuilder } from '@tomaschochola/tooling-babel';

export default new BabelConfigBuilder({
    mode: process.env.BABEL_ENV ?? process.env.NODE_ENV ?? 'production',
})
    .addPresetEnv()
    // .addCoreJsEntryPolyfills()
    .addPresetTypeScript()
    .addPresetReact()
    .addReactCompilerPlugin()
    .toConfig();
