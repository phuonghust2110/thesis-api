import { SignInDto, SignUpDto } from "src/dtos/auth.dto";
import { IMetadata } from "./metadata.interface";

export interface IAuthentication{
    signUp(signUpDto : SignUpDto ) : void  ;
    signIn(signInDto : SignInDto, loginMetadata : IMetadata ) ;
}

