import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { getRedisClient } from '../utils/redis';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
}

let io: SocketIOServer;

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

export const initializeWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { id: string; role: UserRole };

      socket.userId = decoded.id;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store connection
    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);

      // Join user-specific room
      socket.join(`user:${socket.userId}`);

      // If driver, join driver pool
      if (socket.userRole === 'DRIVER') {
        socket.join('drivers');
      }
    }

    // Handle driver location updates
    socket.on('driver:location:update', async (data: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
    }) => {
      if (socket.userRole !== 'DRIVER' || !socket.userId) return;

      try {
        // Update driver location in database
        await prisma.driverProfile.update({
          where: { userId: socket.userId },
          data: {
            currentLatitude: data.latitude,
            currentLongitude: data.longitude,
            lastLocationUpdate: new Date(),
          },
        });

        // Find active ride
        const activeRide = await prisma.ride.findFirst({
          where: {
            driverId: socket.userId,
            status: {
              in: ['ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'],
            },
          },
        });

        if (activeRide) {
          // Save tracking data
          await prisma.rideTracking.create({
            data: {
              rideId: activeRide.id,
              latitude: data.latitude,
              longitude: data.longitude,
              speed: data.speed,
              heading: data.heading,
            },
          });

          // Broadcast location to rider
          io.to(`user:${activeRide.riderId}`).emit('driver:location', {
            rideId: activeRide.id,
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
            heading: data.heading,
          });
        }

        // Cache location in Redis for quick access
        const redis = getRedisClient();
        if (redis) {
          await redis.setEx(
            `driver:location:${socket.userId}`,
            60, // 1 minute TTL
            JSON.stringify(data)
          );
        }
      } catch (error) {
        console.error('Error updating driver location:', error);
      }
    });

    // Handle ride request from rider
    socket.on('ride:request', async (data: { rideId: string }) => {
      if (socket.userRole !== 'RIDER' || !socket.userId) return;

      try {
        const ride = await prisma.ride.findUnique({
          where: { id: data.rideId },
        });

        if (ride && ride.riderId === socket.userId) {
          // Notify nearby drivers
          io.to('drivers').emit('ride:new_request', {
            rideId: ride.id,
            pickup: {
              latitude: ride.pickupLatitude,
              longitude: ride.pickupLongitude,
              address: ride.pickupAddress,
            },
            dropoff: {
              latitude: ride.dropoffLatitude,
              longitude: ride.dropoffLongitude,
              address: ride.dropoffAddress,
            },
            fare: ride.totalFare,
            vehicleType: ride.vehicleType,
          });
        }
      } catch (error) {
        console.error('Error handling ride request:', error);
      }
    });

    // Handle ride acceptance from driver
    socket.on('ride:accept', async (data: { rideId: string }) => {
      if (socket.userRole !== 'DRIVER' || !socket.userId) return;

      try {
        const ride = await prisma.ride.findUnique({
          where: { id: data.rideId },
          include: {
            driver: {
              include: { driverProfile: true },
            },
          },
        });

        if (ride && ride.driverId === socket.userId) {
          // Notify rider
          io.to(`user:${ride.riderId}`).emit('ride:accepted', {
            rideId: ride.id,
            driver: {
              id: ride.driver?.id,
              name: ride.driver?.name,
              phone: ride.driver?.phone,
              avatar: ride.driver?.avatar,
              vehicle: {
                make: ride.driver?.driverProfile?.vehicleMake,
                model: ride.driver?.driverProfile?.vehicleModel,
                color: ride.driver?.driverProfile?.vehicleColor,
                plate: ride.driver?.driverProfile?.vehiclePlate,
              },
              location: {
                latitude: ride.driver?.driverProfile?.currentLatitude,
                longitude: ride.driver?.driverProfile?.currentLongitude,
              },
            },
          });

          // Notify other drivers that ride is taken
          socket.to('drivers').emit('ride:taken', { rideId: ride.id });
        }
      } catch (error) {
        console.error('Error handling ride acceptance:', error);
      }
    });

    // Handle ride status updates
    socket.on('ride:status:update', async (data: {
      rideId: string;
      status: string;
    }) => {
      try {
        const ride = await prisma.ride.findUnique({
          where: { id: data.rideId },
        });

        if (!ride) return;

        // Verify user is part of this ride
        if (ride.riderId !== socket.userId && ride.driverId !== socket.userId) {
          return;
        }

        // Broadcast status to both rider and driver
        io.to(`user:${ride.riderId}`).emit('ride:status', {
          rideId: ride.id,
          status: data.status,
        });

        if (ride.driverId) {
          io.to(`user:${ride.driverId}`).emit('ride:status', {
            rideId: ride.id,
            status: data.status,
          });
        }
      } catch (error) {
        console.error('Error handling ride status update:', error);
      }
    });

    // Handle ride cancellation
    socket.on('ride:cancel', async (data: {
      rideId: string;
      reason?: string;
    }) => {
      try {
        const ride = await prisma.ride.findUnique({
          where: { id: data.rideId },
        });

        if (!ride) return;

        // Verify user is part of this ride
        if (ride.riderId !== socket.userId && ride.driverId !== socket.userId) {
          return;
        }

        const cancelledBy = socket.userId === ride.riderId ? 'rider' : 'driver';

        // Notify the other party
        if (cancelledBy === 'rider' && ride.driverId) {
          io.to(`user:${ride.driverId}`).emit('ride:cancelled', {
            rideId: ride.id,
            cancelledBy,
            reason: data.reason,
          });
        } else if (cancelledBy === 'driver') {
          io.to(`user:${ride.riderId}`).emit('ride:cancelled', {
            rideId: ride.id,
            cancelledBy,
            reason: data.reason,
          });
        }
      } catch (error) {
        console.error('Error handling ride cancellation:', error);
      }
    });

    // Handle typing/messaging
    socket.on('message:send', async (data: {
      rideId: string;
      message: string;
    }) => {
      try {
        const ride = await prisma.ride.findUnique({
          where: { id: data.rideId },
        });

        if (!ride) return;

        if (ride.riderId !== socket.userId && ride.driverId !== socket.userId) {
          return;
        }

        // Send to the other party
        const recipientId = socket.userId === ride.riderId ? ride.driverId : ride.riderId;

        if (recipientId) {
          io.to(`user:${recipientId}`).emit('message:receive', {
            rideId: ride.id,
            senderId: socket.userId,
            message: data.message,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);

      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        // If driver, mark as unavailable
        if (socket.userRole === 'DRIVER') {
          prisma.driverProfile.update({
            where: { userId: socket.userId },
            data: { isAvailable: false },
          }).catch(console.error);
        }
      }
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
};

// Helper functions to send notifications
export const notifyRider = (riderId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${riderId}`).emit(event, data);
  }
};

export const notifyDriver = (driverId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${driverId}`).emit(event, data);
  }
};

export const getIO = () => io;
