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

import { BabelConfigBuilder } from '@tomaschochola/tooling-babel';

export default new BabelConfigBuilder({
  mode: process.env.BABEL_ENV ?? process.env.NODE_ENV ?? 'production',
})
  .addPresetEnv()
  .addPresetTypeScript()
  .addPresetReact()
  .addReactCompilerPlugin()
  .toConfig();
