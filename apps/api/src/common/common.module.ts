import { Global, Module } from "@nestjs/common";
import { TaskQueueService } from "./services/task-queue.service";
import { TokenService } from "./services/token.service";

@Global()
@Module({
  providers: [TokenService, TaskQueueService],
  exports: [TokenService, TaskQueueService],
})
export class CommonModule {}
