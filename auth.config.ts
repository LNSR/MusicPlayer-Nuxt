export default defineNuxtConfig({
  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:3000/api/auth', // Use your actual external URL here
    provider: { /* your provider config */ },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    }
  }
})