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

## Context loading

Before implementing a task:

1. Read the current task completely.
2. Read the approved spec and plan referenced by that task.
3. Inspect only the repository files relevant to the task before editing.
4. Reuse existing patterns, components, tokens, and utilities when they exist.
5. Do not load or modify unrelated areas of the repository without a clear reason.
6. If required context is missing or contradictory, stop and report the gap before implementation.


## Tool usage

Agents may use available repository tools to:

- read and search files relevant to the current task
- edit files explicitly required by the approved task or plan
- run approved repository commands
- inspect Git status and diffs

Agents must not use tools to:

- modify unrelated files
- install unapproved dependencies
- rewrite Git history
- perform deployment actions
- access or modify secrets
- bypass approval gates defined in this file

Tool use must remain scoped to the current approved task.


## Implementation workflow (Defining the workflow / Loop)

For every implementation task:

1. Read
   - Read the current task completely.
   - Read the approved spec and plan referenced by the task.
   - Read relevant repository rules.

2. Understand
   - Inspect the existing implementation and related repository patterns.
   - Identify the smallest valid change.
   - Confirm that the task can be completed without changing approved scope or architecture.

3. Change
   - Modify only the files required by the current approved task.
   - Reuse existing patterns, components, tokens, and utilities when available.
   - Do not implement unrelated improvements.

4. Validate
   - Run the validation required for the current task.
   - Fix failures caused by the current change.
   - Do not hide, skip, or ignore failed validation.

5. Report
   - Report files created or modified.
   - Report validation executed and results.
   - Report blockers, skipped validation, or deviations.


## Retry behavior in a loop (rules to Agent don´t get stuck forever at some point something happen)

If validation fails:

- first determine whether the failure was introduced by the current task
- fix failures caused by the current task
- re-run the relevant validation
- if repeated attempts reveal a conflict with the approved spec, plan, or architecture, stop and report instead of expanding scope