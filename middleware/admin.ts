import { getCookie, sendRedirect } from 'h3'
import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useRequestEvent } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    const event = useRequestEvent()
    if (!event) {
      return navigateTo('/auth/login')
    }
    const sessionId = getCookie(event, 'session_id')
    if (!sessionId) {
      return sendRedirect(event, '/auth/login')
    }

    // Use server API to validate admin session
    const res = await $fetch('/api/admin/session/user', {
      headers: { cookie: event.node.req.headers.cookie || '' }
    }).catch(() => null)

    if (!res || !res.isAdmin) {
      return sendRedirect(event, '/auth/login')
    }
  }
})