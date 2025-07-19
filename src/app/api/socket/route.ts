// pages/api/socket.ts
import { Server as IOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Allow extending Node HTTP server to store the Socket.IO server
type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing new Socket.IO server...');

    const io = new IOServer(res.socket.server, {
      path: '/api/socketio', // optional, use a custom path
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('⚡ New client connected:', socket.id);

      socket.on('cooking-assistance', (data) => {
        const step = data?.step ?? '?';
        socket.emit('suggestion', {
          message: `Step ${step}: Try adding salt or a substitute.`,
        });
      });
    });
  } else {
    console.log('🟢 Reusing existing Socket.IO server');
  }

  res.end();
}
