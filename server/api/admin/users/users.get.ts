import { UserService } from '~/server/service/users/users'

export default defineEventHandler(async (event) => {
  const userService = new UserService();
  const allUsers = await userService.getAllUsers();
  return allUsers;
});