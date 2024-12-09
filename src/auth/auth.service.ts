import {
	ConflictException,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common'
import { Request } from 'express'
import { AuthMethod, User } from 'prisma/__generated__'
import { UserService } from 'src/user/user.service'

import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	public constructor(private readonly userService: UserService) {}
	public async register(req: Request, dto: RegisterDto) {
		const isExists = await this.userService.findByEmail(dto.email)
		if (isExists) {
			throw new ConflictException(
				'Не удалось зарегестрироваться. Пользователь с таким email уже зарегистрирован'
			)
		}

		const createdUser = await this.userService.create(
			dto.email,
			dto.password,
			dto.name,
			'',
			AuthMethod.CREDENTIALS,
			false
		)

		return this.saveSession(req, createdUser)
	}

	public async login() {}

	public async logout() {}

	public async saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id
			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию. Попробуйте позже'
						)
					)
				}
				resolve({ user })
			})
		})
	}
}
