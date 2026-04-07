import {afterAll} from 'vitest'
import {fastify} from 'fastify'

const app = fastify({
  ajv:{
    customOptions:{
      strict: false
    }
  }
})
afterAll(async () => {
  await app.ready()

  
})