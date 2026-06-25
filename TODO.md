# TODO

## Task: Add category icon image (segment-category) + 1MB validation

- [x] Inspect existing category model and routes
- [x] Update `src/models/category.js` to store a single category icon URL/path

- [x] Add an upload endpoint in `src/router/Category.js` for category icon

- [x] Enforce icon validation: image mimetype + 1MB max size

- [x] Save uploaded file into `static/cat-imageAction/` and persist link in Mongo

- [x] Ensure ownership checks (only category owner can upload)

- [ ] Start server and verify endpoint wiring (manual curl/postman)
