import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class UrlEnvironment {

    
    
    private _getUserLocation = "https://www.googleapis.com/geolocation/v1/geolocate?key="
    private _getUserAddress = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
    private _getGamesAPI = "http://localhost:8081/getGames"
    

    constructor(public platformLocation: PlatformLocation) {        
        
    }

    public getUserAddress():string{
        return this._getUserAddress;
    }

    public getGamesAPI():string{
        return this._getGamesAPI;
    }
}