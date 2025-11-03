---
name: Product Listing Request
about: Request a new product listing or edits to an existing product.
title: '[listing] Product Listing Request'
labels: ''
assignees: ''
---

## Instructions:

1. Make a copy of the [New Product Listing Spreadsheet](https://docs.google.com/spreadsheets/d/1KugFl4qv9plCtFXfRgd5Ip0bXpAiZo6Yqm8CnWEBOUg/edit#gid=1512129648) and give the engineering team edit permissions
2. Fill the copy New Product Listing Spreadsheet accordingly and link it to the **New Product Listing Spreadsheet** section below
3. Replace <PRODUCT_NAME> and fill the fields
4. Copy the <PRODUCT_NAME> section and repeat step 3 for each new product
5. Delete this **Instructions** section before submitting the Product Listing Request issue

# Product Listing Request

**New Product Listing Spreadsheet**:

## <PRODUCT_NAME>

**Product Name**:

**Annex link (optional)**:

**Schedule link (optional)**:

**Category** (i.e. Yield Optimizer. only for public products): N/A

**Private or Public?**:

**Logo** (attach link to Google Drive SVG file):

### Engineering Checklist

- [ ] Craft transaction data payload
- [ ] AB member to update onchain data
- [ ] Update [SDK](https://github.com/NexusMutual/sdk)
- [ ] Update [frontend-next](https://github.com/NexusMutual/frontend-next)
- [ ] Update [notification-processor](https://github.com/NexusMutual/notification-processor)
- [ ] Update [workers](https://github.com/NexusMutual/workers)
- [ ] Update [order-book](https://github.com/NexusMutual/order-book)
- [ ] Update [event-scanner](https://github.com/NexusMutual/event-scanner) (if there are new private products)
- [ ] Update [cover-router](https://github.com/NexusMutual/cover-router) .env (if there are allowed pools priority ordering)
