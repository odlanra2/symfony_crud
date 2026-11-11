export interface User{
  id?: number;
  email: string;
  //nombre: string | null;
  roles: string[];
  //creadoEn: string;

}

export interface Credentials{
   email: string;
   password:string;
}

export interface ResponseToken{
  token:string;
}

export interface RegistroPayload extends Credentials {

}

export interface RespuestaRegistro {
  user: User;
  token: string;
}

const TOKEN_KEY = 'crud_token';
const USER_KEY = 'crud_user';

export const saveToken=(token:string):void=>{
   localStorage.setItem(TOKEN_KEY, token)
}

export const getToken= ():string | null =>{
    try {
       return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }

 // return localStorage.getItem(TOKEN_KEY);
}

export const saveSession =(token:string, user:User):void=>{
      saveToken(token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const getSession=():User | null=>{
    try {
    const guardado = localStorage.getItem(USER_KEY);

    return guardado ? (JSON.parse(guardado) as User) : null;
  } catch {
    return null;
  }
}

export const CleanSession=():void=>{
     localStorage.removeItem(TOKEN_KEY);
     localStorage.removeItem(USER_KEY);
}
