import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { API_VERSION_PREFIX } from "@rudrax/shared";
import { AppModule } from "./app.module";
import { readAppEnv } from "./common/config/app-env";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { IdempotencyInterceptor } from "./common/interceptors/idempotency.interceptor";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { PrismaService } from "./prisma/prisma.service";

async function bootstrap(): Promise<void> {
  const env = readAppEnv();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_VERSION_PREFIX.replace(/^\//, ""), {
    exclude: ["health", "ready", "live"],
  });
  app.enableCors({
    origin: env.appOrigin,
    credentials: true,
  });
  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TimeoutInterceptor(),
    new IdempotencyInterceptor(app.get(Reflector), app.get(PrismaService)),
  );

  const server = await app.listen(4000);

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully.`);
    await app.close();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
}

void bootstrap();
