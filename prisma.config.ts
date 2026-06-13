import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, env } from 'prisma/config'

for (const file of ['.env', '.env.local']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) {
    loadEnv({ path, override: true })
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: env('DATABASE_URL')
  }
})
