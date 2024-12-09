import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { IS_DEV_ENV } from './libs/common/utils/is-dev.util'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		})
	]
})
export class AppModule {}
