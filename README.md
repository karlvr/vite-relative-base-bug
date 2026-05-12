# Vite 8 CSS `url()` regression repro

When `base: './'` is set and the build is configured to emit CSS into a
subfolder (via `assetFileNames`) while keeping images in a sibling folder,
Vite 8 writes `url(./img/...)` into the CSS instead of `url(../img/...)`.

The browser then resolves `./img/...` relative to the CSS file's URL,
producing `dist/css/img/...` — which doesn't exist. The image 404s.

## Setup

```sh
npm install
```

Two Vite versions are installed side-by-side as aliased deps (`vite7` /
`vite8`) so a single working tree can build with either.

## Reproduce

```sh
npm run build:v7    # writes ../img/foo-<hash>.png — correct
npm run build:v8    # writes ./img/foo-<hash>.png  — wrong
```

Inspect the emitted URL:

```sh
grep -o 'url([^)]*)' dist/css/main-*.css
```

## Output layout (identical for both versions)

```
dist/
  entrypoints/main.html
  css/main-<hash>.css
  img/foo-<hash>.png
```

The CSS lives in `dist/css/`, the image lives in `dist/img/`. The relative
path from the CSS file to the image is `../img/foo-<hash>.png`.

## Expected vs actual

|             | Vite 7.3.3                  | Vite 8.0.12                 |
| ----------- | --------------------------- | --------------------------- |
| Emitted url | `url(../img/foo-<hash>.png)` ✓ | `url(./img/foo-<hash>.png)` ✗ |
| Resolves to | `dist/img/foo-<hash>.png`   | `dist/css/img/foo-<hash>.png` (404) |

## Trigger conditions

All of the following are needed:

1. `base: './'`
2. CSS source file is in a subfolder (here: `css/style.css`)
3. CSS is reached via an HTML entry's `<link rel="stylesheet">` — *not* by
   listing the CSS directly in `rollupOptions.input`
4. `assetFileNames` routes CSS to `css/` and image assets to `img/`
5. The HTML entry lives at a different directory depth than the CSS source

If the CSS is listed directly as a Rollup input (e.g.
`input: { 'css/style': 'css/style.css' }`), both Vite 7 and Vite 8 produce
the wrong `./img/...` URL — that path is a separate, pre-existing bug. The
regression is specific to the HTML-entry-imports-CSS path.

## Files

- `entrypoints/main.html` — HTML entry, links to `/css/style.css`
- `css/style.css` — references `../img/foo.png`
- `img/foo.png` — the asset
- `vite.config.js` — minimum config to trigger the bug
