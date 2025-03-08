import { config } from 'dotenv'
import path from 'path'
config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`),
})

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  JWKS_URI,
  PRIVAT_KEY,
} = process.env

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  JWKS_URI,
  PRIVAT_KEY,
}
