import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Dynamic in production
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('joinPipeline')
  handleJoinPipeline(@ConnectedSocket() client: Socket) {
    client.join('pipeline');
    console.log(`Client ${client.id} joined 'pipeline' room`);
    return { event: 'joinedRoom', room: 'pipeline' };
  }

  notifyDealUpdated(deal: any) {
    this.server.to('pipeline').emit('dealUpdated', deal);
    console.log(`Broadcasted dealUpdated event for Deal ID: ${deal.id}`);
  }
}
