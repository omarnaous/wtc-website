/**
 * Stand-in for `sharp` in the Worker bundle.
 *
 * sharp is a native Node module used only by the build-time scripts
 * (palette sampling, strap photography, Instagram import). It never runs in
 * the Worker, but Vite follows the import graph and would try to bundle it,
 * so vite.config.ts aliases it here.
 */
export default {};
