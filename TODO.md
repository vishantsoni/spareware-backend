# TODO

## Task: update product model schema according to Category schema

### Step 1

- Inspect current `src/models/product.js` and align fields with `src/models/category.js` nested structure.

### Step 2

- Update `src/models/product.js`:
  - Add `model_name`, `year_val`, `variant_name` fields.
  - Deprecate/remove `sub_cat_id`.
  - Add/adjust indexes.

### Step 3

- Update `src/router/Product.js` create endpoint to send/validate new fields.

### Step 4

- (Optional) Run a quick Node syntax check / start server.
