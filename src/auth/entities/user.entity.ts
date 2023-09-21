import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    _id?: string;
    @Prop( {unique:true, required: true} )
    email: string;

    @Prop( {default: true} )
    isActive: boolean;

    @Prop( {minlength: 6, required: true} )
    name: string;

    @Prop( {default: true} )
    password?: string;

    @Prop( {type: [String], default: ['user']} )
    roles: string[];
}

// para mandar a mongos
export const UserSchema = SchemaFactory.createForClass( User );

