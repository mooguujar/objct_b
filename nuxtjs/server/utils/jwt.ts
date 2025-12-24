import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface JWTPayload {
  userId: number | bigint
  username: string
}

export function generateToken(payload: JWTPayload, config: { secret: string; expiresIn: string }) {
  return jwt.sign(payload, config.secret, { expiresIn: config.expiresIn })
}

export function verifyToken(token: string, secret: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload
}

export function getTokenFromRequest(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return null
}

export async function getCurrentUser(event: H3Event) {
  const config = useRuntimeConfig(event)
  const token = getTokenFromRequest(event)
  
  if (!token) {
    return null
  }
  
  try {
    const payload = verifyToken(token, config.jwtSecret)
    return payload
  } catch (error) {
    return null
  }
}

