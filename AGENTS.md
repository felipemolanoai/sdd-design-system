# Project agent instructions

## Project stack

- Use React and TypeScript.
- Follow the existing Vite project structure.
- Prefer existing repository patterns over introducing new abstractions.
- Keep implementation simple and local unless reuse is clearly justified.

## Design System rules

- Reuse existing components, primitives, and semantic tokens when available.
- Do not hardcode colors when an existing semantic token can be used.
- Do not introduce speculative shared abstractions for a single component.
- Public component APIs must remain typed and intentionally narrow.
- Accessibility requirements in approved specs are mandatory.

## Source of truth

For feature work:

1. The approved `spec.md` defines the required behavior.
2. The approved `plan.md` defines the implementation strategy.
3. The approved `tasks.md` defines the work units.

Do not silently change the behavior, architecture, or task scope.

If implementation reveals a conflict with an approved document, stop and report it.

## Implementation workflow

For each implementation task:

1. Read the relevant task.
2. Read the referenced spec and plan.
3. Inspect the existing repository before editing.
4. Make the smallest change that satisfies the task.
5. Run the required validation.
6. Report what changed and what was validated.

## Validation

For implementation tasks:

- run the repository TypeScript typecheck command once it exists
- run lint after code changes
- Run targeted tests during individual implementation tasks when the relevant test file exists.
- run the full automated test suite during final validation
- run the application production build during final validation
- run the Storybook static build during final validation
- report any validation that could not be executed

For final validation:

- verify every acceptance criterion in the approved spec
- inspect the dependency diff for unapproved packages
- inspect the file diff for changes outside the approved plan/task scope
- perform manual keyboard validation
- perform manual pointer validation
- perform light/dark visual review
- perform a screen-reader smoke test

Do not claim validation passed unless it was actually executed successfully.

## Permissions and approval gates

Agents may proceed without additional approval for:

- implementing an approved task
- modifying files explicitly expected by the approved plan
- adding or updating tests
- adding or updating Storybook stories
- fixing lint or type errors caused by the current task

Agents must stop and request approval before:

- adding a runtime dependency
- changing the public API beyond the approved plan
- modifying an unrelated shared primitive
- introducing a new architectural pattern
- expanding the V1 scope
- changing the approved spec or plan
- performing a large unrelated refactor

## Scope discipline

Do not implement features outside the approved V1 scope.

Do not refactor unrelated code unless required to complete the approved task.

If an improvement is useful but not required, report it separately instead of implementing it.

## Reporting

At the end of a task, report:

- task completed
- files created or modified
- validation executed
- validation results
- blockers or unresolved issues
- any deviation from the approved plan