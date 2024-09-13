## Commit Message Format

We follow semantic/conventional commits spec for how Git commit messages must be formatted.
This format leads to **easier to read commit history**.

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: listings|swap|quote|buy-cover|etc.
  │
  └─⫸ Commit Type: chore|docs|feat|fix|refactor|test|style|etc.
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

##### Type

Must be one of the following:

- **feat**: A new feature or enhancement to the product (new feature for the user, not a new feature for build script)
- **fix**: A bug fix (bug fix for the user, not a fix to a build script)
- **docs**: Documentation only changes
- **style**: Changes that do not impact production code behaviour (white-space, formatting, linting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature - restructuring or reorganizing the code without changing its external behavior (refactoring production code, eg. renaming a variable)
- **test**: Adding missing tests or correcting existing tests (no production code change)
- **chore**: Necessary technical tasks to take care of the product or repository, not related to any specific feature or user story. These tasks are like routine maintenance, such as releasing the product or updating code for the repository (e.g. updating ci, build scripts etc; no production code change)
- **build**: The commit introduces a change that affect the build system or external dependencies.
- **ci**: The commit involves changes to the continuous integration (CI) configuration or scripts used to automate build, testing, and deployment processes.
- **perf**: The commit introduces a change that affect the build system or external dependencies.
- **revert**: The commit introduces a change that affect the build system or external dependencies.
##### Scope (optional)

The scope should be specifying the module affected by the commit change (as perceived by the person reading the changelog generated from commit messages).
For example `listings`, `swap`, `quote`, `buy-cover`, etc.


##### Summary

It should convey what the code changes do, rather than how they were implemented. It is not necessary to provide every detail in the description; instead, focus on the high-level overview of the modifications.


Use the summary field to provide a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end


### Example

```
feat(listings): add new listing logo
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: feat, fix, docs, style, refactor, test or chore.
```
