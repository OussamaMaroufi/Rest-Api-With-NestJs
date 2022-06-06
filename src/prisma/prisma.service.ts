import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });

    
  }
//This methode to clean our db evry time we run  a test we use transactional methode to make a delete in order avpoid prisma to make some optimisation  
  cleanDB(){
    return this.$transaction([
      this.bookmark.deleteMany(),
      this.user.deleteMany()
    ])
  }
}
