import { sendError } from "h3";
import type { H3Event } from "h3";
import { z } from "zod";
import { UserService, UserSessionService } from "~/server/service/users/users";

const roleSchema = z.object({
  role: z.enum(["SUPERADMIN", "ADMIN", "VISITOR"]),
});

export default async function (event: H3Event) {
  const userService = new UserService();
  const userSessionService = new UserSessionService();
  const session = await userSessionService.getSessionUser(event);
  if (!session || session.role !== "SUPERADMIN") {
    return sendError(
      event,
      createError({ statusCode: 403, statusMessage: "Forbidden" })
    );
  }

  const userId = Number(event.context.params?.userId);
  if (isNaN(userId)) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid user ID" })
    );
  }

  const body = await readBody(event);
  const parse = roleSchema.safeParse(body);
  if (!parse.success) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid role" })
    );
  }

  try {
    const updated = await userService.updateUserRole(userId, parse.data.role);
    return { success: true, user: updated };
  } catch (err) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Failed to update role" })
    );
  }
}
