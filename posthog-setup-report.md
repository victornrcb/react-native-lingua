<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your Lingua Expo language-learning app. PostHog is initialised via `src/lib/posthog.ts` using `expo-constants` to read the project token and host from `app.config.js` extras (populated from `.env`). The `PostHogProvider` and a `ClerkPostHogSync` component are wired in `src/app/_layout.tsx` so that every screen is tracked automatically and authenticated Clerk users are identified in PostHog on mount. Ten business events are captured across the five core user flows — onboarding, authentication (email and OAuth), language selection, home-screen engagement, and learning progress.

| Event | Description | File |
|---|---|---|
| `onboarding_get_started` | User taps the Get Started button on the onboarding screen, entering the sign-up funnel. | `src/app/onboarding.tsx` |
| `user_signed_up` | User successfully completes account creation via email verification code. | `src/app/(auth)/sign-up.tsx` |
| `oauth_sign_up_completed` | User completes an OAuth registration flow (Google, Facebook, or Apple) from the sign-up screen. | `src/app/(auth)/sign-up.tsx` |
| `user_signed_in` | User successfully signs in via email verification code. | `src/app/(auth)/sign-in.tsx` |
| `oauth_sign_in_completed` | User completes an OAuth login flow (Google, Facebook, or Apple) from the sign-in screen. | `src/app/(auth)/sign-in.tsx` |
| `language_selected` | User confirms their chosen learning language on the language selection screen. | `src/app/language-select.tsx` |
| `lesson_continued` | User taps the Continue button on the home screen banner to continue their current lesson. | `src/app/(tabs)/home.tsx` |
| `plan_item_tapped` | User taps a Today's Plan activity item on the home screen. | `src/app/(tabs)/home.tsx` |
| `xp_earned` | User earns XP points, indicating active learning engagement. | `src/store/useProgressStore.ts` |
| `lesson_completed` | User completes a lesson, the primary outcome metric for the app. | `src/store/useProgressStore.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics (wizard):** https://eu.posthog.com/project/208783/dashboard/825461
- **Signup funnel (wizard):** https://eu.posthog.com/project/208783/insights/z1MkCBtF
- **Sign-ups over time (wizard):** https://eu.posthog.com/project/208783/insights/jieQqvkV
- **Language popularity (wizard):** https://eu.posthog.com/project/208783/insights/r50GJD5i
- **Lesson completions over time (wizard):** https://eu.posthog.com/project/208783/insights/ZCDU6bQk
- **Daily active learners (wizard):** https://eu.posthog.com/project/208783/insights/GOcYYAkL

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add the exact PostHog env var names (`POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`) to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
