# memoblok.com

The public site for [MemoBlok](https://www.memoblok.com/), an app for tracking
anything you can count or measure.

Hand-written HTML + CSS + vanilla JS. **No framework, no build step, no
dependencies, and no external network requests** — every font, image, stylesheet
and script is served from this domain. Published with GitHub Pages.

## Layout

```
index.html            What MemoBlok is
about.html            The company, and how to reach us
support.html          Contact and FAQ
privacy.html          Privacy Policy
terms.html            Terms of Service
delete-account.html   Account and data deletion
join.html             Invite landing page — served at /join
404.html
robots.txt  sitemap.xml
CNAME                 The custom domain — Pages needs this file
.nojekyll             Stops Jekyll skipping /.well-known (see below)
.well-known/apple-app-site-association
                      Universal-links manifest. No extension, ever.

assets/css/site.css   The whole stylesheet; every colour is a custom property
assets/js/site.js     Nav toggle, © year, invite paste flow, guarded reveal
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
seamless grain tile, white cards outlined by a hairline, and one purple accent
(`#6E4FA8`).

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

Colours live in `:root` as custom properties and are referenced by name — there
should be no raw hex anywhere else in the stylesheet. `--dim` (`#7A7A7F`) only
reaches 3.8:1 on the paper ground, so it is reserved for large/bold text;
`--dim-text` (`#5F5F66`, 5.6:1) is the one to use for body copy.

## Invite links and `/join`

The app mints invite links of the form:

```
https://www.memoblok.com/join#Ky7-3nDlsf8803HV_kVJC2w
```

With the app installed, iOS opens MemoBlok and this page never loads. Without it,
Safari lands here, which is why `join.html` explains what MemoBlok is and what
sharing a Blok means. GitHub Pages serves `join.html` at `/join` as a direct 200, so
the extensionless URL the association file matches on needs no redirect. Keep it a
file: moving it to a `join/index.html` directory turns `/join` into a 301 to `/join/`,
which gains nothing and leaves the page rebuilding a trailing-slash URL that no longer
matches the link the app minted.

**The token is in the fragment (`#…`) and that is load-bearing.** A fragment is
never sent to a server, so it stays out of this site's request logs and out of the
link-preview fetches that iMessage and WhatsApp make before anyone taps. The page
reads `location.hash` in the browser to show the reader their own link, and that is
as far as it goes: the token must never reach the network — not in a query string,
an `href`, analytics, or a `fetch`. Moving it to a query string to make the page
easier to build would leak a working credential for every invite ever sent.

The page also has to keep telling the reader to **tap the invite link again after
installing**. iOS only consults the association file at tap time, so for someone who
installs after their first tap, the second tap is the one that opens the app. Delete
that and they are stranded on a web page.

Word it as part of the *don't have the app yet* path, never as "already installed?
tap it again" — anyone reading this page is here precisely because tapping did not
open the app, and telling them to repeat it is telling them to redo what just
failed. For the reader who does have the app, the answer is the paste flow below,
not another tap.

### The paste flow

A universal link only fires when the messenger hands the URL to the OS, and several
never do — WeChat and others open it in their own webview, so the tap lands on this
page and the app never hears about the invite even though it is installed. No
entitlement, `associatedDomains` entry or association-file change overrides that, and
"tap the link again" doesn't either: the second tap goes to the same webview.

The app takes a pasted link at **Settings › Sharing → "Have an invite link?"**, and
the page's only job is to say so. Nothing is parsed or validated here. Name that path
exactly as written — it is what the app's own rows say, and the reader is hunting
through Settings for it.

The instruction is the same either way; only the source of the link changes, and only
the browser can tell which case it is:

| Fragment | Copy |
| --- | --- |
| `…/join#TOKEN` | Copy **the link below**, shown as selectable text, because an in-app browser usually hides the address bar and this is the only copy of the link the reader can reach. |
| `…/join` | Copy the invite link **from wherever you received it**. There is no link to show, and the page must not pretend otherwise. |

The no-token copy is what the file ships rendered, so a reader without JavaScript is
never shown a link that isn't there. The copy button is a bonus and only appears where
`navigator.clipboard` exists; selectable text is the floor, because some webviews
expose no Clipboard API at all.

### The association file

`/.well-known/apple-app-site-association` — no extension — pairs the Apple Team ID
with the bundle ID as `TEAMID.bundleID`. It fails silently and identically in four
ways: served with an extension, served through *any* redirect (iOS follows none),
served from a different host than the link (`www` links need the `www` file), or
carrying a wrong `appID`. Each one just opens Safari, with nothing logged anywhere.

`.nojekyll` is what keeps the file published at all — Jekyll skips dot-directories
by default, which is the most likely reason a correct-looking commit still 404s.

Verify after deploying, and note the missing `-L`: following a redirect is exactly
what iOS will not do.

```sh
curl -sI https://www.memoblok.com/.well-known/apple-app-site-association
curl -s  https://www.memoblok.com/.well-known/apple-app-site-association
curl -sI https://www.memoblok.com/join
```

Expect `HTTP/2 200` and no `location:` header on all three. Any 301/302 means it is
broken, even though it looks fine in a browser — browsers follow redirects, and iOS
follows none. Apple's validator at
`https://app-site-association.cdn-apple.com/a/v1/www.memoblok.com` caches, so it can
lag a fresh deploy; trust `curl` first.

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
