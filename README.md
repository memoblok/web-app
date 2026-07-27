# memoblok.com

The public site for [memoblok](https://www.memoblok.com/), an app for tracking
anything you can count or measure.

Hand-written HTML + CSS + vanilla JS. **No framework, no build step, no
dependencies, and no external network requests** — every font, image, stylesheet
and script is served from this domain. Published with GitHub Pages.

## Layout

```
index.html            What memoblok is
about.html            The company, and how to reach us
support.html          Contact and FAQ
privacy.html          Privacy Policy
terms.html            Terms of Service
delete-account.html   Account and data deletion
404.html
robots.txt  sitemap.xml
CNAME                 The custom domain — Pages needs this file

assets/css/site.css   The whole stylesheet; every colour is a custom property
assets/js/site.js     Nav toggle, © year, marker underline, guarded reveal
assets/fonts/         Nunito Sans 400/700/800, latin subset, self-hosted (OFL)
assets/img/           Icon, grain tile, feature icons, share image
```

## Local preview

```sh
python3 -m http.server 8000    # then open http://localhost:8000/
```

Paths are absolute (`/assets/...`), so open it through a server rather than
`file://`.

## Design notes

The site reuses the app's identity: a warm paper ground (`#F3F1E9`) with a
seamless grain tile, white cards outlined by a hairline, one purple accent
(`#6E4FA8`), and hand-drawn marker underlines.

Two rules are load-bearing, and dropping either produces a washed-out page:

1. **Every white surface gets a 1px hairline.** On a near-white ground a shadow
   alone cannot hold an edge. The border draws the shape; the shadow only lifts
   it.
2. **Only content surfaces get a shadow.** Buttons and chips are flat —
   hairline, no shadow — which is what keeps the cards the only things floating
   on the page.

Corollaries: a surface with an accent fill sets its border to its own fill
colour, and anything floating over content goes dark (`#2B2A27`) rather than
white, because a hairline between two whites is a seam, not a boundary — here
that is the mobile nav drawer.

The grain tile is only seamless at `background-size: 128px`. Don't scale it.

The marker underline is generated in `site.js` and is deliberately **scarce** —
one per page, at full strength. It is seeded by heading index, so a given
heading draws the same stroke forever; never introduce `Math.random()` there.
An accent stroke under every header stops reading as a touch of hand and starts
reading as noise.

Colours live in `:root` as custom properties and are referenced by name — there
should be no raw hex anywhere else in the stylesheet. `--dim` (`#7A7A7F`) only
reaches 3.8:1 on the paper ground, so it is reserved for large/bold text;
`--dim-text` (`#5F5F66`, 5.6:1) is the one to use for body copy.

## Accuracy

The legal pages describe what the app actually does today, and the app is not
released yet. When behaviour changes — a new permission, a new third-party
service, an analytics or advertising SDK, a paid tier — update `privacy.html`
and the support FAQ in the same change, and keep the app store privacy
disclosures in step with this page rather than the other way round.

The Apple-specific clause and the app store references in `terms.html` are
deliberate; Apple's review guidelines expect that acknowledgment.

## Fonts

`assets/fonts/*.woff2` are Nunito Sans (SIL Open Font License 1.1, included as
`OFL.txt`), subset to latin. To regenerate:

```sh
python3 -m fontTools.subset NunitoSans_400Regular.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+2713,U+00B7" \
  --layout-features='kern,liga,calt' --flavor=woff2 \
  --output-file=assets/fonts/NunitoSans-Regular.woff2
```

Don't swap these for a Google Fonts `<link>` — it adds a third-party request and
would make the privacy page's "no third-party requests" statement false.
