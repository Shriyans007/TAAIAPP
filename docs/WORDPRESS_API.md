# WordPress API

Public: `wp/v2/pages`, `wp/v2/media`, `wc/store/v1/products?category=112`, and membership products with category 81. Mobile plugin: `login`, `logout`, `me`, `profile`, `register`, `forgot-password`, `membership`, `push-token`, and `account` under `taai-mobile/v1`. Protected routes require `Authorization: Bearer <token>`. Tokens are random; only SHA-256 hashes are stored server-side.

Event date, time and venue are currently absent from the Store API. Do not parse prose or invent values. Future structured fields should be exposed by the server as `extensions.taai_event`.
