import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "./common/common.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { MaintenanceModeMiddleware } from "./common/middleware/maintenance-mode.middleware";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { AttachmentsModule } from "./modules/attachments/attachments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { HealthModule } from "./modules/health/health.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PostsModule } from "./modules/posts/posts.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { SearchModule } from "./modules/search/search.module";
import { ShareModule } from "./modules/share/share.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    AttachmentsModule,
    NotificationsModule,
    SearchModule,
    ModerationModule,
    LeaderboardModule,
    ShareModule,
    RealtimeModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware, MaintenanceModeMiddleware).forRoutes("*");
  }
}
