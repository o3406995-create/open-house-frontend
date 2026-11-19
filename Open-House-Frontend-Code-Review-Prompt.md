# Open House Frontend — Code Review Prompt

Pull requests merge into `main`. Review only the diff from `main` to the head branch. Do not use `develop` or another feature branch as the base. Do not edit files. Report findings only.

Stack: Vite 7, React 19, TypeScript, React Router 7, Redux Toolkit, Tailwind CSS 4 with `@westpac/style-config`. There is no test script and no test files. Do not ask for Jest, and do not claim tests passed.

## Project checks

Check these when the diff touches them:

- Routes are registered in `src/main.tsx` inside `App`. Current routes: `/` (`SearchPage`), `/properties/:externalId` (`PropertyDetailsPage`), `/agents` (`FindAgents`), `/my-open-houses` (`MyOpenHouses`), `/saved-properties` (`SavedProperties`), `/contact-us` (`ContactUs`), `/login` (`LoginPage`), `/register` (`RegisterPage`). Search, property details, agents, my open houses, and saved properties use `ProtectedRoute`. Login, register, and contact us are public. Find Agents, My Open Houses, Saved Properties, and Contact Us are placeholders. A new link to a route that is not registered is a finding. A route or response change is compatible unless the pull request states a breaking change.
- `ProtectedRoute` waits for `useGetCurrentUserQuery`, then redirects to `/login` with `state.from`. `getRedirectTarget` in `src/utils/authRedirect.ts` accepts only a same-site path that starts with `/` and does not start with `//`.
- Authentication is the HttpOnly cookie `token`. Every API call uses `credentials: "include"`. Login and register store the user with `setUser`. Logout calls `POST /api/auth/logout`, then `clearUser`, even when the request fails. Do not store the token, password, or session in `localStorage` or `sessionStorage`. A 401 from `src/api/client.ts` may clear `USER_KEY` only.
- Keep the two existing clients. `src/api/client.ts` serves `src/api/auth.ts`: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`. RTK Query serves `GET /users/me` in `src/store/authApi.ts`, and `POST /properties/search` plus `GET /properties/:externalId` in `src/store/propertiesApi.ts`. A new endpoint extends the client that already owns that area. It uses `VITE_API_BASE_URL` and `credentials: "include"`. A hardcoded API host is a finding. User-facing errors go through `getApiErrorMessage` in `src/api/errors.ts`.
- Browser config is only `VITE_*`, injected by `vite.config.ts`. `development` reads `env/local.env`. Modes `dev`, `sit`, and `uat` read `env/dev.env`, `env/sit.env`, and `env/uat.env`. A `VITE_*` process variable overrides the file. `env/local.env` stays uncommitted. Committed env files contain no secrets. The parser treats `null` as the string `"null"`. `VITE_API_BASE_URL` is a real origin or absent.
- `VITE_GOOGLE_MAPS_API_KEY` is a public browser key. An empty key shows the map placeholder. The keyless map renders only when `import.meta.env.DEV` is true and `VITE_GOOGLE_MAPS_KEYLESS_DEV` is `"true"`. A production build must not enable it. Address lookup stays in `src/services/addressService.ts`.
- `ContentLayout` wraps `Outlet` once in `src/App.tsx`. Pages do not wrap themselves in it. The grid is 4 columns by default and 12 from `sm`, with `px-4` at every width.
- Navbar links are hidden below `md`. The hamburger has `aria-expanded`, `aria-controls`, and an accessible name. Navbar search renders for a logged-in user, off `/`, at `min-[1400px]`. Navigation and logout close the menu.
- `@westpac/style-config` sets `sm` 768px, `md` 992px, `lg` 1200px, `xl` 1584px. The spacing unit is `0.375rem`, so `px-4` is 24px.
- Forms use `react-hook-form`. Use `Button`, `Input`, `Label`, and the other primitives in `src/components/ui` when one already fits. Do not change a `src/components/ui` primitive for one screen. Merge classes with `cn` from `src/lib/utils.ts`. Inputs have labels. Icon-only buttons have an accessible name. Do not render unsanitized HTML.

## Code quality

Apply these to changed lines. A miss is LOW unless it duplicates auth, routing, or an API contract, which is MEDIUM.

- **Where code goes.** Pages go in `src/pages` and are registered in `src/main.tsx`. Search UI goes in `src/components/search`. Property UI goes in `src/components/property`. Shared chrome goes in `src/layouts`. HTTP goes in `src/api`. Server state goes in `src/store`. Address lookup goes in `src/services`. Pure functions go in `src/utils`. One component does one job. A file that mixes the request, the mapping, and a large render is split.
- **Types.** Auth payloads stay in `src/api/types.ts`. Property DTOs stay beside `src/store/propertiesApi.ts` and are imported from there. A component props type is a local `interface`, named after the component, in that component file. A type used by one feature stays in that feature file. Props, form values, and hook arguments have an explicit type. Do not add `any`. Do not assert a type to hide an unknown API shape.
- **Constants.** Copy, routes, and repeated numbers for a screen live in that screen's file under `src/common/constants`: `loginPageConstant.ts`, `registerPageConstant.ts`, `searchPageConstant.ts`, `navbarConstants.ts`, `propertyDetailsConstant.ts`. A new screen adds one file and exports it from `src/common/constants/index.ts`. Callers import from `@/common/constants`. A value that already exists in one of these files is reused. A value used once stays beside the code. A new constant that only renames a single-use string is a finding.
- **Reuse.** Extract a component or helper when a second caller needs the same behavior. A one-caller implementation stays in its page or component. Copying a component to change a label is a finding. A change to a shared component that breaks another caller is a finding.
- **Hooks.** Components read Redux through `useAppDispatch` and `useAppSelector` from `src/store/hooks.ts`. Those two stay in that file. Stateful logic used by two or more components goes in `src/hooks/useName.ts`. A hook returns data and handlers, follows the Rules of Hooks, and does not return JSX. Logic used by one component stays in that component. An effect that subscribes or fetches cleans up or aborts. A new request uses the existing RTK Query endpoint instead of a second fetch in `useEffect`.
- **State.** Server data lives in RTK Query. Screen-only state stays in the component. The signed-in user lives in `authSlice`. The same server payload is not copied into both local state and the query cache.
- **Async UI.** A new request shows a loading state, an empty state, and an error state the user can retry.
- **Names.** Components and types are nouns. Hooks start with `use`. Handlers start with `handle`. A rendered list uses a stable id as `key`. Shared imports use the `@` alias.
- **Diff hygiene.** Changed lines contain no `console.log`, commented-out code, or unused exports.

## Severity

- **HIGH:** leaked secret, auth or session bypass, open redirect, stored token, broken route or API contract, or a production build that calls the wrong API or enables the keyless map.
- **MEDIUM:** a behavior, validation, loading, error, or layout bug a user can hit, or duplicated auth, routing, or API-contract logic.
- **LOW:** a type, constant, hook placement, naming, accessibility, or clarity fix in the changed lines.

Every finding needs a file path, a line number, the impact, and a minimal fix. Do not report code the diff does not change. Do not claim lint, typecheck, or tests passed.

## Output

**Code Review:** [branch-name]

### Summary

What changed, which areas were reviewed, and that tests were not run.

### HIGH

1. [Title]
   - **File:** `src/path/file.tsx:line`
   - **Issue:** [What the changed code does]
   - **Impact:** [Why it matters]
   - **Suggested fix:** [Smallest correction]

None identified, if there are no findings.

### MEDIUM

1. [Title]
   - **File:** `src/path/file.tsx:line`
   - **Issue:** [What the changed code does]
   - **Suggested fix:** [Smallest correction]

None identified, if there are no findings.

### LOW

1. [Title]
   - **File:** `src/path/file.tsx:line`
   - **Suggestion:** [Optional improvement]

None identified, if there are no findings.

### What looks good

- [Observation from the diff]

### Action items

| Priority | Item | File |
|---|---|---|
| HIGH / MEDIUM / LOW | [Action] | `src/path/file.tsx:line` |

No action items, if there are no findings.

### Review limitations

- **Diff reviewed:** `main` to [head]
- **Tests:** not run
- **Not inspected:** [areas left unread]
