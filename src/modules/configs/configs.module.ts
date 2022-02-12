import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.stage.${process.env.STAGE}`]
    })]
})
export default class ConfigsModule {}
