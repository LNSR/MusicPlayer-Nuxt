import { UserService } from "~/server/service/users/users";
export default defineEventHandler(async (event) => {
  const userService = new UserService();
  const roleOptions = await userService.getRoleOptions();
  return roleOptions.map(role => role.role);
});