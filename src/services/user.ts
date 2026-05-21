import { generateToken, hashPassword, passwordVerify } from "../auth.js";
import { ConflictError, ForbidenError, NotFoundError, Unauthorized } from "../errors.js";
import { IUser } from "../repositories/user.repository.js";

export interface CreateUserInterface {
  name:string
  email:string,
  password:string
}
export interface UserCreateResponse {
   name: string;
    id: string;
    email: string;
    password: string;
    createdAt: Date;
}
export interface UserResponse {
  user: UserCreateResponse,
  token:string
}

export class UserService {
  constructor(private repo: IUser){}
  async create(data:CreateUserInterface){

    const userEmail = await this.repo.findUserByEmail(data.email)

    if(userEmail){
      throw new ConflictError('Email já resistado')
    }
    const passwordHashed = await hashPassword(data.password)

    const user = await this.repo.createUser({...data, password: passwordHashed})

    return user
  }

  async login(email:string, password:string){
    const safeData = await this.repo.findUserByEmail(email)

    if(!safeData){
      throw new Unauthorized('Email ou password errados')
    }

    const passwordCompare = await passwordVerify(password, safeData.password)

    if(!passwordCompare){
      throw new Unauthorized('Email ou password errados')
    }

    const token = generateToken(safeData.id, safeData.email, safeData.name)
    const {password:_, ...dataWithoutPassword} = safeData

    return {safeData:dataWithoutPassword, token}
  }
}