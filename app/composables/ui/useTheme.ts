/**
 * Theme composable that handles SSR-safe theme detection and toggling
 * @returns {Object} Theme utilities with preference and toggle function
 */
export const useTheme = () => {
  const colorMode = useColorMode();
  const isHydrated = ref(false);

  // Use a consistent default for SSR, update on client mount
  const preference = computed(() => {
    // During SSR or before hydration, use a default
    if (import.meta.server || !isHydrated.value) return 'dark';
    return colorMode.value;
  });

  const toggle = () => {
    const newValue = colorMode.value === 'dark' ? 'light' : 'dark';
    colorMode.value = newValue;
    colorMode.preference = newValue;
  };

  // Update preference on client mount to match actual user preference
  onMounted(() => {
    isHydrated.value = true;
    // Force reactivity update after hydration
    colorMode.value = colorMode.preference || 'dark';
  });

  return {
    preference,
    toggle,
    isHydrated: computed(() => isHydrated.value),
  };
};