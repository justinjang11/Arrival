---
name: Regex word-boundary for gendered labels
description: /men.*shoe/i (and similar) incorrectly matches "Women's …" because "Wo**men**'s" contains "men" as a substring. Use \b word boundary.
---

# Regex Word-Boundary for Men's / Women's Labels

## Rule
Use `/\bmen's/i` (with a `\b` word boundary) — not `/men/i` or `/men.*/i` — when querying for a label or text that should match "Men's" but NOT "Women's".

**Why:** The substring "men" appears inside "Women" at position 2 ("Wo**men**"). A regex without a word boundary will match both "Men's US shoe size" and "Women's US shoe size". The `\b` boundary between `\W` (or string start) and `\w` means it matches at the start of "Men's" but NOT inside "Women's" (where the preceding character 'o' is `\w`).

**How to apply:**
- `getByLabelText(/\bmen's us shoe size/i)` → matches only "Men's US shoe size" ✓
- `queryByLabelText(/\bmen's us shoe size/i)` → returns null when only "Women's US shoe size" is in the DOM ✓
- `getByLabelText(/men.*us shoe size/i)` → WRONG: also matches "Women's US shoe size" ✗

The same principle applies to any pair where one label is a substring of another (e.g. "Men's" / "Women's", "wear" / "menswear", "size" / "shoe size").
