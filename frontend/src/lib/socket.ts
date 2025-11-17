import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

let socket: Socket | null = null

export const useSocket = () => {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!session?.user?.accessToken) {
      if (socket) {
        socket.disconnect()
        socket = null
      }
      return
    }

    if (!socket) {
      socket = io(WS_URL, {
        auth: {
          token: session.user.accessToken,
        },
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      })

      socket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
    }

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [session])

  return { socket, isConnected }
}

export const getSocket = () => socket

// Socket event handlers
export const socketEmit = (event: string, data: any) => {
  if (socket && socket.connected) {
    socket.emit(event, data)
  }
}

export const socketOn = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback)
  }
}

export const socketOff = (event: string, callback?: (data: any) => void) => {
  if (socket) {
    socket.off(event, callback)
  }
}
