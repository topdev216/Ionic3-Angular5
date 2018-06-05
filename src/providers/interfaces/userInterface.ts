import { AddressInterface } from '../interfaces/addressInterface';
import { VideogameInterface } from '../interfaces/videogameInterface';

export interface UserInterface{
    username?: string;
    email?:string;
    address?: AddressInterface;
    uid?: string;
    videogameCollection?: VideogameInterface[];
}