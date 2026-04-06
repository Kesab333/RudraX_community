import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { readAppEnv } from "../../common/config/app-env";
import { TokenService } from "../../common/services/token.service";

@WebSocketGateway({
  cors: {
    origin: readAppEnv().appOrigin,
    credentials: true,
  },
  path: "/ws",
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly tokenService: TokenService) {}

  handleConnection(client: Socket): void {
    const token =
      typeof client.handshake.auth?.token === "string"
        ? client.handshake.auth.token
        : undefined;

    if (token) {
      try {
        const user = this.tokenService.verifyAccessToken(token);
        client.data.user = user;
        client.join(`user:${user.id}`);
        this.server.to(`user:${user.id}`).emit("user.presence.changed", {
          userId: user.id,
          status: "online",
          at: new Date().toISOString(),
        });
      } catch {
        client.disconnect(true);
      }
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.user?.id;

    if (userId) {
      this.server.to(`user:${userId}`).emit("user.presence.changed", {
        userId,
        status: "offline",
        at: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage("rooms.subscribe")
  subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { postIds?: string[]; categories?: string[] },
  ) {
    for (const postId of body.postIds ?? []) {
      client.join(`post:${postId}`);
    }

    for (const category of body.categories ?? []) {
      client.join(`category:${category}`);
    }

    return { subscribed: true };
  }

  @SubscribeMessage("typing.set")
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { postId: string; typing: boolean },
  ) {
    const userId = client.data.user?.id;

    if (!userId) {
      return { ignored: true };
    }

    this.server.to(`post:${body.postId}`).emit("user.typing.changed", {
      postId: body.postId,
      userId,
      typing: body.typing,
      at: new Date().toISOString(),
    });

    return { ok: true };
  }

  emitToPost(postId: string, eventName: string, payload: object): void {
    this.server.to(`post:${postId}`).emit(eventName, payload);
  }

  emitToUser(userId: string, eventName: string, payload: object): void {
    this.server.to(`user:${userId}`).emit(eventName, payload);
  }
}
