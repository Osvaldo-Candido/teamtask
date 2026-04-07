import {fastify} from 'fastify'
import { authRoutes } from './routes/auth.routes.js'
import swaggerUi from '@fastify/swagger-ui'
import swagger from '@fastify/swagger'

const app = fastify({
  ajv: {
    customOptions: {
      strict: false
    }
  }
})

await app.register(swagger, {
      openapi:{
        info:{
          title: 'AP Secretariado Provincial',
          version: '1.0.0'
        },
        components:{
          securitySchemes:{
            bearerAuth:{
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        }
      }
})

await app.register(swaggerUi, {routePrefix: '/docs'})

app.register(authRoutes, {prefix: '/Auth'})

app.listen({
  port: 3333,
  host: '0.0.0.0'
}, ()=>{
  console.log('My project is running')
})