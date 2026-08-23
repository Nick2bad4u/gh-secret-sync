<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# 📜 Changelog

## ✨ What's Changed

- <b>Commit Range: ➡️</b> [`v1.0.2...74e0b11`](https://github.com/Nick2bad4u/gh-secret-sync/compare/v1.0.2...74e0b111f3940f353db68d5b7a10f128a11243bd "View full commit range on GitHub")

### 🛠️ Bug Fixes

- [`497827a`](https://github.com/Nick2bad4u/gh-secret-sync/commit/497827a2c524516cc15f19bda3090180369d933b "Diff: 42 files, +19060 | -20179") — 🐛 [fix] Harden secret sync execution and quality gates&nbsp;<sub><em>(42&nbsp;files,&nbsp;+19060,&nbsp;-20179)</em></sub>
    - 🐛 [fix] Keep secret values on stdin for gh secret set, reject reserved GITHUB_ names, preserve inline NAME=value input, and trust only explicit GitHub CLI paths.
    - 🚜 [refactor] Replace mixed return types and stale bridge modules with strict readonly result flows, safer plan parsing, and a single awaitable process entry point.
    - 🧪 [test] Migrate to Vitest with 108 CLI, GitHub invocation, help, styling, CSV, JSON, and failure-path tests; enforce 90% per-file coverage.
    - 🧹 [chore] Align Node 22/24/26 and npm 12 policy, modernize shared lint/config dependencies, remove vulnerable transitive packages, and harden native asset smoke tests.
    - 🎨 [style] Resolve HTML and CSS diagnostics while preserving the responsive documentation experience.

### 🧹 Chores

- [`1f1653e`](https://github.com/Nick2bad4u/gh-secret-sync/commit/1f1653e3cb9a6642859be8c731a8ab4179e42357 "Diff: 1 file, +13 | -13") — *(tooling)* Run package CLIs through npx&nbsp;<sub><em>(1&nbsp;file,&nbsp;+13,&nbsp;-13)</em></sub>
    - Apply the local package-script migration so mapped package CLIs resolve through npx, while standardizing Actionlint configuration and removing redundant wrappers where applicable.

- [`24c7225`](https://github.com/Nick2bad4u/gh-secret-sync/commit/24c72252519eb8a7cddf3bd9c21c351295c54763 "Diff: 35 files, +28431 | -2832") — *(tooling)* Adopt shared package configs&nbsp;<sub><em>(35&nbsp;files,&nbsp;+28431,&nbsp;-2832)</em></sub>
    - Migrate lint, formatting, documentation, and dependency tooling to the maintained shared presets.
    - Preserve the GitHub CLI extension behavior while keeping heavyweight duplicate and link checks outside lint:all.

### 👷 CI/CD

- [`74e0b11`](https://github.com/Nick2bad4u/gh-secret-sync/commit/74e0b111f3940f353db68d5b7a10f128a11243bd "Diff: 5 files, +97 | -49") — 👷 [ci] Harden verification and release automation&nbsp;<sub><em>(5&nbsp;files,&nbsp;+97,&nbsp;-49)</em></sub>
    - 👷 [ci] Run the full release gate in CI, upload per-file coverage through Codecov OIDC, and update pinned Actions to current immutable SHAs.
    - 🔒️ [ci] Install dependencies without lifecycle scripts, rebuild only allowlisted native packages, and remove the release verification bypass.
    - 📦️ [ci] Verify the downloaded Windows Node runtime, smoke-test native assets, publish SHA256SUMS, and atomically push the release commit and tag.
    - 🧹 [chore] Add repository ownership metadata and tighten Pages and CodeQL job limits.

- [`befdf7a`](https://github.com/Nick2bad4u/gh-secret-sync/commit/befdf7aacc143eed095a703e2edbc11e819e4d55 "Diff: 1 file, +3 | -2") — 👷 [ci] Bound Dependabot npm updates&nbsp;<sub><em>(1&nbsp;file,&nbsp;+3,&nbsp;-2)</em></sub>

- [`71ba10d`](https://github.com/Nick2bad4u/gh-secret-sync/commit/71ba10d089a7d108ea8880c5a3b19761ec643d17 "Diff: 1 file, +1 | -1") — Update Dependabot auto-merge workflow pin&nbsp;<sub><em>(1&nbsp;file,&nbsp;+1,&nbsp;-1)</em></sub>

- [`19a2db6`](https://github.com/Nick2bad4u/gh-secret-sync/commit/19a2db69b2ea664285582fd4a4e830b798a7166c "Diff: 8 files, +72 | -13") — Add Dependabot auto-merge workflow&nbsp;<sub><em>(8&nbsp;files,&nbsp;+72,&nbsp;-13)</em></sub>

### 📦 Dependencies

- [`cf02ba3`](https://github.com/Nick2bad4u/gh-secret-sync/commit/cf02ba31a06e1aec65c65bb045b19bc95a9c43cf "Diff: 2 files, +115 | -115") — ⬆️ [build] Update npm_and_yarn dependencies&nbsp;<sub><em>(2&nbsp;files,&nbsp;+115,&nbsp;-115)</em></sub>

- [`1178f22`](https://github.com/Nick2bad4u/gh-secret-sync/commit/1178f22f75c080fa9bf9e949f837f7b91e8e3220 "Diff: 1 file, +10 | -10") — ⬆️ [build] Update npm_and_yarn dependencies&nbsp;<sub><em>(1&nbsp;file,&nbsp;+10,&nbsp;-10)</em></sub>

- [`1cc816b`](https://github.com/Nick2bad4u/gh-secret-sync/commit/1cc816ba89b0becb30543b9ca301492845b5ca48 "Diff: 1 file, +3 | -3") — ⬆️ [build] Update npm_and_yarn dependencies&nbsp;<sub><em>(1&nbsp;file,&nbsp;+3,&nbsp;-3)</em></sub>

- [`297ca86`](https://github.com/Nick2bad4u/gh-secret-sync/commit/297ca86d808ddac0c72d412d9f025e28d531fb17 "Diff: 1 file, +16 | -32") — ⬆️ [build] Update npm_and_yarn dependencies&nbsp;<sub><em>(1&nbsp;file,&nbsp;+16,&nbsp;-32)</em></sub>

- [`67a9710`](https://github.com/Nick2bad4u/gh-secret-sync/commit/67a971006379f12f927c892367c6d9de8e7d3c99 "Diff: 6 files, +239 | -171") — *(deps)* [dependency] Update dependency group&nbsp;<sub><em>(6&nbsp;files,&nbsp;+239,&nbsp;-171)</em></sub>
    - Bumps the dependabot-all group with 35 updates:
    - | Package | From | To |
| --- | --- | --- |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node) | `25.9.3` | `26.0.1` |
| [eslint](https://github.com/eslint/eslint) | `10.4.1` | `10.6.0` |
| [globals](https://github.com/sindresorhus/globals) | `17.6.0` | `17.7.0` |
| [prettier](https://github.com/prettier/prettier) | `3.8.3` | `3.9.1` |
| [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-eslint) | `8.61.0` | `8.62.0` |
| [@augment-vir/assert](https://github.com/electrovir/augment-vir) | `31.73.0` | `31.73.2` |
| [@augment-vir/common](https://github.com/electrovir/augment-vir) | `31.73.0` | `31.73.2` |
| [@augment-vir/core](https://github.com/electrovir/augment-vir) | `31.73.0` | `31.73.2` |
| [@date-vir/duration](https://github.com/electrovir/date-vir) | `8.3.2` | `8.6.1` |
| [@reteps/dockerfmt](https://github.com/reteps/dockerfmt/tree/HEAD/js) | `0.5.2` | `0.5.4` |
| [@types/estree](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/estree) | `1.0.8` | `1.0.9` |
| [@types/luxon](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/luxon) | `3.7.1` | `3.7.2` |
| [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/eslint-plugin) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/project-service](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/project-service) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/scope-manager](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/scope-manager) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/tsconfig-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/tsconfig-utils) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/type-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/type-utils) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/types](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/types) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-estree) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/utils) | `8.61.0` | `8.62.0` |
| [@typescript-eslint/visitor-keys](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/visitor-keys) | `8.61.0` | `8.62.0` |
| [acorn](https://github.com/acornjs/acorn) | `8.16.0` | `8.17.0` |
| [brace-expansion](https://github.com/juliangruber/brace-expansion) | `5.0.5` | `5.0.7` |
| [comment-parser](https://github.com/yavorskiy/comment-parser) | `1.4.6` | `1.4.7` |
| [deepcopy-esm](https://github.com/electrovir/deepcopy-esm) | `2.1.1` | `2.1.2` |
| [expect-type](https://github.com/mmkal/expect-type) | `1.3.0` | `1.4.0` |
| [proxy-vir](https://github.com/electrovir/proxy-vir) | `2.0.2` | `2.0.3` |
| [semver](https://github.com/npm/node-semver) | `7.7.4` | `7.8.5` |
| [sort-package-json](https://github.com/keithamus/sort-package-json) | `3.6.1` | `3.7.1` |
| [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) | `15.7.3` | `15.8.2` |
| [tinyglobby](https://github.com/SuperchupuDev/tinyglobby) | `0.2.16` | `0.2.17` |
| [type-fest](https://github.com/sindresorhus/type-fest) | `5.6.0` | `5.7.0` |
| [typed-event-target](https://github.com/electrovir/typed-event-target) | `4.3.0` | `4.3.1` |
| [undici-types](https://github.com/nodejs/undici) | `7.24.6` | `8.3.0` |
    - Updates `@types/node` from 25.9.3 to 26.0.1
- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/node)
    - Updates `eslint` from 10.4.1 to 10.6.0
- [Release notes](https://github.com/eslint/eslint/releases)
- [Commits](https://github.com/eslint/eslint/compare/v10.4.1...v10.6.0)
    - Updates `globals` from 17.6.0 to 17.7.0
- [Release notes](https://github.com/sindresorhus/globals/releases)
- [Commits](https://github.com/sindresorhus/globals/compare/v17.6.0...v17.7.0)
    - Updates `prettier` from 3.8.3 to 3.9.1
- [Release notes](https://github.com/prettier/prettier/releases)
- [Changelog](https://github.com/prettier/prettier/blob/main/CHANGELOG.md)
- [Commits](https://github.com/prettier/prettier/compare/3.8.3...3.9.1)
    - Updates `typescript-eslint` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-eslint/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/typescript-eslint)
    - Updates `@augment-vir/assert` from 31.73.0 to 31.73.2
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.73.0...v31.73.2)
    - Updates `@augment-vir/common` from 31.73.0 to 31.73.2
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.73.0...v31.73.2)
    - Updates `@augment-vir/core` from 31.73.0 to 31.73.2
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.73.0...v31.73.2)
    - Updates `@date-vir/duration` from 8.3.2 to 8.6.1
- [Release notes](https://github.com/electrovir/date-vir/releases)
- [Commits](https://github.com/electrovir/date-vir/compare/v8.3.2...v8.6.1)
    - Updates `@reteps/dockerfmt` from 0.5.2 to 0.5.4
- [Release notes](https://github.com/reteps/dockerfmt/releases)
- [Commits](https://github.com/reteps/dockerfmt/commits/v0.5.4/js)
    - Updates `@types/estree` from 1.0.8 to 1.0.9
- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/estree)
    - Updates `@types/luxon` from 3.7.1 to 3.7.2
- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/luxon)
    - Updates `@typescript-eslint/eslint-plugin` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/eslint-plugin)
    - Updates `@typescript-eslint/parser` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/parser)
    - Updates `@typescript-eslint/project-service` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/project-service/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/project-service)
    - Updates `@typescript-eslint/scope-manager` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/scope-manager/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/scope-manager)
    - Updates `@typescript-eslint/tsconfig-utils` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/tsconfig-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/tsconfig-utils)
    - Updates `@typescript-eslint/type-utils` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/type-utils)
    - Updates `@typescript-eslint/types` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/types/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/types)
    - Updates `@typescript-eslint/typescript-estree` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-estree/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/typescript-estree)
    - Updates `@typescript-eslint/utils` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/utils)
    - Updates `@typescript-eslint/visitor-keys` from 8.61.0 to 8.62.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/visitor-keys/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.62.0/packages/visitor-keys)
    - Updates `acorn` from 8.16.0 to 8.17.0
- [Commits](https://github.com/acornjs/acorn/compare/8.16.0...8.17.0)
    - Updates `brace-expansion` from 5.0.5 to 5.0.7
- [Release notes](https://github.com/juliangruber/brace-expansion/releases)
- [Commits](https://github.com/juliangruber/brace-expansion/compare/v5.0.5...v5.0.7)
    - Updates `comment-parser` from 1.4.6 to 1.4.7
- [Changelog](https://github.com/syavorsky/comment-parser/blob/main/CHANGELOG.md)
- [Commits](https://github.com/yavorskiy/comment-parser/commits/v1.4.7)
    - Updates `deepcopy-esm` from 2.1.1 to 2.1.2
- [Release notes](https://github.com/electrovir/deepcopy-esm/releases)
- [Commits](https://github.com/electrovir/deepcopy-esm/compare/v2.1.1...v2.1.2)
    - Updates `expect-type` from 1.3.0 to 1.4.0
- [Release notes](https://github.com/mmkal/expect-type/releases)
- [Commits](https://github.com/mmkal/expect-type/compare/v1.3.0...v1.4.0)
    - Updates `proxy-vir` from 2.0.2 to 2.0.3
- [Release notes](https://github.com/electrovir/proxy-vir/releases)
- [Commits](https://github.com/electrovir/proxy-vir/compare/v2.0.2...v2.0.3)
    - Updates `semver` from 7.7.4 to 7.8.5
- [Release notes](https://github.com/npm/node-semver/releases)
- [Changelog](https://github.com/npm/node-semver/blob/main/CHANGELOG.md)
- [Commits](https://github.com/npm/node-semver/compare/v7.7.4...v7.8.5)
    - Updates `sort-package-json` from 3.6.1 to 3.7.1
- [Release notes](https://github.com/keithamus/sort-package-json/releases)
- [Commits](https://github.com/keithamus/sort-package-json/compare/v3.6.1...v3.7.1)
    - Updates `sql-formatter` from 15.7.3 to 15.8.2
- [Release notes](https://github.com/sql-formatter-org/sql-formatter/releases)
- [Commits](https://github.com/sql-formatter-org/sql-formatter/compare/v15.7.3...v15.8.2)
    - Updates `tinyglobby` from 0.2.16 to 0.2.17
- [Release notes](https://github.com/SuperchupuDev/tinyglobby/releases)
- [Changelog](https://github.com/SuperchupuDev/tinyglobby/blob/main/CHANGELOG.md)
- [Commits](https://github.com/SuperchupuDev/tinyglobby/compare/0.2.16...0.2.17)
    - Updates `type-fest` from 5.6.0 to 5.7.0
- [Release notes](https://github.com/sindresorhus/type-fest/releases)
- [Commits](https://github.com/sindresorhus/type-fest/compare/v5.6.0...v5.7.0)
    - Updates `typed-event-target` from 4.3.0 to 4.3.1
- [Release notes](https://github.com/electrovir/typed-event-target/releases)
- [Commits](https://github.com/electrovir/typed-event-target/compare/v4.3.0...v4.3.1)
    - Updates `undici-types` from 7.24.6 to 8.3.0
- [Release notes](https://github.com/nodejs/undici/releases)
- [Commits](https://github.com/nodejs/undici/compare/v7.24.6...v8.3.0)
[dependabot][all](deps): [dependency] Update dependency group
    - Bumps the dependabot-all group with 2 updates: [actions/checkout](https://github.com/actions/checkout) and [softprops/action-gh-release](https://github.com/softprops/action-gh-release).
    - Updates `actions/checkout` from 6.0.3 to 7.0.0
- [Release notes](https://github.com/actions/checkout/releases)
- [Changelog](https://github.com/actions/checkout/blob/main/CHANGELOG.md)
- [Commits](https://github.com/actions/checkout/compare/df4cb1c069e1874edd31b4311f1884172cec0e10...9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0)
    - Updates `softprops/action-gh-release` from 3.0.0 to 3.0.1
- [Release notes](https://github.com/softprops/action-gh-release/releases)
- [Changelog](https://github.com/softprops/action-gh-release/blob/master/CHANGELOG.md)
- [Commits](https://github.com/softprops/action-gh-release/compare/b4309332981a82ec1c5618f44dd2e27cc8bfbfda...718ea10b132b3b2eba29c1007bb80653f286566b)
    - ---
updated-dependencies:
- dependency-name: "@types/node"
  dependency-version: 26.0.1
  dependency-type: direct:development
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: eslint
  dependency-version: 10.6.0
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: globals
  dependency-version: 17.7.0
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: prettier
  dependency-version: 3.9.1
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: typescript-eslint
  dependency-version: 8.62.0
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/assert"
  dependency-version: 31.73.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/common"
  dependency-version: 31.73.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/core"
  dependency-version: 31.73.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@date-vir/duration"
  dependency-version: 8.6.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@reteps/dockerfmt"
  dependency-version: 0.5.4
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@types/estree"
  dependency-version: 1.0.9
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@types/luxon"
  dependency-version: 3.7.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/eslint-plugin"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/parser"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/project-service"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/scope-manager"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/tsconfig-utils"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/type-utils"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/types"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/typescript-estree"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/utils"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/visitor-keys"
  dependency-version: 8.62.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: acorn
  dependency-version: 8.17.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: brace-expansion
  dependency-version: 5.0.7
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: comment-parser
  dependency-version: 1.4.7
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: deepcopy-esm
  dependency-version: 2.1.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: expect-type
  dependency-version: 1.4.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: proxy-vir
  dependency-version: 2.0.3
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: semver
  dependency-version: 7.8.5
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: sort-package-json
  dependency-version: 3.7.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: sql-formatter
  dependency-version: 15.8.2
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: tinyglobby
  dependency-version: 0.2.17
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: type-fest
  dependency-version: 5.7.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: typed-event-target
  dependency-version: 4.3.1
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: undici-types
  dependency-version: 8.3.0
  dependency-type: indirect
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: actions/checkout
  dependency-version: 7.0.0
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: softprops/action-gh-release
  dependency-version: 3.0.1
  dependency-type: direct:production
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
...

- [`4c1a749`](https://github.com/Nick2bad4u/gh-secret-sync/commit/4c1a7497cf4eaf149cc770e5bc7577bcbef49af5 "Diff: 2 files, +109 | -109") — Bump esbuild in the npm_and_yarn group across 1 directory&nbsp;<sub><em>(2&nbsp;files,&nbsp;+109,&nbsp;-109)</em></sub>
    - Bumps the npm_and_yarn group with 1 update in the / directory: [esbuild](https://github.com/evanw/esbuild).
    - Updates `esbuild` from 0.28.0 to 0.28.1
- [Release notes](https://github.com/evanw/esbuild/releases)
- [Changelog](https://github.com/evanw/esbuild/blob/main/CHANGELOG.md)
- [Commits](https://github.com/evanw/esbuild/compare/v0.28.0...v0.28.1)
    - ---
updated-dependencies:
- dependency-name: esbuild
  dependency-version: 0.28.1
  dependency-type: direct:development
  dependency-group: npm_and_yarn
...

### 🛡️ Security

- [`90d718e`](https://github.com/Nick2bad4u/gh-secret-sync/commit/90d718e7d9eaf4fa166ba23da8b91d2f641f7987 "Diff: 5 files, +125 | -132") — 👷 [ci] Use shared workflow callers&nbsp;<sub><em>(5&nbsp;files,&nbsp;+125,&nbsp;-132)</em></sub>
    - 👷 [ci] Switches the Dependabot auto-merge caller to workflow-templates@main and replaces local security and maintenance workflows with shared reusable callers.
    - ⬆️ [build] Updates eslint-config-nick2bad4u to the published caller override version and records any peer dependency needed for the shared ESLint config to load.

### 🛠️ Other Changes

- [`c413cbb`](https://github.com/Nick2bad4u/gh-secret-sync/commit/c413cbb4e3b42fcb050dfc5c879d2a75d1b07587 "Diff: 2 files, +109 | -109") — Merge PR #5&nbsp;<sub><em>(2&nbsp;files,&nbsp;+109,&nbsp;-109)</em></sub>
    - [dependency] Update esbuild 0.28.1 in the npm_and_yarn group across 1 directory

## ✨ What's Changed in v1.0.2

- <b>Commit Range: ➡️</b> [`v1.0.1...v1.0.2`](https://github.com/Nick2bad4u/gh-secret-sync/compare/v1.0.1...v1.0.2 "View full commit range on GitHub")

### 🧹 Chores

- [`b3f0ca9`](https://github.com/Nick2bad4u/gh-secret-sync/commit/b3f0ca9cdf2614248c71d33a6289a24afffac67f "Diff: 2 files, +3 | -3") — Release v1.0.2&nbsp;<sub><em>(2&nbsp;files,&nbsp;+3,&nbsp;-3)</em></sub>

> [!NOTE]
> **Release comparison**: https://github.com/Nick2bad4u/gh-secret-sync/compare/v1.0.1...v1.0.2

## ✨ What's Changed in v1.0.1

- <b>Commit Range: ➡️</b> [`4bff010...v1.0.1`](https://github.com/Nick2bad4u/gh-secret-sync/compare/4bff010cf4f176a7081011f25e9792ea864a8437...v1.0.1 "View full commit range on GitHub")

### ✨ Features

- [`ac8d04c`](https://github.com/Nick2bad4u/gh-secret-sync/commit/ac8d04c89e65aab3708fea82945a7379a2da9b92 "Diff: 2 files, +1 | -1") — ✨ [feat] Add google site verification file&nbsp;<sub><em>(2&nbsp;files,&nbsp;+1,&nbsp;-1)</em></sub>

- [`81660b5`](https://github.com/Nick2bad4u/gh-secret-sync/commit/81660b5a796044567cfeb9b9f66f4ee12ec85826 "Diff: 1 file, +1 | -0") — ✨ [feat] Add google site verification file&nbsp;<sub><em>(1&nbsp;file,&nbsp;+1,&nbsp;-0)</em></sub>

- [`4001014`](https://github.com/Nick2bad4u/gh-secret-sync/commit/4001014b4ecb5c16c920d2f86bea609c5dcf6659 "Diff: 14 files, +1621 | -1927") — ✨ [feat] Add sync-secrets script and enhance CLI tests&nbsp;<sub><em>(14&nbsp;files,&nbsp;+1621,&nbsp;-1927)</em></sub>

### 🛠️ Bug Fixes

- [`f3d2664`](https://github.com/Nick2bad4u/gh-secret-sync/commit/f3d2664093a2a0763597daf4372a6f138a946b05 "Diff: 5 files, +756 | -104") — *(release)* Build binary gh extension assets&nbsp;<sub><em>(5&nbsp;files,&nbsp;+756,&nbsp;-104)</em></sub>
    - 🐛 [fix] Add a Node SEA asset builder so releases attach Linux and Windows binary extension artifacts instead of relying on script-clone installs.
    - 👷 [build] Wire the release workflow to build linux-amd64 and windows-amd64 assets and upload them with the GitHub release.
    - ➕ [build] Add esbuild as the bundler used by the asset build script.

### 🚜 Refactor

- [`c3de075`](https://github.com/Nick2bad4u/gh-secret-sync/commit/c3de075a495ac3cf7826b68c6314fe22c302cc88 "Diff: 5 files, +319 | -233") — 🚜 [refactor] Simplifies secret target handling&nbsp;<sub><em>(5&nbsp;files,&nbsp;+319,&nbsp;-233)</em></sub>
    - 🚜 Breaks secret collection and repo/org operation assembly into focused helpers, reducing branching in the execution path.
 - 🛠️ Rejects repeated version flags and broadens secret-name validation to better match CLI input.
 - 📝 Modernizes docs-site browser usage and tidies Sonar config formatting.

### 📝 Documentation

- [`7169e45`](https://github.com/Nick2bad4u/gh-secret-sync/commit/7169e45fc5562a23c01fb188eaff05e048a7b33c "Diff: 4 files, +720 | -99") — 📝 [docs] Refreshes landing page branding&nbsp;<sub><em>(4&nbsp;files,&nbsp;+720,&nbsp;-99)</em></sub>
    - ✨ Expands the site with clearer onboarding, feature highlights, and copyable usage examples for safer secret syncing.
- 📝 Adds richer SEO, social preview, canonical, and analytics metadata to improve discoverability and sharing.
- 🎨 Refreshes the logo and social card visuals to match the updated product message.

### 🎨 Styling

- [`84f35f3`](https://github.com/Nick2bad4u/gh-secret-sync/commit/84f35f3611847b7e05c3d4b356cfe340bb450596 "Diff: 6 files, +655 | -657") — 🎨 [style] Normalize markdown formatting&nbsp;<sub><em>(6&nbsp;files,&nbsp;+655,&nbsp;-657)</em></sub>
    - 🎨 [style] Apply the repository Prettier rules to Markdown guidance and documentation files so release verification passes cleanly.

- [`ebba73c`](https://github.com/Nick2bad4u/gh-secret-sync/commit/ebba73c2727540b71ca86607fc32d9043d7a6245 "Diff: 7 files, +122 | -108") — 🎨 Update Docusaurus assets and configs&nbsp;<sub><em>(7&nbsp;files,&nbsp;+122,&nbsp;-108)</em></sub>
    - 🔧 Update VSCode extension recommendations
- 🔧 Adjust cliff.toml configuration
- 🔥 Remove legacy commitlint.config.mjs
- 🖼️ Replace favicon and update existing logo assets
- ➕ Add full set of new logo sizes (16–512px)
- 📝 Add AGENTS.md documentation page

- [`0fc13b1`](https://github.com/Nick2bad4u/gh-secret-sync/commit/0fc13b13718811156e09402ed39f87d0f7a39a87 "Diff: 10 files, +1430 | -30") — 🎨 Update Docusaurus assets and configs&nbsp;<sub><em>(10&nbsp;files,&nbsp;+1430,&nbsp;-30)</em></sub>
    - 🔧 Update VSCode extension recommendations
- 🔧 Adjust cliff.toml configuration
- 🔥 Remove legacy commitlint.config.mjs
- 🖼️ Replace favicon and update existing logo assets
- ➕ Add full set of new logo sizes (16–512px)
- 📝 Add AGENTS.md documentation page

- [`db0f80a`](https://github.com/Nick2bad4u/gh-secret-sync/commit/db0f80ab79642d9946f6e0ca4131c5f65781b776 "Diff: 1 file, +1 | -1") — 🎨 [style] Update comment formatting in sonar.properties&nbsp;<sub><em>(1&nbsp;file,&nbsp;+1,&nbsp;-1)</em></sub>

### 🧹 Chores

- [`aaadbe3`](https://github.com/Nick2bad4u/gh-secret-sync/commit/aaadbe3d59cd47a31c53fc22aea408a6e9bd2f92 "Diff: 2 files, +3 | -3") — Release v1.0.1&nbsp;<sub><em>(2&nbsp;files,&nbsp;+3,&nbsp;-3)</em></sub>

- [`0022d9e`](https://github.com/Nick2bad4u/gh-secret-sync/commit/0022d9eecfb8ba1d61728127e678f0902811580a "Diff: 6 files, +123 | -171") — Update github agent instruction paths&nbsp;<sub><em>(6&nbsp;files,&nbsp;+123,&nbsp;-171)</em></sub>

- [`a627f53`](https://github.com/Nick2bad4u/gh-secret-sync/commit/a627f53aab3edfde0ac7b7e68005e640e9961128 "Diff: 1 file, +0 | -1") — Stop ignoring mdx in prettierignore&nbsp;<sub><em>(1&nbsp;file,&nbsp;+0,&nbsp;-1)</em></sub>

- [`cfb1316`](https://github.com/Nick2bad4u/gh-secret-sync/commit/cfb131648ab38513b7e61a81593584c396befa78 "Diff: 1 file, +0 | -7") — Stop ignoring markdown files in prettierignore&nbsp;<sub><em>(1&nbsp;file,&nbsp;+0,&nbsp;-7)</em></sub>

### 👷 CI/CD

- [`f80e093`](https://github.com/Nick2bad4u/gh-secret-sync/commit/f80e0937132a71fec268c4ea2a3f26520bfc28ea "Diff: 1 file, +45 | -0") — 👷 [ci] Add SonarCloud analysis config&nbsp;<sub><em>(1&nbsp;file,&nbsp;+45,&nbsp;-0)</em></sub>
    - 👷 [ci] Limits analysis to source and test roots while excluding generated output, dependencies, caches, and duplicate bridge files
- 👷 [ci] Leaves coverage reporting optional until an lcov report is available

### 📦 Dependencies

- [`cd8a907`](https://github.com/Nick2bad4u/gh-secret-sync/commit/cd8a907144401fca755d53bc1829bea245dc3112 "Diff: 7 files, +192 | -146") — Merge PR #4&nbsp;<sub><em>(7&nbsp;files,&nbsp;+192,&nbsp;-146)</em></sub>
    - [dependabot][all](deps): [dependency] Update dependency group across multiple ecosystems

### 🛡️ Security

- [`fa6f043`](https://github.com/Nick2bad4u/gh-secret-sync/commit/fa6f043d93822f691cc4b3c45d4d58aeb878006f "Diff: 7 files, +192 | -146") — *(deps)* [dependency] Update dependency group&nbsp;<sub><em>(7&nbsp;files,&nbsp;+192,&nbsp;-146)</em></sub>
    - Bumps the dependabot-all group with 4 updates: [step-security/harden-runner](https://github.com/step-security/harden-runner), [github/codeql-action](https://github.com/github/codeql-action), [actions/dependency-review-action](https://github.com/actions/dependency-review-action) and [gitleaks/gitleaks-action](https://github.com/gitleaks/gitleaks-action).
    - Updates `step-security/harden-runner` from 2.19.0 to 2.19.4
- [Release notes](https://github.com/step-security/harden-runner/releases)
- [Commits](https://github.com/step-security/harden-runner/compare/8d3c67de8e2fe68ef647c8db1e6a09f647780f40...9af89fc71515a100421586dfdb3dc9c984fbf411)
    - Updates `github/codeql-action` from 4.35.2 to 4.36.0
- [Release notes](https://github.com/github/codeql-action/releases)
- [Changelog](https://github.com/github/codeql-action/blob/main/CHANGELOG.md)
- [Commits](https://github.com/github/codeql-action/compare/95e58e9a2cdfd71adc6e0353d5c52f41a045d225...7211b7c8077ea37d8641b6271f6a365a22a5fbfa)
    - Updates `actions/dependency-review-action` from 4.9.0 to 5.0.0
- [Release notes](https://github.com/actions/dependency-review-action/releases)
- [Commits](https://github.com/actions/dependency-review-action/compare/2031cfc080254a8a887f58cffee85186f0e49e48...a1d282b36b6f3519aa1f3fc636f609c47dddb294)
    - Updates `gitleaks/gitleaks-action` from 2.3.9 to 3.0.0
- [Release notes](https://github.com/gitleaks/gitleaks-action/releases)
- [Commits](https://github.com/gitleaks/gitleaks-action/compare/ff98106e4c7b2bc287b24eaf42907196329070c7...e0c47f4f8be36e29cdc102c57e68cb5cbf0e8d1e)
[dependabot][all](deps): [dependency] Update dependency group
    - Bumps the dependabot-all group with 27 updates:
    - | Package | From | To |
| --- | --- | --- |
| [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node) | `25.6.0` | `25.9.1` |
| [eslint](https://github.com/eslint/eslint) | `10.2.1` | `10.4.1` |
| [globals](https://github.com/sindresorhus/globals) | `17.5.0` | `17.6.0` |
| [prettier-plugin-jsdoc](https://github.com/hosseinmd/prettier-plugin-jsdoc) | `1.8.0` | `1.8.1` |
| [prettier-plugin-multiline-arrays](https://github.com/electrovir/prettier-plugin-multiline-arrays) | `4.1.7` | `4.1.8` |
| [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-eslint) | `8.59.1` | `8.60.0` |
| [@augment-vir/assert](https://github.com/electrovir/augment-vir) | `31.68.4` | `31.71.3` |
| [@augment-vir/common](https://github.com/electrovir/augment-vir) | `31.68.4` | `31.71.3` |
| [@augment-vir/core](https://github.com/electrovir/augment-vir) | `31.68.4` | `31.71.3` |
| [@eslint/config-helpers](https://github.com/eslint/rewrite/tree/HEAD/packages/config-helpers) | `0.5.5` | `0.6.0` |
| [@eslint/plugin-kit](https://github.com/eslint/rewrite/tree/HEAD/packages/plugin-kit) | `0.7.1` | `0.7.2` |
| [@types/estree](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/estree) | `1.0.8` | `1.0.9` |
| [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/eslint-plugin) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/project-service](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/project-service) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/scope-manager](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/scope-manager) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/tsconfig-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/tsconfig-utils) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/type-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/type-utils) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/types](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/types) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-estree) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/utils) | `8.59.1` | `8.60.0` |
| [@typescript-eslint/visitor-keys](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/visitor-keys) | `8.59.1` | `8.60.0` |
| [brace-expansion](https://github.com/juliangruber/brace-expansion) | `5.0.5` | `5.0.6` |
| [comment-parser](https://github.com/yavorskiy/comment-parser) | `1.4.6` | `1.4.7` |
| [semver](https://github.com/npm/node-semver) | `7.7.4` | `7.8.1` |
| [sql-formatter](https://github.com/sql-formatter-org/sql-formatter) | `15.7.3` | `15.8.0` |
| [undici-types](https://github.com/nodejs/undici) | `7.19.2` | `7.24.6` |
    - Updates `@types/node` from 25.6.0 to 25.9.1
- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/node)
    - Updates `eslint` from 10.2.1 to 10.4.1
- [Release notes](https://github.com/eslint/eslint/releases)
- [Commits](https://github.com/eslint/eslint/compare/v10.2.1...v10.4.1)
    - Updates `globals` from 17.5.0 to 17.6.0
- [Release notes](https://github.com/sindresorhus/globals/releases)
- [Commits](https://github.com/sindresorhus/globals/compare/v17.5.0...v17.6.0)
    - Updates `prettier-plugin-jsdoc` from 1.8.0 to 1.8.1
- [Release notes](https://github.com/hosseinmd/prettier-plugin-jsdoc/releases)
- [Changelog](https://github.com/fardad-dev/prettier-plugin-jsdoc/blob/master/CHANGELOG.md)
- [Commits](https://github.com/hosseinmd/prettier-plugin-jsdoc/commits)
    - Updates `prettier-plugin-multiline-arrays` from 4.1.7 to 4.1.8
- [Release notes](https://github.com/electrovir/prettier-plugin-multiline-arrays/releases)
- [Commits](https://github.com/electrovir/prettier-plugin-multiline-arrays/compare/v4.1.7...v4.1.8)
    - Updates `typescript-eslint` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-eslint/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/typescript-eslint)
    - Updates `@augment-vir/assert` from 31.68.4 to 31.71.3
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.68.4...v31.71.3)
    - Updates `@augment-vir/common` from 31.68.4 to 31.71.3
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.68.4...v31.71.3)
    - Updates `@augment-vir/core` from 31.68.4 to 31.71.3
- [Release notes](https://github.com/electrovir/augment-vir/releases)
- [Commits](https://github.com/electrovir/augment-vir/compare/v31.68.4...v31.71.3)
    - Updates `@eslint/config-helpers` from 0.5.5 to 0.6.0
- [Release notes](https://github.com/eslint/rewrite/releases)
- [Changelog](https://github.com/eslint/rewrite/blob/main/packages/config-helpers/CHANGELOG.md)
- [Commits](https://github.com/eslint/rewrite/commits/core-v0.6.0/packages/config-helpers)
    - Updates `@eslint/plugin-kit` from 0.7.1 to 0.7.2
- [Release notes](https://github.com/eslint/rewrite/releases)
- [Changelog](https://github.com/eslint/rewrite/blob/main/packages/plugin-kit/CHANGELOG.md)
- [Commits](https://github.com/eslint/rewrite/commits/plugin-kit-v0.7.2/packages/plugin-kit)
    - Updates `@types/estree` from 1.0.8 to 1.0.9
- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)
- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/estree)
    - Updates `@typescript-eslint/eslint-plugin` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/eslint-plugin)
    - Updates `@typescript-eslint/parser` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/parser)
    - Updates `@typescript-eslint/project-service` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/project-service/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/project-service)
    - Updates `@typescript-eslint/scope-manager` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/scope-manager/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/scope-manager)
    - Updates `@typescript-eslint/tsconfig-utils` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/tsconfig-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/tsconfig-utils)
    - Updates `@typescript-eslint/type-utils` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/type-utils)
    - Updates `@typescript-eslint/types` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/types/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/types)
    - Updates `@typescript-eslint/typescript-estree` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-estree/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/typescript-estree)
    - Updates `@typescript-eslint/utils` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/utils)
    - Updates `@typescript-eslint/visitor-keys` from 8.59.1 to 8.60.0
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/visitor-keys/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.60.0/packages/visitor-keys)
    - Updates `brace-expansion` from 5.0.5 to 5.0.6
- [Release notes](https://github.com/juliangruber/brace-expansion/releases)
- [Commits](https://github.com/juliangruber/brace-expansion/compare/v5.0.5...v5.0.6)
    - Updates `comment-parser` from 1.4.6 to 1.4.7
- [Changelog](https://github.com/syavorsky/comment-parser/blob/main/CHANGELOG.md)
- [Commits](https://github.com/yavorskiy/comment-parser/commits/v1.4.7)
    - Updates `semver` from 7.7.4 to 7.8.1
- [Release notes](https://github.com/npm/node-semver/releases)
- [Changelog](https://github.com/npm/node-semver/blob/main/CHANGELOG.md)
- [Commits](https://github.com/npm/node-semver/compare/v7.7.4...v7.8.1)
    - Updates `sql-formatter` from 15.7.3 to 15.8.0
- [Release notes](https://github.com/sql-formatter-org/sql-formatter/releases)
- [Commits](https://github.com/sql-formatter-org/sql-formatter/compare/v15.7.3...v15.8.0)
    - Updates `undici-types` from 7.19.2 to 7.24.6
- [Release notes](https://github.com/nodejs/undici/releases)
- [Commits](https://github.com/nodejs/undici/compare/v7.19.2...v7.24.6)
    - ---
updated-dependencies:
- dependency-name: step-security/harden-runner
  dependency-version: 2.19.4
  dependency-type: direct:production
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: github/codeql-action
  dependency-version: 4.36.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: actions/dependency-review-action
  dependency-version: 5.0.0
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: gitleaks/gitleaks-action
  dependency-version: 3.0.0
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: "@types/node"
  dependency-version: 25.9.1
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: eslint
  dependency-version: 10.4.1
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: globals
  dependency-version: 17.6.0
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: prettier-plugin-jsdoc
  dependency-version: 1.8.1
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: prettier-plugin-multiline-arrays
  dependency-version: 4.1.8
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: typescript-eslint
  dependency-version: 8.60.0
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/assert"
  dependency-version: 31.71.3
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/common"
  dependency-version: 31.71.3
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@augment-vir/core"
  dependency-version: 31.71.3
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@eslint/config-helpers"
  dependency-version: 0.6.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@eslint/plugin-kit"
  dependency-version: 0.7.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@types/estree"
  dependency-version: 1.0.9
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/eslint-plugin"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/parser"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/project-service"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/scope-manager"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/tsconfig-utils"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/type-utils"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/types"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/typescript-estree"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/utils"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/visitor-keys"
  dependency-version: 8.60.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: brace-expansion
  dependency-version: 5.0.6
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: comment-parser
  dependency-version: 1.4.7
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: semver
  dependency-version: 7.8.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: sql-formatter
  dependency-version: 15.8.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: undici-types
  dependency-version: 7.24.6
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
...

- [`19ccba4`](https://github.com/Nick2bad4u/gh-secret-sync/commit/19ccba45e3760095dcd94e3c0bd0e382174653b1 "Diff: 7 files, +122 | -108") — *(deps)* [dependency] Update dependency group&nbsp;<sub><em>(7&nbsp;files,&nbsp;+122,&nbsp;-108)</em></sub>
    - Bumps the dependabot-all group with 19 updates:
    - | Package | From | To |
| --- | --- | --- |
| [eslint](https://github.com/eslint/eslint) | `10.2.0` | `10.2.1` |
| [prettier-plugin-multiline-arrays](https://github.com/electrovir/prettier-plugin-multiline-arrays) | `4.1.5` | `4.1.7` |
| [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-eslint) | `8.58.2` | `8.59.1` |
| [typescript](https://github.com/microsoft/TypeScript) | `6.0.2` | `6.0.3` |
| [@date-vir/duration](https://github.com/electrovir/date-vir) | `8.3.1` | `8.3.2` |
| [@humanfs/core](https://github.com/humanwhocodes/humanfs) | `0.19.1` | `0.19.2` |
| [@humanfs/node](https://github.com/humanwhocodes/humanfs/tree/HEAD/packages/node) | `0.16.7` | `0.16.8` |
| [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/eslint-plugin) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/project-service](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/project-service) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/scope-manager](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/scope-manager) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/tsconfig-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/tsconfig-utils) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/type-utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/type-utils) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/types](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/types) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/typescript-estree](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-estree) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/utils](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/utils) | `8.58.2` | `8.59.1` |
| [@typescript-eslint/visitor-keys](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/visitor-keys) | `8.58.2` | `8.59.1` |
| [ajv](https://github.com/ajv-validator/ajv) | `6.14.0` | `6.15.0` |
| [type-fest](https://github.com/sindresorhus/type-fest) | `5.5.0` | `5.6.0` |
    - Updates `eslint` from 10.2.0 to 10.2.1
- [Release notes](https://github.com/eslint/eslint/releases)
- [Commits](https://github.com/eslint/eslint/compare/v10.2.0...v10.2.1)
    - Updates `prettier-plugin-multiline-arrays` from 4.1.5 to 4.1.7
- [Release notes](https://github.com/electrovir/prettier-plugin-multiline-arrays/releases)
- [Commits](https://github.com/electrovir/prettier-plugin-multiline-arrays/compare/v4.1.5...v4.1.7)
    - Updates `typescript-eslint` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-eslint/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/typescript-eslint)
    - Updates `typescript` from 6.0.2 to 6.0.3
- [Release notes](https://github.com/microsoft/TypeScript/releases)
- [Commits](https://github.com/microsoft/TypeScript/compare/v6.0.2...v6.0.3)
    - Updates `@date-vir/duration` from 8.3.1 to 8.3.2
- [Release notes](https://github.com/electrovir/date-vir/releases)
- [Commits](https://github.com/electrovir/date-vir/compare/v8.3.1...v8.3.2)
    - Updates `@humanfs/core` from 0.19.1 to 0.19.2
- [Release notes](https://github.com/humanwhocodes/humanfs/releases)
- [Commits](https://github.com/humanwhocodes/humanfs/compare/core-v0.19.1...core-v0.19.2)
    - Updates `@humanfs/node` from 0.16.7 to 0.16.8
- [Release notes](https://github.com/humanwhocodes/humanfs/releases)
- [Changelog](https://github.com/humanwhocodes/humanfs/blob/main/packages/node/CHANGELOG.md)
- [Commits](https://github.com/humanwhocodes/humanfs/commits/node-v0.16.8/packages/node)
    - Updates `@typescript-eslint/eslint-plugin` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/eslint-plugin)
    - Updates `@typescript-eslint/parser` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/parser)
    - Updates `@typescript-eslint/project-service` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/project-service/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/project-service)
    - Updates `@typescript-eslint/scope-manager` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/scope-manager/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/scope-manager)
    - Updates `@typescript-eslint/tsconfig-utils` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/tsconfig-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/tsconfig-utils)
    - Updates `@typescript-eslint/type-utils` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/type-utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/type-utils)
    - Updates `@typescript-eslint/types` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/types/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/types)
    - Updates `@typescript-eslint/typescript-estree` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/typescript-estree/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/typescript-estree)
    - Updates `@typescript-eslint/utils` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/utils/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/utils)
    - Updates `@typescript-eslint/visitor-keys` from 8.58.2 to 8.59.1
- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)
- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/visitor-keys/CHANGELOG.md)
- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v8.59.1/packages/visitor-keys)
    - Updates `ajv` from 6.14.0 to 6.15.0
- [Release notes](https://github.com/ajv-validator/ajv/releases)
- [Commits](https://github.com/ajv-validator/ajv/compare/v6.14.0...v6.15.0)
    - Updates `type-fest` from 5.5.0 to 5.6.0
- [Release notes](https://github.com/sindresorhus/type-fest/releases)
- [Commits](https://github.com/sindresorhus/type-fest/compare/v5.5.0...v5.6.0)
[dependabot][all](deps): [dependency] Update dependency group
    - Bumps the dependabot-all group with 2 updates: [step-security/harden-runner](https://github.com/step-security/harden-runner) and [actions/setup-node](https://github.com/actions/setup-node).
    - Updates `step-security/harden-runner` from 2.18.0 to 2.19.0
- [Release notes](https://github.com/step-security/harden-runner/releases)
- [Commits](https://github.com/step-security/harden-runner/compare/6c3c2f2c1c457b00c10c4848d6f5491db3b629df...8d3c67de8e2fe68ef647c8db1e6a09f647780f40)
    - Updates `actions/setup-node` from 6.3.0 to 6.4.0
- [Release notes](https://github.com/actions/setup-node/releases)
- [Commits](https://github.com/actions/setup-node/compare/53b83947a5a98c8d113130e565377fae1a50d02f...48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e)
    - ---
updated-dependencies:
- dependency-name: eslint
  dependency-version: 10.2.1
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: prettier-plugin-multiline-arrays
  dependency-version: 4.1.7
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: typescript-eslint
  dependency-version: 8.59.1
  dependency-type: direct:development
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: typescript
  dependency-version: 6.0.3
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@date-vir/duration"
  dependency-version: 8.3.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@humanfs/core"
  dependency-version: 0.19.2
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@humanfs/node"
  dependency-version: 0.16.8
  dependency-type: indirect
  update-type: version-update:semver-patch
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/eslint-plugin"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/parser"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/project-service"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/scope-manager"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/tsconfig-utils"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/type-utils"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/types"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/typescript-estree"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/utils"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: "@typescript-eslint/visitor-keys"
  dependency-version: 8.59.1
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: ajv
  dependency-version: 6.15.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: type-fest
  dependency-version: 5.6.0
  dependency-type: indirect
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: step-security/harden-runner
  dependency-version: 2.19.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: actions/setup-node
  dependency-version: 6.4.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
...

- [`fdb6c57`](https://github.com/Nick2bad4u/gh-secret-sync/commit/fdb6c576c04d2d39ee0e4d42e0e78a618bcfbae7 "Diff: 6 files, +13 | -13") — *(deps)* [dependency] Update dependency group&nbsp;<sub><em>(6&nbsp;files,&nbsp;+13,&nbsp;-13)</em></sub>
    - Bumps the dependabot-all group with 8 updates:
    - | Package | From | To |
| --- | --- | --- |
| [step-security/harden-runner](https://github.com/step-security/harden-runner) | `2.14.2` | `2.18.0` |
| [github/codeql-action](https://github.com/github/codeql-action) | `4.32.4` | `4.35.2` |
| [actions/dependency-review-action](https://github.com/actions/dependency-review-action) | `4.8.3` | `4.9.0` |
| [actions/configure-pages](https://github.com/actions/configure-pages) | `5` | `6` |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact) | `3` | `5` |
| [actions/deploy-pages](https://github.com/actions/deploy-pages) | `4` | `5` |
| [actions/upload-artifact](https://github.com/actions/upload-artifact) | `4` | `7` |
| [softprops/action-gh-release](https://github.com/softprops/action-gh-release) | `2.6.2` | `3.0.0` |
    - Updates `step-security/harden-runner` from 2.14.2 to 2.18.0
- [Release notes](https://github.com/step-security/harden-runner/releases)
- [Commits](https://github.com/step-security/harden-runner/compare/v2.14.2...6c3c2f2c1c457b00c10c4848d6f5491db3b629df)
    - Updates `github/codeql-action` from 4.32.4 to 4.35.2
- [Release notes](https://github.com/github/codeql-action/releases)
- [Changelog](https://github.com/github/codeql-action/blob/main/CHANGELOG.md)
- [Commits](https://github.com/github/codeql-action/compare/89a39a4e59826350b863aa6b6252a07ad50cf83e...95e58e9a2cdfd71adc6e0353d5c52f41a045d225)
    - Updates `actions/dependency-review-action` from 4.8.3 to 4.9.0
- [Release notes](https://github.com/actions/dependency-review-action/releases)
- [Commits](https://github.com/actions/dependency-review-action/compare/05fe4576374b728f0c523d6a13d64c25081e0803...2031cfc080254a8a887f58cffee85186f0e49e48)
    - Updates `actions/configure-pages` from 5 to 6
- [Release notes](https://github.com/actions/configure-pages/releases)
- [Commits](https://github.com/actions/configure-pages/compare/v5...v6)
    - Updates `actions/upload-pages-artifact` from 3 to 5
- [Release notes](https://github.com/actions/upload-pages-artifact/releases)
- [Commits](https://github.com/actions/upload-pages-artifact/compare/v3...v5)
    - Updates `actions/deploy-pages` from 4 to 5
- [Release notes](https://github.com/actions/deploy-pages/releases)
- [Commits](https://github.com/actions/deploy-pages/compare/v4...v5)
    - Updates `actions/upload-artifact` from 4 to 7
- [Release notes](https://github.com/actions/upload-artifact/releases)
- [Commits](https://github.com/actions/upload-artifact/compare/v4...v7)
    - Updates `softprops/action-gh-release` from 2.6.2 to 3.0.0
- [Release notes](https://github.com/softprops/action-gh-release/releases)
- [Changelog](https://github.com/softprops/action-gh-release/blob/master/CHANGELOG.md)
- [Commits](https://github.com/softprops/action-gh-release/compare/3bb12739c298aeb8a4eeaf626c5b8d85266b0e65...b4309332981a82ec1c5618f44dd2e27cc8bfbfda)
    - ---
updated-dependencies:
- dependency-name: step-security/harden-runner
  dependency-version: 2.18.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: github/codeql-action
  dependency-version: 4.35.2
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: actions/dependency-review-action
  dependency-version: 4.9.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: dependabot-all
- dependency-name: actions/configure-pages
  dependency-version: '6'
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: actions/upload-pages-artifact
  dependency-version: '5'
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: actions/deploy-pages
  dependency-version: '5'
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: actions/upload-artifact
  dependency-version: '7'
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
- dependency-name: softprops/action-gh-release
  dependency-version: 3.0.0
  dependency-type: direct:production
  update-type: version-update:semver-major
  dependency-group: dependabot-all
...

### 🛠️ Other Changes

- [`4bff010`](https://github.com/Nick2bad4u/gh-secret-sync/commit/4bff010cf4f176a7081011f25e9792ea864a8437 "Diff: 65 files, +10351 | -0") — Initial commit&nbsp;<sub><em>(65&nbsp;files,&nbsp;+10351,&nbsp;-0)</em></sub>

### New Contributors
* @github-actions[bot] made their first contribution
* @Nick2bad4u made their first contribution
* @dependabot[bot] made their first contribution

## ⭐ Contributors
Thanks to anyone who has 🧑‍💻 [contributed](https://github.com/Nick2bad4u/gh-secret-sync/graphs/contributors).

*This changelog was automatically generated with ⛰️ [git-cliff](https://github.com/orhun/git-cliff).*
