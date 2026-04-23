# AGENTS.md

## Project Snapshot

- Type: Vite + React + TypeScript frontend game prototype
- Main focus: 3D claw machine built with React Three Fiber and Rapier physics
- UI layer: Chakra UI + Framer Motion
- Routing: React Router, currently only `/`
- Status: runnable prototype, not yet structured for easy feature expansion

## Runbook

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

Current baseline:

- Production build succeeds
- Build output is very large: about `3.9 MB` minified JS before gzip summary
- Vite reports browser externalization warnings from Solana / wallet-related packages

## What This Repo Actually Contains

This is not a full game platform yet. It is mainly:

1. A single playable claw-machine scene
2. A small overlay UI for joystick, loading bar, and pick button
3. A local animation system implemented manually inside `Scene.tsx`
4. A wallet provider wrapper that is currently mounted globally but not used by gameplay

## Key Files

- `src/pages/Game.tsx`
  The page shell. Hosts the loading modal, control overlays, `Canvas`, and a ref bridge into the 3D scene.

- `src/components/Scene.tsx`
  The real core of the app. It currently handles:
  - GLB asset loading
  - claw movement
  - joystick input application
  - pick / release flow
  - animation queue processing
  - ball spawning
  - Rapier rigid-body interaction
  - lighting / environment / orbit camera

- `src/components/Ball.tsx`
  Wraps one prize ball as a `RigidBody` with a `BallCollider`, cloning the GLTF scene before render.

- `src/components/JoystickControl.tsx`
  Manual pointer / touch joystick UI. Sends x/z deltas into the scene through callbacks.

- `src/components/ButtonsControl.tsx`
  Has `Start` and `Pick` buttons, but `Start` is currently unused.

- `src/providers/WalletConnectProvider.tsx`
  Mounts Solana wallet providers and styles. This appears unrelated to current gameplay.

- `public/*.glb`
  The machine, claw parts, floor, and colored ball assets all live here.

## Architecture Notes

### Current flow

1. `main.tsx` mounts Chakra and wallet providers
2. `App.tsx` routes `/` to `Game`
3. `Game.tsx` renders overlay UI and a Three.js `Canvas`
4. `Scene.tsx` exposes `onJoystick` and `onPick` via `forwardRef`
5. Overlay controls call those imperative scene methods
6. `useFrame` updates claw motion, carried ball position, and animation queue every frame

### Important implementation detail

The scene uses imperative refs heavily instead of declarative game state. That makes the prototype quick to build, but it also means future changes will be safest if we refactor in slices instead of trying to rewrite everything at once.

## Findings

### 1. `Scene.tsx` is the main bottleneck for future changes

`src/components/Scene.tsx` is doing too many jobs in one file. Any gameplay change currently risks touching animation, physics, input, camera, and asset loading all together.

Recommended direction:

- split asset loading from gameplay logic
- split claw animation state from ball spawning
- isolate constants for positions, counts, and movement limits

### 2. Loading UI is mostly fake right now

In `src/components/Scene.tsx`, `initGame()` sets progress directly to `100` and dismisses loading after a timeout. It is not reading real GLTF or environment loading progress yet.

Implication:

- if you later add more assets, the loading bar will look broken or misleading

### 3. The wallet layer likely does not belong in the current baseline

`src/providers/WalletConnectProvider.tsx` is mounted globally, but gameplay code does not appear to use wallet state.

Implication:

- extra bundle size
- extra build warnings
- more dependencies than the current game needs

If your coming redesign is not Web3-related, this is a strong candidate to remove early.

### 4. Bundle size is much heavier than the app needs

`npm run build` produced a main JS chunk around `3888.58 kB`, and Vite warned about chunk size. The unused wallet stack is probably a meaningful contributor.

### 5. Environment HDR is loaded from a remote URL

`src/components/Scene.tsx` uses:

- `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr`

Implication:

- the experience depends on external network availability
- local/offline development fidelity may vary
- real loading progress is harder to manage cleanly

### 6. Global mutable animation state exists outside React

`stateMap` is declared at module scope in `src/components/Scene.tsx`. It works, but it is fragile if we later add resets, multiple scenes, hot reload edge cases, or scene remounts.

### 7. Typing is still prototype-grade

There is a lot of `any` across refs, props, animation items, and utility helpers. That will slow down safe refactors.

### 8. The gameplay loop is partial

What exists now:

- move claw on X/Z plane
- drop claw
- select nearest ball
- lift / move / release selected ball

What appears missing or incomplete:

- score / win condition
- start game behavior
- timer / turn system
- retry / reset flow
- prize detection / collection zone logic
- audio / feedback / UX states

## Likely Intent Of The Original Author

This looks like a visual gameplay prototype first, product architecture second.

Signs:

- most logic concentrated in one scene file
- UI is minimal and functional
- loading is simulated
- naming is understandable but not domain-modeled
- wallet integration may have been experimental or copied from a broader starter

That is useful for us: it means the repo is a decent base for a rebuild, but we should treat it as a prototype to reshape, not as a finished architecture to preserve blindly.

## Safe First Refactor Plan

If we are going to renovate this project, the safest order is:

1. Remove dead layers
   - decide whether Solana wallet support is actually needed
   - if not, remove the provider and related dependencies first

2. Extract constants
   - ball count
   - spawn layout
   - claw movement bounds
   - animation timings
   - model paths

3. Split `Scene.tsx`
   - `useClawController`
   - `useClawAnimations`
   - `ClawMachine`
   - `PrizeField` or `BallField`
   - `SceneLights`

4. Replace fake loading with real asset progress
   - use Drei loader hooks or a centralized asset preload strategy

5. Improve domain state
   - explicit game status: `idle | playing | picking | resolving | finished`
   - explicit selected prize state
   - optional score / attempts remaining

6. Optimize only after structure is cleaner
   - local HDR or simpler lighting
   - code splitting
   - asset compression
   - physics / draw call review

## If We Want To Turn This Into A Better Product

Good upgrade directions:

- add a real game loop with rounds, timer, score, and reset
- replace the unused `Start` button with actual game state transitions
- make prize capture deterministic instead of nearest-distance only
- add prize metadata instead of plain colored balls
- separate mobile controls from desktop controls
- add sound, result panel, and collected-prize tray
- preload or compress GLB assets for faster first paint

## Notes For Future Agents

- Assume this repo is a prototype and preserve working behavior before attempting ambitious rewrites.
- Touch `src/components/Scene.tsx` carefully; many behaviors are coupled implicitly through refs and animation timing.
- Before removing wallet code, confirm whether the user wants blockchain features in the redesign.
- Prefer incremental extraction over full rewrites.
- Re-run `npm run build` after major changes because this repo can pass TypeScript while still surfacing important Vite bundle warnings.

## Recommended First Task For The Next Pass

If the user says "start refactoring", the best first pass is:

1. remove the wallet provider if not needed
2. extract scene constants into a dedicated file
3. split ball spawning and claw animation logic out of `Scene.tsx`

That gives the biggest maintainability win with the lowest risk.
