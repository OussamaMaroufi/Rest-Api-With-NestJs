import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './guard/roles.guard';
import { JwtStrategy } from './strategy';

@Module({
  //PASS TO IT A SECRET AND EXP - CUSTOMEZE IT IN AUTH SERVICE
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    //THat is mean we can access it where ever we want 
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
