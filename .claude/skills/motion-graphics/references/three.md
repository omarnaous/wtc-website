# Real 3D (three.js) in Remotion

Use it when the brief asks for "3D", "realistic" or "like a render": glossy objects, reflections, confetti with depth,
extruded logos. Worked example: `appify-balloon/` (a latex balloon popping into 3D confetti, an extruded logo at the end).

## Setup
- Give the project its own `node_modules` (don't add three to a shared install):
  `npm i @remotion/three@<same as remotion> three@0.180.0 @react-three/fiber@^9` (fiber 9 for React 19).
- WebGL in headless Chrome: pass `chromiumOptions: { gl: "angle" }` to `getCompositions`, `selectComposition`,
  `renderStill` and `renderMedia`, and raise `timeoutInMilliseconds` (120000). `concurrency` must be <= CPU cores.
  Speed: ~5 min for 17 s at 1080x1920 with 4 workers.
- `<ThreeCanvas width={W} height={H} camera={{ fov: 30, position: [0, 0, 9] }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}>`.
  Keep the CSS background behind it and the HUD/text above it (three layers: bg, canvas, overlay).

## Mapping 2D layout to 3D
With fov 30 at z 9 the visible height is 2 * 9 * tan(15deg) = 4.82 units, so on a 1920 px stage 1 unit = 398 px.
`toWorld(x, y) = [(x - 540) / 398, (960 - y) / 398]` lets the 3D objects line up with stage-pixel text and HUD.
Feed 4:5 keeps the same vertical extent (only wider), so the same mapping holds when the CSS stage is letterboxed.

## Looks that read as real
- Environment reflections: `PMREMGenerator.fromScene(new RoomEnvironment())` -> `scene.environment`;
  `scene.environmentIntensity` 0.5-0.6, `ACESFilmicToneMapping`, exposure ~0.95. Too much env washes colours to pastel.
- Latex / plastic: `meshPhysicalMaterial` with `clearcoat 1`, `clearcoatRoughness 0.06`, roughness ~0.2, a little sheen.
  Brand art on a curved object: draw it on a canvas (`Path2D(svgPath)`) -> `CanvasTexture` (sRGB) on a `LatheGeometry`
  (start the lathe at phi = PI so u = 0.5 faces the camera).
- Chrome: `meshStandardMaterial metalness 1 roughness 0.12`. Gold: colour #FFB800, metalness 0.6, plus orange emissive,
  or it turns pale under coloured lights.
- Logos in 3D: `SVGLoader().parse('<svg><path d="..."/></svg>')` -> `SVGLoader.createShapes` -> `ExtrudeGeometry`
  with a bevel; flip y with a negative scale. Add a white front light for the end card.
- Confetti: two `instancedMesh`es (planes + star shapes), matrices and colours set in `useLayoutEffect` keyed on the
  frame, `frustumCulled={false}`. Size them in world units (a star of radius 1 is half the screen).
- Everything stays a pure function of the frame (Remotion `random(seed)`, `spring`), so parallel rendering is safe.
