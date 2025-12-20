import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UserModule } from './modules/user/user.module';
import { ContentModule } from './modules/content/content.module';
import { IslandModule } from './modules/island/island.module';
import { NotificationModule } from './modules/notification/notification.module';
import { CommentModule } from './modules/comment/comment.module';
import { SearchModule } from './modules/search/search.module';
import { CoinModule } from './modules/coin/coin.module';
import { CreatorModule } from './modules/creator/creator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ContentModule,
    IslandModule,
    NotificationModule,
    CommentModule,
    SearchModule,
    CoinModule,
    CreatorModule,
    UploadModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

