/**
 * warp.js
 * REMOVED — SVG feDisplacementMap barrel distortion was breaking mouse hit-testing
 * on interactive elements. CRT visual effects are now achieved purely via CSS
 * (scanlines + vignette) in the #crt-effects overlay, which has pointer-events:none
 * and does not interfere with the interactive Win98 desktop underneath.
 *
 * If barrel distortion is desired in the future, implement it as a non-interactive
 * canvas overlay that reads and re-renders screen pixels, keeping the real
 * interactive DOM behind it with correct hit-testing geometry.
 */
