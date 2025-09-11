import { getCookie } from 'h3';
import { AuthUtils } from '@@/server/utils/auth.utils';
export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'session');

  if (sessionToken) {
    return await AuthUtils.trySession(sessionToken);
  }
  return { authenticated: false, user: null };
});