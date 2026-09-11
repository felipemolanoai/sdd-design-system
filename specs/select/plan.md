# Select implementation plan

## Repository baseline

The repository is currently the React 19 + TypeScript 6 Vite starter. It has no
component library structure, reusable form primitives, Storybook configuration,
or automated test runner. The reusable pieces available today are React's built-in
state, ref, effect, and ID hooks; the plain-CSS import pattern; and the semantic
theme variables in `src/index.css` (`--text`, `--text-h`, `--bg`, `--border`,
`--accent`, `--accent-bg`, `--accent-border`, `--shadow`, and `--sans`).

The approved implementation is a controlled, custom single-select built from
React and DOM primitives. A native `<select>` would provide strong baseline
accessibility, but it cannot reliably satisfy the approved focus model, explicit
open state, placeholder behavior, or non-selectable empty-state message across
browsers. A third-party headless select would satisfy much of the behavior but
would add a runtime dependency before the project has established a component
dependency strategy. The custom button-trigger/listbox approach is the approved
V1 direction, provided its keyboard and focus behavior is covered thoroughly by
tests.

## Approved review decisions

- Select is controlled; the consumer owns the selected value.
- Accessible naming requires either a visible `label` or an `ariaLabel`.
- Behavior is implemented with the existing React and DOM APIs, with no new
  runtime dependency.
- The popup is rendered locally without a portal, automatic flipping, or collision
  detection in V1.
- `xl` extends only the visual size scale. Keyboard, pointer, focus, and
  accessibility behavior remain identical across every size.
- Minimal React/Vite Storybook tooling plus Vitest, `jsdom`, React Testing Library,
  and `user-event` are approved as development dependencies for the implementation
  phase. They must not be installed while this plan is being reviewed.

## Existing components and primitives to reuse

- React `useState` for transient open and active-option state.
- React `useRef` for the trigger, root, and option elements.
- React `useId` for collision-safe label, listbox, helper, and error relationships.
- React effects for post-render focus and an open-only outside-pointer listener,
  with cleanup that remains safe under the existing `StrictMode` root.
- Native `<button type="button">` behavior for the trigger and native `disabled`
  semantics, augmented with listbox ARIA relationships.
- Semantic listbox/option DOM roles for the popup; the empty message remains
  non-interactive and is excluded from option navigation.
- The existing global typography, foreground, background, border, accent, and
  shadow variables. Component styles should consume these variables rather than
  duplicate their color values.
- The existing colocated plain-CSS convention. CSS Modules, CSS-in-JS, a utility
  framework, and an icon package are unnecessary for this component.

There is no existing field wrapper, label, helper/error component, popup utility,
focus utility, or icon component to reuse. The first version should keep these
details internal to Select instead of creating speculative shared abstractions.

## Approved public API direction

Export `Select`, `SelectOption`, `SelectSize`, and `SelectProps` from the component
folder. The API should remain intentionally narrow:

- `SelectSize` is `'sm' | 'md' | 'lg' | 'xl'`; adding `xl` widens only the
  supported visual size values.
- `options: Array<{ value: string; label: string }>`; values are assumed unique.
- `value: string | null` and `onChange(value: string): void`; the selected value is
  controlled by the consumer so validation and form state stay outside Select.
- `placeholder: string`; making this required guarantees a meaningful empty
  display even if the controlled value later becomes `null`.
- An accessible-name union that requires either `label` or `ariaLabel`. A visible
  label is preferred, while `ariaLabel` supports layouts without one.
- Optional `helperText`, `errorMessage`, `required`, `disabled`, `size`, `id`, and
  `className` props. `size` defaults to `md`.

No props should be added for search, multiple selection, groups, per-option
disabled state, async loading, custom rendering, uncontrolled/default values, or
native form serialization because those capabilities are outside the approved
first version.

## Component structure

`Select` owns the public API and field-level relationships. Its rendered structure
is:

1. A root field container carrying size and state data attributes.
2. An optional visible label, including a visible required indicator when needed.
3. A native button trigger containing the selected label or placeholder and a
   decorative CSS/inline-SVG chevron.
4. A conditionally rendered popup containing the listbox and internal option
   items, or the `No options available` empty message.
5. Exactly one description region: the error message when present, otherwise the
   helper text.

An internal option item may be extracted within `Select.tsx` if that keeps event
and ref handling readable, but it should not be exported. The keyboard logic
should also stay private to the component initially; a separate hook would add an
abstraction with no second consumer.

## State and interaction approach

The selected value has a single source of truth in `value`. Internal state is
limited to `isOpen` and `activeIndex`; refs track the trigger, root, and rendered
options. Opening computes the initial active index from the selected value, or
uses index `0` when nothing is selected. With an empty option list it uses `-1`
and leaves DOM focus on the trigger.

