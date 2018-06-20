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
import { INTERNAL_BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser/src/browser';

declare var Stripe:any;



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
  public friends: any [] = [];
  public username:string;
  public activeChatroomID:string;
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
    
    let passedMilliseconds = (now - amountOfCreation);

    let passedDays = Math.floor(passedMilliseconds / 86400000);
    console.log(this.trialAmount);
    
    
    const remainingDays = (this.trialAmount - passedDays);

    return remainingDays;
  }

  public checkExistingUsername(username:string):Promise<any>{
    return this.database.ref('/users/').orderByChild("username").equalTo(username).once("value")
  }

  public getConstants() : Promise<any>{

    return this.database.ref('constants/trialAmount').once('value').then( (snapshot)=>{
      
      this.trialAmount = snapshot.val();

      return this.database.ref('constants/trialEnd').once('value').then( (snapshot)=>{
        this.trialEnd = snapshot.val();
      })
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
    
    return this.checkExistingRoom(name).then((data)=>{
      if(data.val() !== null){
        return alert('room already exists!');
      }
      else{
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
    })
  
  }

  public createPrivateChatroom(name:string,password:string):Promise<any>{

    let chatroomRef = this.database.ref('/chatrooms/').push();

    return this.checkExistingRoom(name).then((data)=>{
      if(data.val() !== null){
        return alert('room already exists!');
      }
      else{
        return chatroomRef.set({
          name:name,
          type:'private',
          password:password,
          participants:{
            [this.uid]:{
              username:this.username
            }
          }
          
        }) 
      }
    })
  }

  public getUserPublicRooms():Promise<any>{
    return this.database.ref('/chatrooms/').orderByChild('participants/'+this.uid+'/username').equalTo(this.username).once("value")
  }

  public getUserDirectChats():Promise<any>{
    return this.database.ref('/directChats/').orderByChild('participants/'+this.uid+'/username').equalTo(this.username).once('value')
  }
  

  public joinPublicRoom(chatKey:string,username:string,isDirect:boolean):Promise<any>{

    if(!isDirect){
      let joinData = this.database.ref('chatrooms/'+chatKey+'/chats').push();
      return joinData.set({
      type:'join',
      user:username,
      message:username+' has joined this room.',
      sendDate:Date()
      }); 
    }
    else{
      return
    }
  }

  public checkPrivatePassword(password:string,chatKey:string):Promise<any>{
    return this.database.ref('chatrooms/'+chatKey+'/password').once('value')
  }

  public joinPrivateRoom(chatKey:string,username:string,password:string):Promise<any>{

    return this.checkPrivatePassword(password,chatKey).then((snap)=>{
      console.log(snap.val());
      if(snap.val() == password){
        let joinData = this.database.ref('chatrooms/'+chatKey+'/chats').push();
        return joinData.set({
        type:'join',
        user:username,
        message:username+' has joined this room.',
        sendDate:Date()
        }); 
      }
      else{
        let toast = this.toastCtrl.create({
          message: "Wrong Password",
          duration: 1500,
          position: 'top'
        });
    
        toast.onDidDismiss(() => {
          console.log('Dismissed toast');
        });
    
        return toast.present();
      }
    })
    
    
  }

  public sendMessageToUser():Promise<any>{
    return
  }

  public searchGamesAPI(queryString: string,id:string):Observable<any>{

   
    let json = {
      query: queryString,
      platformID: id
    }

    return this.http.post(this.urlEnvironment.getGamesAPI(),json);
  }

  public searchPlatformsAPI(queryString: string):Observable<any>{
    let json = {
      query: queryString,
    }
    return this.http.post(this.urlEnvironment.getPlatformsAPI(),json)
  }

  public leavePublicRoom(chatKey:string):Promise<any>{
    return this.database.ref('chatrooms/'+chatKey+'/participants/'+this.uid).remove();
  }

  public checkExistingRoom(name:string):Promise<any>{
    return this.database.ref('chatrooms/').orderByChild('name').equalTo(name).once('value')
  }

  public checkEmptyRoom(chatKey:string):Promise<any>{
    return this.database.ref('chatrooms/'+chatKey).once('value');
  }

  public deleteEmptyRoom(chatKey:string):Promise<any>{
    return this.database.ref('chatrooms/'+chatKey).remove();
  
  }

  public fetchUserKey(username:string):Promise<any>{
    
    return this.database.ref('/users').orderByChild('username').equalTo(username).once('value')
  }

  public checkExistingDirect(firstUsername:string,secondUsername:string):Promise<any>{

    let count = 0;
    let data = {
      count:count,
      key: ''
    }

    return this.getUserDirectChats().then((snap)=>{
      
      snap.forEach((childSnap) =>{
        console.log(childSnap.key);
        childSnap.forEach((user)=>{
          user.forEach((res)=>{
            console.log(res.val());
            if(res.val().username == firstUsername){
              data.count++;
            }
            if(res.val().username == secondUsername){
              data.count++;
            }
            if(data.count == 2){
              data.key = childSnap.key;
            }
          })
        })
      }) 

      if(data.count == 2){
        console.log('direct exists!');
        
      }
      else{
        console.log('doesnt!');
      }
      return data;
      
    })
  }


  public createDirectChat(receiverUsername:string,receiverUid:string):Promise<any>{

    let directChat = this.database.ref('/directChats/').push();

            return this.checkExistingDirect(this.username,receiverUsername).then((data)=>{
              console.log('must be count',data.count);
              if(data.count < 2){
                directChat.set({
                  participants:{
                    [this.uid]:{
                      username: this.username
                    },
                    [receiverUid]:{
                      username: receiverUsername
                    }
                  }
                })
                return directChat.key;
              }
              else{
                return data.key;
              }
              
            })
            
            
  
  }
  // public addFriend(user: firebase.User, username: string) :Promise<any>{
  //   return this.database.ref('/users/'+this.uid+'/friends/').set({
  //     [user.uid]:{
  //       username:username
  //     }
  //   })
  // }

  public getFriendsList():Promise<any>{

    return this.database.ref('/users/'+this.uid+'/friends').once('value')

  }

  ///////////////////////////////////////////////////BANK////////////////////////////////////////////////////////

  public getStripeBankToken(accountNumber: string, routingNumber: string): Promise<any | Error> {
    let stripe = new Stripe(this.urlEnvironment.getStripeAPI());
    return stripe.createToken('bank_account', {
      country: 'US',
      currency: 'usd',
      routing_number: routingNumber,
      account_number: accountNumber,
      account_holder_name: name,
      account_holder_type: 'individual',
    })
      .then((result) => {
        console.log("result: ", result);
        if (result && result.error) {
          return;
        }
        if (result && result.token && result.token.id) {
          console.log("tokenId: ", result.token.id);
          return result.token.id;
          // return Observable.of(result.token.id);
        }
      })
      .catch((err) => {

        return err;
      });
  }


}