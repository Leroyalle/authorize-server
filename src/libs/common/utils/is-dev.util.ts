import { ConfigService } from '@nestjs/config'

export const isDev = (ConfigService: ConfigService) =>
	ConfigService.getOrThrow<string>('NODE_ENV') === 'development'

export const IS_DEV_ENV = process.env.NODE_ENV === 'development'
