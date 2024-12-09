import { applyDecorators, UseGuards } from '@nestjs/common'
import { UserRole } from 'prisma/__generated__'

import { AuthGuard } from '../guard/auth.guard'
import { RolesGuard } from '../guard/roles.guard'

import { Roles } from './roles.decorator'

export function Authorization(...roles: UserRole[]) {
	if (roles.length > 0) {
		return applyDecorators(
			Roles(...roles),
			UseGuards(RolesGuard, AuthGuard)
		)
	}

	return applyDecorators(UseGuards(AuthGuard))
}
