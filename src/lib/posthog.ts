import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

const projectToken = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined;
const host = (Constants.expoConfig?.extra?.posthogHost as string) || 'https://eu.i.posthog.com';
const isPostHogConfigured = !!projectToken && projectToken !== 'phc_your_project_token_here';

if (!isPostHogConfigured && __DEV__) {
  console.warn(
    '[PostHog] Project token not configured. Set POSTHOG_PROJECT_TOKEN in .env to enable analytics.'
  );
}

export const posthog = new PostHog(projectToken || 'placeholder_key', {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  debug: __DEV__,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});