Use shared `open`, `close`, and `commitSelection` helpers so pointer and keyboard
paths produce the same state transitions. Trigger key handling for Enter and Space
must prevent the button's follow-up synthetic click from toggling the popup twice.
When the popup owns focus, only the active option is in the tab order. Arrow keys
prevent their scrolling default, clamp the index at the first or last option, move
DOM focus, and never call `onChange`. Enter or Space commits the active option,
closes, calls `onChange`, and focuses the trigger. Escape closes without a value
change and focuses the trigger.

Tab and Shift+Tab must not be prevented. While an option owns focus, the trigger
is temporarily removed from the tab order so either direction reaches the normal
external tab target rather than stopping on the trigger. A focus-leave handler on
the root closes the popup after focus moves outside; this path never restores
trigger focus. The trigger remains tabbable when an empty popup is open.

An open-only document `pointerdown` listener closes when the event target is
outside the root. It must not prevent the pointer's native focus behavior or call
`focus()` on the trigger. Option clicks commit and explicitly restore trigger
focus. A trigger click toggles the popup. The native `disabled` attribute blocks
all trigger activation, while handlers also guard against state changes when
disabled.

Changes to `options` while the popup is open are explicitly outside the valid V1
usage contract, regardless of whether the change comes from async loading, local
state, or any other source. This is a caller constraint separate from async option
loading being out of scope. V1 may assume that option order, values, and labels
remain stable from open through close and does not need reconciliation behavior
for mid-session option changes.

## Accessibility approach

- Use the WAI-ARIA button-trigger/listbox popup pattern with `aria-haspopup`,
  `aria-expanded`, and `aria-controls` on the trigger, `role="listbox"` on the
  option container, and `role="option"` plus `aria-selected` on each option.
- Connect a visible label through generated IDs. When there is no visible label,
  apply the required `ariaLabel` to the trigger. Ensure the current visible value
  or placeholder is still exposed along with the field name.
- Apply native `disabled` and keep the disabled styling perceivable. Communicate
  required state through the visible label when present and through accessible
  descriptive text in all cases.
- Apply `aria-invalid="true"` when `errorMessage` is present and point
  `aria-describedby` at the current error. Otherwise, point it at helper text when
  supplied. Do not leave IDs referencing unmounted descriptions.
- Render error text with a visible non-color cue such as an error icon or `Error:`
  prefix in addition to the error border/color. The decorative cue must not
  duplicate the spoken message.
- Use `:focus-visible` for a high-contrast outline that is not clipped by the
  popup. Selected, focused, disabled, and error states must remain distinguishable
  in light and dark color schemes.
- Keep the empty message non-selectable and out of the tab sequence. Opening an
  empty Select leaves focus on the trigger, as required.
- Verify accessible name, description, invalid/disabled/expanded state, listbox
  ownership, and focus movement in automated tests, then perform a manual
  keyboard and screen-reader smoke pass in Storybook.

## Styling and token strategy

Create a colocated `Select.css` using a component namespace such as
`.select-field` to avoid collisions with the starter app. Use data attributes for
`data-size`, `data-open`, and `data-invalid`, and native selectors such as
`:disabled`, `:hover`, and `:focus-visible` for interaction states.

Reuse the existing semantic colors, font, border, accent, and shadow variables.
Add only missing field-level variables to `src/index.css` when a value is genuinely
shared across Select states—for example control radii, control heights, spacing,
or error foreground. Size-dependent values should be centralized in component
CSS custom properties, with the base rule representing the default `md` size.
Component properties should have sensible fallbacks to the existing global tokens
so the Select remains usable in Storybook and when consumed outside the starter
page.

The approved size scale includes `sm`, `md`, `lg`, and `xl`. Implementation tasks
must carry these values forward rather than choosing dimensions implicitly:

| Size attribute | `sm` | `md` (default) | `lg` | `xl` |
| --- | ---: | ---: | ---: | ---: |
| Trigger and option minimum height | 32px | 40px | 48px | 56px |
| Trigger and option type | 14px / 20px | 16px / 24px | 18px / 26px | 20px / 28px |
| Horizontal content padding | 10px | 12px | 16px | 20px |
| Visible label type | 12px / 16px | 14px / 20px | 16px / 24px | 18px / 28px |
| Helper and error type | 12px / 16px | 12px / 16px | 14px / 20px | 16px / 24px |
| Label-to-control gap | 4px | 6px | 8px | 10px |
| Control and popup radius | 6px | 8px | 10px | 12px |
| Chevron box | 16px | 18px | 20px | 22px |

The control border and focus ring remain 1px and 2px respectively at every size.
The popup gap remains 4px and its maximum height remains 240px; scrolling handles
longer option lists. These fixed values avoid making compact controls visually
fragile or allowing large controls to produce an excessively tall popup.

The popup should be absolutely positioned relative to the field, match the
trigger width, layer above adjacent content, and use a bounded max height with
vertical scrolling. A portal and collision-detection system are unnecessary for
version one because the spec does not require viewport-aware placement. Motion,
if any, should be limited to simple color/border transitions and respect
`prefers-reduced-motion`; animated popup choreography is out of scope.

