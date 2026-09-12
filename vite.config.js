import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function localApiPlugin(env) {
  return {
    name: 'local-pages-api',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const functionName = request.url === '/api/assistant' ? 'assistant' : request.url === '/api/email' ? 'email' : request.url === '/api/schedule-email' ? 'schedule-email' : request.url === '/api/send-daily-email' ? 'send-daily-email' : null
        if (!functionName) return next()
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.end(JSON.stringify({ error: 'POST required.' }))
          return
        }

        const chunks = []
        for await (const chunk of request) chunks.push(chunk)
        const body = Buffer.concat(chunks)
        const headers = new Headers({ 'content-type': request.headers['content-type'] || 'application/json' })
        const upstreamRequest = new Request('http://localhost/api/assistant', {
          method: 'POST',
          headers,
          body,
        })
        const { onRequestPost } = await import(`./functions/api/${functionName}.js`)
        const upstreamResponse = await onRequestPost({ request: upstreamRequest, env })
        response.statusCode = upstreamResponse.status
        upstreamResponse.headers.forEach((value, key) => response.setHeader(key, value))
        response.end(Buffer.from(await upstreamResponse.arrayBuffer()))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiPlugin(env)],
    build: {
      outDir: 'dist',
    },
  }
})
