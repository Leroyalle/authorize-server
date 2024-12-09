import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import { Request, Response } from 'express'
import { AuthMethod, User } from 'prisma/__generated__'
import { UserService } from 'src/user/user.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	public constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {}
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

	public async login(req: Request, dto: LoginDto) {
		const findUser = await this.userService.findByEmail(dto.email)

		if (!findUser || !findUser.password) {
			throw new NotFoundException(
				'Пользователь не найден. Проверьте введенные данные.'
			)
		}

		const isValidPassword = await verify(findUser.password, dto.password)

		if (!isValidPassword) {
			throw new UnauthorizedException(
				'Неверный логин или пароль. Попробуйте еще раз или восстановите пароль.'
			)
		}

		return this.saveSession(req, findUser)
	}

	public async logout(req: Request, res: Response): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось выйти из аккаунта. Возникла проблема на сервере или сессия уже была завершена.'
						)
					)
				}
				res.clearCookie(
					this.configService.getOrThrow<string>('SESSION_NAME')
				)
				resolve()
			})
		})
	}

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
