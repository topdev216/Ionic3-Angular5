import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import { Platform, Config, LoadingController, Loading, ToastController} from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { UrlEnvironment} from '../services/urlEnvironment';
import { Observable } from 'rxjs/Observable';
import { AddressInterface } from '../interfaces/addressInterface';  
import { VideogameInterface } from '../interfaces/videogameInterface';
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
  public username:string;
  public trialAmount: number;
  public trialEnd:number;
  public errorDismiss: boolean;
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

        this.database.ref('/users/' + user.uid).once('value').then(function(snapshot) {
          console.log(snapshot.val());
          //user is not registered on database...
          if(snapshot.val() == null){
            this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime)
          }//user doesn't have an username yet...
          else if(snapshot.val().username == null){
            return null;
          }
        });
        // return credential;
        return user;
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

  
  public addUserToDatabase(uid:string,name:string,email:string,date: string,username:string): Promise<any> {
    return this.database.ref('users/'+uid).set({
      username: username,
      name: name,
      email: email,
      creationTime: date,
    })
  }

  public fetchUserFromDatabase(uid:string): Promise<any>{
    return this.database.ref('users/'+uid).once('value', (userSnapshot) => {
      let user = {};
      user = userSnapshot.val();
      return user;
    })
  }
  

  public updateUserToDatabase(field: string, value:any) : Promise<any>{
    return this.database.ref('users/'+this.uid).update({
      [field]:value
    })
  }

  public saveAddress(address: AddressInterface) :Promise<any> {

    console.log(address);

    return this.database.ref('users/'+this.uid).update({
      address:{
        street:address.streetAddress,
        zipCode:address.zipCode,
        city:address.city,
        state:address.state
      }
    })

  }

  public savePhoneNumber(phoneNumber: string) :Promise<any>{
    return this.database.ref('users/'+this.uid).update({
      phoneNumber:phoneNumber
    })
  }

  public getRemainingDays(user: firebase.User) : number {
    let creationTime = user.metadata.creationTime;
    let amountOfCreation = Date.parse(creationTime);
    let now = (new Date).getTime();
    
    let passedMilliseconds = now - amountOfCreation;

    let passedDays = Math.floor(passedMilliseconds / 86400000);

    
    
    let remainingDays = this.trialAmount - passedDays;

    return remainingDays;
  }

  public checkExistingUsername(username:string):Promise<any>{
    return this.database.ref('/users/').orderByChild("username").equalTo(username).once("value")
  }

  public getConstants() : void{
    this.database.ref('constants/trialAmount').once('value').then( (snapshot)=>{
      this.trialAmount = snapshot.val();
    })

    this.database.ref('constants/trialEnd').once('value').then( (snapshot)=>{
      this.trialEnd = snapshot.val();
    })


  }

  public errorDismissed(value:boolean):void{
    this.errorDismiss = value;
  }

  public signUp(email: string, password: string,username:string): Promise<any> {
    
    return firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
          let user = firebase.auth().currentUser;
          this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,username)
          .then(()=>{
            return user.sendEmailVerification();
          })
      })
      .then((user) => {
        return this.signOut();
      });
  }
  
  public signIn(email: string, password: string): Promise<any> {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }




  public getUserAddress(lat:string,lng:string,apiKey:string):Observable<any>{
    
    return this.http.get(this.urlEnvironment.getUserAddress()+lat+','+lng+'&key='+apiKey);
  }

  public getGamesAPI() : Observable<any> {
    let body = {};
    return this.http.get(this.urlEnvironment.getGamesAPI())
  }

  public getGamesFirebase(): Promise<any>{

    return firebase.database().ref('/videogames/' + this.uid).once('value').then(function(snapshot) {
     
    });

  }

  public createPublicChatroom(name:string): Promise<any>{

    let chatroomRef = this.database.ref('/chatrooms/').push();
    

    return chatroomRef.set({
      name:name,
      type:'public',
      participants:{
        [this.uid]:{
          username:this.username
        }
      }
      
    }) 
  }

  public getUserPublicRooms():Promise<any>{
    console.log(this.username);
    return this.database.ref('/chatrooms/').orderByChild('participants/'+this.uid+'/username').equalTo(this.username).once("value")
  }

  
}
