import { PlatformLocation } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class UrlEnvironment {

    
    private baseUrl = "http://tradeupgames.ngrok.io";
    private _getUserLocation = "https://www.googleapis.com/geolocation/v1/geolocate?key="
    private _getUserAddress = "https://maps.googleapis.com/maps/api/geocode/json?latlng="
    private _getGamesAPI = this.baseUrl+"/getGames";
    private _getPlatformsAPI = this.baseUrl+"/getPlatforms";
    private _igdbAPI = "https://api-endpoint.igdb.com/games/?search="
    private _stripeKey = "pk_test_itNpGHyfNYo5CBxYnrx9Ln8w";
    private apiKey = "56b69359df896ff0135fe5d08e1ceaa8";
    private _createCustomer = this.baseUrl+"/createCharge";
    private _subscribeFCM = this.baseUrl+"/subscribeTopic";
    private _sendFCM = this.baseUrl+"/messageTopic";
    private _sendInvitation = this.baseUrl+"/inviteUser";
    private _inviteChatroom = this.baseUrl+"/inviteChatroom";


    

    constructor(public platformLocation: PlatformLocation) {        
        
    }

    public getInviteChatroom():string{
        return this._inviteChatroom;
    }

    public getSendInvitation():string{
        return this._sendInvitation;
    }

    public getSendFCM():string{
        return this._sendFCM;
    }

    public getSubscribeFCM():string{
        return this._subscribeFCM;
    }

    public getUserAddress():string{
        return this._getUserAddress;
    }

    public getStripeCustomer():string{
        return this._createCustomer;
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