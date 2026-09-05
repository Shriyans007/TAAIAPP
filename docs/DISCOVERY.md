# Discovery record

## Figma design tokens

Inspected `https://swab-horse-78529643.figma.site/` on 5 September 2026. The prototype uses Poppins and a warm community-focused palette.

| Token | Value | Observed use |
|---|---:|---|
| Primary burgundy | `#6B1D2E` | buttons, active navigation, header |
| Dark burgundy | `#4B1824` | headings and borders |
| Gold | `#C9961A` | membership and highlights |
| Cyan | `#3A9BBF` | links and event accents |
| Warm background | `#FAF8F5` | app canvas |
| Deep text | `#1A0A10` | primary text |
| Secondary text | `#6B6B6B` | descriptions |
| Border | `#F2EDE8` | cards and dividers |

The prototype primarily uses 12 px and 16 px radii, 16 px body defaults, and soft burgundy shadows. Accessibility may require stronger contrast than decorative prototype text.

## Live content APIs

- WordPress root: `/wp-json/`; front page ID `7587`; ordinary posts are not assumed to be authoritative.
- Public pages: `/wp-json/wp/v2/pages`.
- Media: `/wp-json/wp/v2/media`.
- SimpLy Gallery: `/wp-json/wp/v2/pgc_simply_gallery` (older content requires curation).
- Membership products: `/wp-json/wc/store/v1/products?category=81`.
- Current event products: `/wp-json/wc/store/v1/products?category=112`.

The current event response contains product `15751`, “TAAI ABHINANDANAMALA 2026”. Its Store API response has a $0 base price, member-type attributes, an image and a website permalink, but no structured event date, time or venue. The app therefore does not display invented values or advertise the zero base price as a final ticket price. The custom plugin includes a maintainable event metadata response for future structured fields.

## Account architecture

The REST index advertises WordPress Application Password support, but that is not suitable for normal member login. The mobile app therefore targets the custom `taai-mobile/v1` plugin. The plugin uses `wp_authenticate()` against existing WordPress credentials and issues revocable, hashed mobile bearer tokens. WooCommerce customer fields and Subscriptions remain server-side.

