import {fastify, FastifyError} from 'fastify'
import { authRoutes } from './routes/auth.routes.js'
import swaggerUi from '@fastify/swagger-ui'
import swagger from '@fastify/swagger'
import { workspaceRoutes } from './routes/workspace.routes.js'
import { userRoutes } from './routes/user.routes.js'
import { taskRoutes } from './routes/tasks.routes.js'
import { AppError } from './errors.js'

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

app.register(authRoutes, {prefix: '/auth'})
app.register(workspaceRoutes, {prefix: '/workspace'})
app.register(userRoutes, {prefix: '/user'})
app.register(taskRoutes, {prefix: '/workspace/:workspaceId'})

app.setErrorHandler((error: FastifyError, request, reply) => {

      if(error instanceof AppError){
        return reply.status(error.statusCode).send({message: 'Dados inválidos', details: error.message})
      }

      if(error.statusCode === 400){
        return reply.status(400).send({message: 'Dados inválidos', details: error.message})
      }

      console.log(error)
      return reply.status(500).send({message: 'Erro interno no servidor!'})
    })
app.listen({
  port: 3333,
  host: '0.0.0.0'
}, ()=>{
  console.log('My project is running')
})