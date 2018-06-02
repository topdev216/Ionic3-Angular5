import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import { Platform, Config, LoadingController, Loading, ToastController} from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { UrlEnvironment} from '../services/urlEnvironment';
import { Observable } from 'rxjs/Observable';
import { AddressInterface } from '../interfaces/addressInterface';  
import { GameInterface } from '../interfaces/gameInterface';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map'





/*
  Generated class for the DataService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataService {

  public database = firebase.database();
  public loading: Loading;
  public uid: string;
  public email: string;
  public authState: boolean;
  public user: firebase.User;
  private _apiKey = "8ba5da0644ab24d2283053a6d8ee30a4"

  constructor(public http: HttpClient
  , public platform: Platform
  , public loadingCtrl: LoadingController
  , public afAuth: AngularFireAuth
  , public toastCtrl: ToastController
  , public zone: NgZone
  , public urlEnvironment: UrlEnvironment) {
    console.log('Hello DataService Provider');

  }

  public showLoading(): void {
    this.loading = this.loadingCtrl.create({
      spinner:'crescent'
    });
    this.loading.present();
  }

  public hideLoading(): void {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }

  public showToast(message: string): Promise<any> {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    return toast.present();
  }

  //SOCIAL LOGINS
  private socialSignIn(provider): Promise<any> {
    if (this.platform.is('cordova')) {
      return firebase.auth().signInWithRedirect(provider)
        .then((data: any) => {
          console.log("data: ", data);
          return firebase.auth().getRedirectResult();
        });
    } else {
      return this.afAuth.auth.signInWithPopup(provider)
        .then((credential) => {
          return credential;
        });
    }
  }

  public googleLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.GoogleAuthProvider)
      .then((credential: any) => {
        let user = credential.user;

        firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
          console.log(snapshot.val());
          //user is not registered on database...
          if(snapshot.val() == null){
            this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime)
          }
        });
        return credential;
      });
  }

  public facebookLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.FacebookAuthProvider)
      .then((credential: any) => {
        return credential;
      });
  }

  public twitterLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.TwitterAuthProvider)
      .then((credential: any) => {
        return credential;
      });
  }

  public signOut(): Promise<any> {
    var user = firebase.auth().currentUser;
    let uid = user.uid;
    this.user = null;
    this.email = null;
    this.uid = null;
    return this.afAuth.auth.signOut() 
  }

  
  public addUserToDatabase(uid:string,username:string,email:string,date: string): void {
    this.database.ref('users/'+uid).set({
      name: username,
      email: email,
      creationTime: date,
    })
  }

  public saveAddress(address: AddressInterface) :void {

    console.log(address);

    this.database.ref('users/'+this.uid).update({
      address:{
        street:address.streetAddress,
        zipCode:address.zipCode,
        city:address.city,
        state:address.state
      }
    })

  }

  public savePhoneNumber(phoneNumber: string) :void{
    this.database.ref('users/'+this.uid).update({
      phoneNumber:phoneNumber
    })
  }

  public getRemainingDays(user: firebase.User) : number {
    let creationTime = user.metadata.creationTime;
    let amountOfCreation = Date.parse(creationTime);
    let now = (new Date).getTime();
    
    let passedMilliseconds = now - amountOfCreation;

    let passedDays = Math.floor(passedMilliseconds / 86400000);
    
    let remainingDays = 15 - passedDays;

    return remainingDays;
  }

  public signUp(email: string, password: string): Promise<any> {
    return firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime)
        return user.sendEmailVerification();
      })
      .then((user) => {
        return this.signOut();
      });
  }


  public getUserAddress(lat:string,lng:string,apiKey:string):Observable<any>{
    
    return this.http.get(this.urlEnvironment.getUserAddress()+lat+','+lng+'&key='+apiKey);
  }

  public getGamesAPI() : Observable<any> {
    let body = {};
    return this.http.get(this.urlEnvironment.getGamesAPI())
  }

  public getGamesFirebase(): void{

    firebase.database().ref('/videogames/' + this.uid).once('value').then(function(snapshot) {
     
    });

  }
}
