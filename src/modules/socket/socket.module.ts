import { Global, Module } from '@nestjs/common';
import { ClientsSocketService } from './clients.socket.service';
import { SocketController } from './socket.controller';
import { AuthModule } from '../auth/auth.module';
import { VisitsModule } from '../visits/visits.module';
import ClientsGateway from './clients.gateway';

@Global()
@Module({
  imports: [AuthModule, VisitsModule],
  controllers: [SocketController],
  providers: [ClientsSocketService, ClientsGateway],
  exports: [ClientsSocketService]
})
export class SocketModule {}
