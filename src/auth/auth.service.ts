import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // console.log(createUserDto);
    // Se instancia el modelo y se manda los datos para insertar en la base de datos
    // Se tienen que hacer validaciones para poder encriptar, poner tokens y demas
    // Los errores de backend ya esta identificados mediante el catch utilizar error.code y identificar que paso
    try {
      const newUser = new this.userModel( createUserDto )
      return await newUser.save()
    } catch (error) {
      if( error.code === 11000 ){
        throw new BadRequestException(`${ createUserDto.email } already exists!`)
      }
      throw new InternalServerErrorException('Something terrible happend!!!')
    }
  }

  findAll() {
    return `This action returns all auth`;
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
}
