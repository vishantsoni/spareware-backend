# TODO

- [x] Remove `c_id` from `src/models/catalog.js` schema and related indexes.
- [ ] Update `src/router/Catalog.js`
  - [x] Change `GET /getCatalog/:id` to fetch by catalog `_id` with `userid` ownership check.
  - [x] Add `GET /getCatalog` to list all catalogs for the logged-in user.
  - [x] Update `POST /createCatalog` to stop requiring/using `c_id`.

- [x] Quick sanity check by running node server (if available) and verifying routes.
