# force-site

The landing page of [Force](https://zalandemeter.github.io/force-site/), the terminal cockpit for coding agents.
Served by GitHub Pages from the root of `main`.

This repo is build output: the source is `site/` in the Force repo. Do not edit it by hand.

```sh
python3 site/tools/build.py ../force-site   # from the Force repo, then commit and push here
```

| Path | What |
|---|---|
| `index.html`, `style.css`, `site.js` | the page; the cockpit picture is inlined text, not an image |
| `media/` | the 28.5-second film (MP4, WebM) and its poster |
| `fonts/` | self-hosted fonts, each with its licence file next to it |

## Licence

MIT, see [LICENSE](LICENSE), except the fonts in `fonts/`, which keep their own licences:

| Font | Licence |
|---|---|
| Archivo, Archivo Black | SIL Open Font License 1.1 (`ARCHIVO-OFL.txt`) |
| DejaVu Sans Mono (subset) | DejaVu Fonts licence (`DEJAVU-LICENSE.txt`) |
| Symbols Nerd Font Mono (subset) | MIT (`NERD-FONTS-SYMBOLS-LICENSE.txt`) |

Force is an independent project, not affiliated with Anthropic or the makers of OpenCode.
