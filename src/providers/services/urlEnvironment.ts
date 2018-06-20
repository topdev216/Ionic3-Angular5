import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class UrlEnvironment {

    
    
    private _getUserLocation = "https://www.googleapis.com/geolocation/v1/geolocate?key="
    private _getUserAddress = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
    private _getGamesAPI = "http://localhost:8081/getGames"
    private _getPlatformsAPI = "http://localhost:8081/getPlatforms"
    private _igdbAPI = "https://api-endpoint.igdb.com/games/?search="
    private _stripeKey = "pk_test_aXiWjxHy7auzzU09to4TBCHL";
    private apiKey = "8ba5da0644ab24d2283053a6d8ee30a4";
    

    constructor(public platformLocation: PlatformLocation) {        
        
    }

    public getUserAddress():string{
        return this._getUserAddress;
    }

    public getStripeAPI():string{
        return this._stripeKey;
    }

    public getPlatformsAPI():string{
        return this._getPlatformsAPI;
    }

    public getGamesAPI():string{
        return this._getGamesAPI;
    }

    public getIgdbAPI():string{
        return this._igdbAPI;
    }

    public getApiKey():string{
        return this.apiKey;
    }
}