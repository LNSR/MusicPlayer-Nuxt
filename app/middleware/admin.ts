import { useAuthSession } from '@/composables/useAuthSession';
export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.client) {
        await useAuthSession().refresh();
        if (useAuthSession().authenticated.value === false) {
            return navigateTo('/');
        }
    }
});