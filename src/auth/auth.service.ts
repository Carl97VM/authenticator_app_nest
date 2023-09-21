import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';

import { CreateUserDto, UpdateUserDto, LoginDto, RegisterUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
      private userModel: Model<User>,
      private jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // console.log(createUserDto);
    // Se instancia el modelo y se manda los datos para insertar en la base de datos
    // Se tienen que hacer validaciones para poder encriptar, poner tokens y demas
    // Los errores de backend ya esta identificados mediante el catch utilizar error.code y identificar que paso
    try {
      const { password, ...userData } = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10),
        ...userData
      })
      // const newUser = new this.userModel( createUserDto );
      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();
      return user
    } catch (error) {
      if( error.code === 11000 ){
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Something terrible happend!!!')
    }
  }

  async register( registerDto: RegisterUserDto ): Promise<LoginResponse>{
    const user = await this.create( registerDto );
    // Utilizo el create de arriba por que el dto de register y create son iguales
    // no necesito sobreescribir el codigo
    console.log(user);
    
    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    //     return `This action returns a #${id} {name} {email} {token} auth`;
    const { email, password } = loginDto;
    // desustructuracion de lo que llega
    const user = await this.userModel.findOne({ email: email });

    // Validamos el correo y la contraseña
    if( !user ){
      throw new UnauthorizedException(`The ${ email } doesn't exist!`);
    }

    if( !bcryptjs.compareSync( password, user.password) ){
      throw new UnauthorizedException(`The ${ password } doesn't exists!`);
    }

    // Preparamos para devolver al FrontEnd
    const { password:_, ...rest } = user.toJSON();

    // Agrupamos la informacion para devolver
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    }
  }

  async findUserById( user_id: string ){
    const user = await this.userModel.findById( user_id );
    const {password, ...rest} = user.toJSON();
    return rest;
  }


  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken( payload: JwtPayload){

    const token = this.jwtService.sign( payload );
    return token;
  }
}
