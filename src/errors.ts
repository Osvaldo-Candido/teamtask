export class AppError extends Error {
  constructor(
   public message: string,
   public statusCode: number
  ){
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(message='Recurso não encontrado.'){
    super(message, 404)
  }
}

export class ForbidenError extends AppError {
  constructor(message='Não autorizado'){
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message='Conflito'){
    super(message,404)
  }
}