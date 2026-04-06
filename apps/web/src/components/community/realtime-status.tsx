"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Status = "connecting" | "connected" | "reconnecting" | "offline";

export function RealtimeStatus() {
  const [status, setStatus] = useState<Status>("connecting");

  const socket: Socket | null = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const origin =
      process.env.NEXT_PUBLIC_API_ORIGIN ?? process.env.NEXT_PUBLIC_WS_ORIGIN ?? "http://localhost:4000";

    return io(origin, {
      path: "/ws",
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 30_000,
    });
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConnect = () => {
      setStatus("connected");
      socket.emit("rooms.subscribe", {
        categories: ["physics", "chemistry", "mathematics"],
      });
    };
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleDisconnect = () => setStatus("offline");

    socket.on("connect", handleConnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("disconnect", handleDisconnect);
      socket.close();
    };
  }, [socket]);

  return (
    <div className={`realtime-pill realtime-${status}`}>
      <span className="realtime-dot" />
      <span>{status}</span>
    </div>
  );
}
