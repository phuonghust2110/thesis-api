import { RolesBuilder } from "nest-access-control";

export enum Role {
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER'
}

export const roles: RolesBuilder = new RolesBuilder();

roles 
    .grant(Role.STUDENT)
    .readAny(['course'])
    .grant(Role.TEACHER)
    .extend(Role.STUDENT)
    .createOwn(['course'])
    .updateOwn(['course'])
    .deleteOwn(['course'])
