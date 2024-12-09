import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { Authorization } from 'src/auth/decorators/auth.decorator'
import { Authorized } from 'src/auth/decorators/authorized.decorator'

import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Authorization()
	@Get('/profile')
	@HttpCode(HttpStatus.OK)
	public async findProfile(@Authorized('id') userId: string) {
		return this.userService.findById(userId)
	}
}
