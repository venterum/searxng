# SearXNG by Venterum

This is a custom build of [SearXNG](https://github.com/searxng/searxng), a privacy-respecting metasearch engine.
Based on the fork by [privau/searxng](https://github.com/privau/searxng), this version includes additional visual improvements to the search input and other UI elements.

It also retains the custom theme support from the privau build, including themes from Catppuccin, Paulgoio, Kagi, Brave, Moa, and the official SearXNG themes.

---

Don't see your favorite theme? [Submit a theme request to privau](https://github.com/privau/searxng/issues/new?assignees=&labels=bug&projects=&template=theme-request.md)

## Live Instance

🌐 [https://searx.venterum.com](https://searx.venterum.com)

## Notable features

* Visual enhancements to the search input field
* Minor UI adjustments
* Built on top of [privau/searxng](https://github.com/privau/searxng)

## Getting Started

```bash
docker run -d --restart always -p 127.0.0.1:8080:8080 --name searxng your-image-name
```

Then visit: [http://127.0.0.1:8080](http://127.0.0.1:8080)
