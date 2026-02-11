import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT token işlemleri
export const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}

// Şifre işlemleri
export const hashPassword = async (password: string) => {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

// Kullanıcı token'ı çıkarma
export const extractTokenFromHeader = (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}