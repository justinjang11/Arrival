---
name: type=number JSDOM sanitization
description: Non-numeric strings set into type="number" inputs become "" in JSDOM/browsers — affects test strategy for numeric field validation.
---

# type="number" Input Sanitization in JSDOM

## Rule
Never use a non-numeric string (e.g. `"5ft"`, `"30x32"`) as the `fireEvent.change` value for a `type="number"` input when trying to trigger a specific validation error message. JSDOM (like real browsers) sanitizes invalid values to `""`, producing a "required" error instead of the intended error.

**Why:** The HTML spec defines that a `<input type="number">` element's `value` IDL attribute returns `""` when its content is not a valid floating-point number. JSDOM implements this. So `event.target.value` becomes `""` inside the React handler, and validation sees an empty field.

**How to apply:**
- To test the "must be a whole number" constraint on a feet field: use `"1.5"` (a decimal — `Number.isInteger(1.5)` is false).
- To test the "must be positive" constraint on waist/inseam: use `"-5"` (a valid number that fails `> 0`).
- To test "required" (empty field): just don't fill the field at all; its initial state is `""`.
- If you need to test actual non-numeric string rejection, either switch the input to `type="text"` with `inputMode="numeric"`, or test via `getByLabelText` value after the change (it will be `""`).
