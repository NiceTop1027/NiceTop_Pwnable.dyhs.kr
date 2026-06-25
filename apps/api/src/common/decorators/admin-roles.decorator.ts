import { Role } from '@prisma/client';
import { Roles } from './roles.decorator';

export const AdminRoles = () => Roles(Role.OWNER, Role.ADMIN);
export const StaffRoles = () => Roles(Role.OWNER, Role.ADMIN, Role.MODERATOR);