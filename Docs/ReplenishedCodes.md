# GAP Scan – Replenishment Code Hierarchy

## Selection Order
Replenished → Code

---

## Replenished = Yes

**User can only select the following Code values:**
- In Full
- Limited Stock

---

## Replenished = No

**User can only select the following Code values:**
- Stock Not Found
- Damaged Stock
- Displayed Article

---

## Validation Rules
- `Code` field is **disabled** until `Replenished` value is selected
- If `Replenished = Yes`, only **Yes-linked Codes** are selectable
- If `Replenished = No`, only **No-linked Codes** are selectable
- Prevent saving if Code does not match the selected Replenished value

---

## Hierarchy Flow (Explicit)