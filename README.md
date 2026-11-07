# hugo-docs-theme

A small, dependency-free [Hugo](https://gohugo.io/) theme for documentation sites: top bar, docs sidebar, "On this page" index with scroll-spy, light/dark mode, image lightbox, and a few shortcodes (admonitions, tabs and YouTube embeds with prior consent).

Everything that is specific to a site (title, texts, colors, images, menus) is configuration. Nothing about a particular project is hardcoded in the theme.

## Requirements

- Hugo **0.146.0** or newer (the theme uses the flattened `layouts/` structure). The standard edition is enough.
- [Go](https://go.dev/dl/), because the theme is consumed as a Hugo Module.

## Install

From the root of your Hugo site:

```sh
hugo mod init github.com/<you>/<your-site>   # only if the site is not a module yet
hugo mod get github.com/kikeelectronico/hugo-docs-theme@v0.1.0
```

and import it in `hugo.toml`:

```toml
[module]
  proxy = "direct"                          # clone from GitHub, no Go module proxy
  private = "github.com/kikeelectronico/*"  # also skips the checksum database

  [[module.imports]]
    path = "github.com/kikeelectronico/hugo-docs-theme"
```

Update later with `hugo mod get github.com/kikeelectronico/hugo-docs-theme@<version>` (or `hugo mod get -u` for the latest) and commit `go.mod` / `go.sum`.

## Configuration

### Site settings used by the theme

| Setting | Notes |
| --- | --- |
| `title` | Navbar brand, hero title, `<title>` and `og:site_name`. |
| `defaultContentLanguage` | Selects the UI language (`es` and `en` are bundled). Also sets `<html lang>`. |

### `[params]`

All of them are optional.

| Param | Default | Description |
| --- | --- | --- |
| `tagline` | – | Subtitle in the home hero and suffix of the home `<title>`. |
| `description` | – | Default meta / Open Graph / Twitter description. A page's own `description` front matter wins. |
| `copyright` | – | Footer text. HTML is allowed. |
| `github` | – | Repository URL. Adds a "GitHub" link to the navbar, the mobile menu and the footer. |
| `author_url` | – | Author URL. Adds an "About me" link to the footer. |
| `docsSection` | `"docs"` | Name of the content section that gets the sidebar. |
| `logo` | bundled neutral logo | Path of the navbar logo, relative to `static/`. |
| `logoAlt` | `"<title> logo"` (translated) | `alt` text of the logo. |
| `favicon` | bundled neutral favicon | Path of the favicon, relative to `static/`. SVG, ICO or PNG. |
| `homeBanner` | – | Path of the image shown under the home hero, relative to `static/`. Without it the area is left empty. |
| `socialImage` | – | Default Open Graph / Twitter image, relative to `static/`. Without it no image tags are emitted and the Twitter card is `summary`. |
| `socialImageAlt` | site `title` | `og:image:alt`. |
| `socialImageWidth` | `1200` | `og:image:width`. |
| `socialImageHeight` | `630` | `og:image:height`. |
| `ogLocale` | – | Value of `og:locale`, e.g. `es_ES`. The tag is omitted when unset. |
| `colors` | see below | Color overrides. |

A page can override the social image with `image` in its front matter, and its alt text with `imageAlt`.

### Colors

Set only the ones you want to change; the rest keep the theme defaults.

```toml
[params.colors.light]
  primary    = "#2563eb"   # --primary: accents, hero background, active tab...
  link       = "#1d4ed8"   # --link
  background = "#ffffff"   # --bg
  surface    = "#f6f7f8"   # --surface: navbar, footer, code blocks...
  text       = "#1c1e21"   # --text
  muted      = "#606770"   # --muted
  border     = "#dadde1"   # --border

[params.colors.dark]
  # Same keys. `primary` is not redefined in dark mode unless you set it here.
  link       = "#60a5fa"
  background = "#1b1b1d"
  surface    = "#242526"
  text       = "#e3e3e3"
  muted      = "#a0a4ab"
  border     = "#444950"
```

Anything beyond these variables is not configurable. If you really need it, copy the theme's `assets/css/main.css` into your site's `assets/css/`: the site's file shadows the theme's one (and you then own that file).

### Menus

Navigation is built from Hugo menus:

| Menu | Where it appears |
| --- | --- |
| `main` | Navbar links and, on mobile, the top-level entries of the mobile menu. |
| `actions` | Extra links on the right side of the navbar (after the `github` link) and at the end of the mobile menu. |
| `footer` | Extra footer links (after the `github` and `author_url` links). |

```toml
[[menus.main]]
  name    = "Documentation"
  pageRef = "/docs/getting-started"
  weight  = 10

[[menus.actions]]
  name   = "Blog"
  url    = "https://example.com/blog"
  weight = 10

[[menus.footer]]
  name   = "License"
  url    = "https://example.com/license"
```

- Entries with an absolute URL open in a new tab.
- An entry is marked active when it points to the current page or to a page in the same top-level section.
- On mobile, the `main` entry whose page lives in the docs section lists the docs pages below it.

### Docs section and sidebar

Pages under the section named by `params.docsSection` (default `docs`) get the sidebar, listing the section's pages ordered by `weight`. Other pages use the same layout without the sidebar. The sidebar is flat (one level).

The section list page (`content/docs/_index.md`) shows a card list of its pages.

### Languages and texts

All UI strings live in `i18n/<lang>.toml` (`es` and `en` included) and the language is the site's `defaultContentLanguage`. To change a text, or to add a language, create `i18n/<lang>.toml` in your site with the keys you want; site files take precedence over the theme's.

| Key | Used for |
| --- | --- |
| `menu_open`, `menu_close` | Mobile menu button label. |
| `nav_main`, `nav_mobile`, `nav_docs`, `nav_footer` | `aria-label` of the navigation landmarks. |
| `theme_toggle` | Theme toggle label. |
| `link_github`, `link_author` | Labels of the links created by `params.github` and `params.author_url`. |
| `logo_alt` | Default logo `alt`. `{{ . }}` is the site title. |
| `toc_title` | Title of the page index. |
| `not_found_title`, `not_found_text`, `not_found_home`, `not_found_docs` | 404 page. |
| `lightbox_label`, `lightbox_close` | Image lightbox. |
| `admonition_note`, `admonition_tip`, `admonition_info`, `admonition_caution`, `admonition_warning`, `admonition_danger` | Default admonition titles. |
| `yt_default_title` | Default accessible title of an embed. |
| `yt_consent_message`, `yt_consent_privacy`, `yt_consent_button` | Text and button of the consent placeholder. |
| `yt_revoke_button` | Footer button that withdraws the consent. |
| `yt_invalid_id` | Message when the video ID is not valid. |

### Home page

By default the home page is the hero (site title and `tagline`) followed by the `homeBanner` image. For projects without an image, set these keys in the front matter of `content/_index.md` (they can differ per language):

| Key | Description |
|---|---|
| `homeStyle` | `banner` (default) keeps the image area. `content` replaces it with the body of `_index.md`, which can use any shortcode, such as `cards`. |
| `heroButtons` | Optional list of buttons shown in the hero, with or without `homeStyle`. Each one needs `label` and either `url` or `pageRef` (a content path, e.g. `/docs/install`), and accepts `style`: `primary` (default, filled) or `secondary` (outline). External `url`s open in a new tab. |

```yaml
---
homeStyle: content
heroButtons:
  - label: Get started
    pageRef: /docs/install
    style: secondary
---
```

Nothing changes for sites that do not set these keys.

## Shortcodes

### Admonition

Types: `note`, `tip`, `info`, `caution`, `warning`, `danger`. The title is optional (defaults to the translated type name).

```
{{< admonition type="danger" title="Danger" >}}
Text in **markdown**.
{{< /admonition >}}
```

### Tabs

```
{{< tabs >}}
{{< tab label="Step 1" default="true" >}}
Text and ![image](assets/photo.jpg)
{{< /tab >}}
{{< tab label="Step 2" >}}
More text
{{< /tab >}}
{{< /tabs >}}
```

### YouTube

Videos are loaded from `youtube-nocookie.com` only after the visitor accepts. The choice is stored in `localStorage` and can be withdrawn from a button in the footer.

```
{{< yt "VIDEO_ID" "Accessible title" >}}
```

### Cards

A responsive grid of cards. `title`, `icon` (an emoji or short text), `image` (path relative to `static/`), `alt` (defaults to the title) and `link` are optional. `link` wraps the image/icon and the title; external links open in a new tab. The body is markdown.

{{< cards >}}
{{< card title="Easy to run" image="img/server.png" >}}
Runs on a Raspberry Pi or an Ubuntu Server.
{{< /card >}}
{{< card title="Open source" icon="🔓" link="https://opensource.org/" >}}
Licensed under an OSI approved license.
{{< /card >}}
{{< /cards >}}


## Images in content

Relative image paths in Markdown (`![alt](assets/photo.jpg)`) are resolved against the page's resources, and every image inside the article opens in a lightbox when clicked.

## Developing the theme

Point a site at a local checkout of the theme without publishing anything:

```sh
HUGO_MODULE_REPLACEMENTS="github.com/kikeelectronico/hugo-docs-theme -> ../hugo-docs-theme" hugo server
```

Releases are Git tags following semantic versioning (`v0.1.0`, `v0.2.0`, ...).

```sh 
git tag v0.2.0 && git push origin v0.2.0
```
