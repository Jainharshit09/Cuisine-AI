
/* eslint-disable @typescript-eslint/ban-ts-comment */

// pages/api/socket.ts
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

// Allow extending Node HTTP server to store the Socket.IO server
type NextApiResponseWithSocket = {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

export const config = {
  api: { bodyParser: false },
};

function socketHandler(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('🔌 Initializing new Socket.IO server...');

    const io = new IOServer(res.socket.server, {
      path: '/api/socketio',
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
}

export async function GET(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function POST(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function PUT(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function DELETE(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function PATCH(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function OPTIONS(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}

export async function HEAD(request: Request) {
  // @ts-ignore
  socketHandler((request as any).res);
  return new Response(null, { status: 200 });
}
