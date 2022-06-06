import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  //Make it accessible  outside from other module 
  exports:[PrismaService]
})
export class PrismaModule {}