## Files likely to be created or modified

Create:

- `src/components/Select/Select.tsx` — public types, markup, state, focus, and event
  behavior.
- `src/components/Select/Select.css` — component states, sizes, popup, and focus
  styling.
- `src/components/Select/index.ts` — stable public exports.
- `src/components/Select/Select.stories.tsx` — visual and interactive examples.
- `src/components/Select/Select.test.tsx` — behavioral and accessibility contract
  tests.
- `.storybook/main.ts` and `.storybook/preview.ts` — minimal Vite Storybook setup
  and global style import.
- `src/test/setup.ts` and `vitest.config.ts` — DOM test environment and shared test
  setup.

Modify:

- `src/index.css` — reuse and, only where missing, extend shared semantic tokens.
- `package.json` and `package-lock.json` — add Storybook/test scripts and the
  minimum required development-only packages.
- `tsconfig.node.json` or a small dedicated config, only if Storybook/Vitest config
  files need TypeScript coverage outside `src`.
- `README.md` — document the added Storybook and test commands once those tools
  exist.

`src/App.tsx` and `src/App.css` do not need to change: Storybook will be the
component demonstration surface, avoiding unrelated edits to the Vite starter.
No `tasks.md` is part of this plan.

## Storybook impact

Because Storybook is not installed, the implementation phase will add the approved
minimal React/Vite Storybook setup and corresponding scripts. These
development-only dependencies are the repository's component documentation and
manual interaction surface; no optional addon suite should be introduced for the
first component. Installation happens only after implementation tasks are created,
not during planning.

Stories should cover default `md`, `sm`, `lg`, `xl`, preselected, disabled,
required, helper text, error replacing helper text, no visible label with
`ariaLabel`, and empty options. Use a small controlled story wrapper so selection
updates the display exactly as a consumer would. A keyboard-focused story or
documented play instructions should make the non-wrapping arrows, confirmation,
Escape, Tab, and Shift+Tab behavior easy to verify. Manual review must include the
`xl` story in light and dark themes and confirm that its keyboard, pointer, focus,
and accessibility behavior matches the existing sizes. Global `src/index.css`
should be imported in Storybook preview so the same tokens and light/dark behavior
apply.

## Testing strategy

Use the approved minimal DOM interaction stack: Vitest with `jsdom`, React Testing
Library, and `user-event`. These development-only dependencies will be installed
during implementation, not during planning. Do not add a runtime UI or
accessibility library. Tests should use a controlled harness and assert observable
behavior rather than internal state.

Coverage should include:

- label/`ariaLabel`, placeholder, selected text, helper/error precedence, required,
  disabled, default `md`, and explicit `sm`, `lg`, and `xl` size rendering;
- pointer open, option selection, trigger focus restoration, trigger re-click,
  and outside click without forced focus restoration;
- Enter and Space opening, initial focus on selected or first option, clamped
  ArrowUp/ArrowDown movement, and no `onChange` during navigation;
- Enter/Space confirmation, Escape cancellation, and focus restoration for those
  paths;
- Tab and Shift+Tab closing while focus proceeds to the next or previous external
  focusable element;
- empty options text, absence of selectable options, and focus remaining on the
  trigger;
- `aria-expanded`, `aria-controls`, `aria-selected`, `aria-invalid`, native
  disabled state, and live `aria-describedby` relationships;
- multiple Select instances to ensure generated IDs do not collide.

Run `npm run lint`, the new non-watch test command, `npm run build`, and the
Storybook static build in verification. Then manually traverse every story using
only the keyboard and perform a screen-reader smoke check for name, value,
expanded state, focused option, error, required, and disabled announcements. The
manual keyboard, pointer, focus, light/dark, and screen-reader checks must include
`xl` and confirm that sizing introduces no behavioral or accessibility difference.

## Approved constraints, assumptions, and unresolved technical questions

- The Select is controlled; uncontrolled state and `defaultValue` are not part of
  version one.
- Option values are strings and unique, and option labels are plain text.
- Native form serialization, hidden inputs, reset handling, and constraint
  validation are not required. A consuming form owns validation as stated in the
  spec.
- Popup placement is below the trigger and in the local DOM. Portals, automatic
  flipping, and positioning inside clipping containers are not required.
- `options` must remain stable while the popup is open. This explicit V1 usage
  constraint applies to all prop changes, not only async loading.
- The `sm`, `md`, `lg`, and `xl` measurements are defined by the approved scale
  in the styling section and must not be silently re-decided during implementation.
- The repository has no stated browser support matrix. The implementation should
  target the modern browsers supported by the current Vite/React baseline and use
  standard DOM/ARIA APIs only.
- The project has no established Storybook or test versions. Compatible versions
  should be selected together from the currently installed Vite/React generation,
  locked in `package-lock.json`, and kept to the minimal packages described above.
