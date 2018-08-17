import { HttpClient } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import { Platform, LoadingController, Loading, ToastController} from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { UrlEnvironment} from '../services/urlEnvironment';
import { Observable } from 'rxjs/Observable';
import { AddressInterface } from '../interfaces/addressInterface';  
import * as moment from 'moment';
// import { VideogameInterface } from '../interfaces/videogameInterface';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

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
  public user: any;
  public fireUser: firebase.User;
  public friends: any [] = [];
  public username:string;
  public activeChatroomID:string;
  public trialAmount: number;
  public trialEnd:number;
  public errorDismiss: boolean;
  public browserToken:string;
  public phoneToken:string;
  public tradeKey:string;

  constructor(public http: HttpClient
  , public platform: Platform
  , public loadingCtrl: LoadingController
  , public afAuth: AngularFireAuth
  , public toastCtrl: ToastController
  , public zone: NgZone
  , public urlEnvironment: UrlEnvironment) {
    console.log('Hello DataService Provider');

  }

  public initialiazeWebFCM():firebase.messaging.Messaging{
    const messaging = firebase.messaging();
    messaging.usePublicVapidKey("BNJKkIXoLQCgzWDYJeI41p89a7zcml_rsc6bbE5TVXvMHdsNxSCebW4iu8kv1GOcfnpKCKh5AwsfpnsgExuYiu8");
    return messaging;
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

  public addUserToDatabase(uid:string,name:string,email:string,date: string,username:string,url:string): Promise<any> {
    return this.database.ref('users/'+uid).set({
      username: username,
      name: name,
      email: email,
      creationTime: date,
      coverPhoto:url,
      online:true
    })
  }

  public updateProfilePicture(url:string):Promise<any>{
    return this.database.ref('/users/'+this.uid).update({
      coverPhoto:url
    })
  }

  public updateOnlineStatus(status:boolean,uid:string):Promise<any>{
    return this.database.ref('/users/'+uid).update({
      online:status
    })
  }

  public googleLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.GoogleAuthProvider)
      .then((credential: any) => {
        let user = credential.user;
        
        this.database.ref('/users/' + user.uid+'/name').once('value').then( (snapshot) => {
          console.log(snapshot.val());
          //user is not registered on database...
          if(snapshot.val() == null){
            this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,'',user.photoURL)
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
    
    return this.updateOnlineStatus(false,this.uid).then(()=>{
      this.user = null;
      this.email = null;
      this.uid = null;
      return this.afAuth.auth.signOut();
    });
    // return this.afAuth.auth.signOut() 
  }

  public updateOnDisconnect(uid:string):Promise<any> {
    return this.database.ref('users/'+uid)
            .onDisconnect()
            .update({online: false})
  }

  public fetchUserFromDatabase(uid:string): Promise<any>{
    return this.database.ref('users/'+uid).once('value', (userSnapshot) => {
      let user = {};
      user = userSnapshot.val();
      this.user = user;
      return user;
    })
  }

  public fetchTrade(tradeKey:string): Promise<any>{
    return this.database.ref('trades/'+tradeKey).once('value');
  }

  public acceptTradeOffer(tradeKey:string): Promise<any>{
    return this.database.ref('trades/'+tradeKey).update({
      status:'accepted'
    })
  }

  public declineTradeOffer(tradeKey:string):Promise<any>{
    return this.database.ref('trades').child(tradeKey).remove();
  }

  public removeTradeMessage(tradeKey:string,isDirect:boolean,chatKey:string,messageKey:string):Promise<any>{

    isDirect =  false;

    console.log('CHAT:',chatKey);
    console.log('MESSAGE:',messageKey);
    if(!isDirect){
      return this.database.ref('chatrooms/'+chatKey+'/chats/').child(messageKey).remove();
    }
    else{
      return this.database.ref('directChats/'+chatKey+'/chats').child(messageKey).remove();
    }

  }

  public sendTradeNotification(browserToken:string,phoneToken:string,username:string,message:string): Observable<any>{

      return this.http.post(this.urlEnvironment.getTradeNotification(),{phoneToken:phoneToken,browserToken:browserToken,username:username,tradeKey:this.tradeKey,message:message})

    
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
          this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,username,'')
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

  public fetchUserOfferGames(userKey:string):Promise<any>{
    return this.database.ref('users/'+userKey+'/videogames/offer').once('value')
  }

  public fetchUserInterestedGames(userKey:string):Promise<any>{
    return this.database.ref('users/'+userKey+'/videogames/interested').once('value')
  }

  public removeGameFromList(gameId:string,list:string,userKey:string):Promise<any>{
    return this.database.ref('users/'+userKey+'/videogames/'+list+'/'+gameId).remove()
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

  public fetchRoom(chatKey:string):Promise<any>{
    return this.database.ref('/chatrooms/'+chatKey).once('value')
  }

  public getUserDirectChats():Promise<any>{
    return this.database.ref('/directChats/').orderByChild('participants/'+this.uid+'/username').equalTo(this.username).once('value')
  }
  

  public joinPublicRoom(chatKey:string,username:string,isDirect:boolean):Promise<any>{

    if(!isDirect){
      let joinData = this.database.ref('chatrooms/'+chatKey+'/chats').push();
      joinData.set({
      type:'join',
      user:username,
      message:username+' has joined this room.',
      sendDate:Date()
      }); 

      return this.database.ref('chatrooms/'+chatKey+'/participants').update({
          [this.uid]:{
            username:username
          }
      })
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

  public createTrade(games:any,username: string):Promise<any>{

    return this.fetchUserKey(username).then((snap) =>{

      var key = Object.keys(snap.val())[0];
      let gameA = [],gameB = [];

      for(let i = 0 ; i < games.length; i++){
        if(games[i].type === 'interested'){
          gameA.push(games[i]);
        }
        else{
          gameB.push(games[i]);
        }
      }
      
      let newTrade = this.database.ref('trades/').push();

      let tradeKey = newTrade.key;
      this.tradeKey = tradeKey;

      return newTrade.set({
        participants:{
          [this.uid]:{
            receivingGames:gameA
          },
          [key]:{
            receivingGames:gameB
          }
        },
        items:games,
        status:'pending',
        creationTime: moment().utc().valueOf()
      })
    })
    
  }

  public showTradeCard(chatKey:string,username:string):Promise<any>{

    return this.fetchUserKey(username).then((snap)=>{

      var key = Object.keys(snap.val())[0];

      let newMessage = firebase.database().ref('chatrooms/'+chatKey+'/chats').push();

      let messageKey = newMessage.key;

      console.log('MESSAGE KEY:',messageKey);

      return newMessage.set({
        type:'trade',
        user:this.username,
        sendDate:Date(),
        tradeKey:this.tradeKey,
        toUid:key,
        fromUid:this.uid,
        messageKey:messageKey
      })

    })


   
  }

  public searchGamesAPI(queryString: string,id:string):Observable<any>{

  
    let json = {
      query: queryString,
      platformID: id
    }

    return this.http.post(this.urlEnvironment.getGamesAPI(),json);
  }

  public addVideogame(game:any,id:any):Promise<any>{
    return this.database.ref('users/'+this.uid+'/videogames/'+game.type+'/'+id).set({
      title:game.title,
      genre:game.genre,
      releaseDate:game.releaseDate,
      coverPhoto:game.coverPhoto,
      esrbRating:game.esrbRating,
      platform:game.platform
    })
    
  }

  public notifyUsers(topic:string,gameTitle:string):Observable<any>{
    console.log('TOPIC ID:',topic);
    let json = {
      topic:topic,
      user:this.user,
      title:gameTitle
    }
    return this.http.post(this.urlEnvironment.getSendFCM(),json)
  }

  public subscribeToGame(topic:string):Observable<any>{
    let json = {
      topic:topic,
      browserToken:this.browserToken,
      phoneToken:this.phoneToken
    }
    return this.http.post(this.urlEnvironment.getSubscribeFCM(),json)
  }

  public sendInvitation():Observable<any>{
    let json = {};
    return this.http.post(this.urlEnvironment.getSendInvitation(),json)
  }

  public inviteChatroom(username:string,key:string,chatroomName:string,chatKey:string):Observable<any>{
    
      let json = {
        uid:key,
        chatroomName:chatroomName,
        username:this.username,
        chatKey:chatKey
      }
      
      return this.http.post(this.urlEnvironment.getInviteChatroom(),json)
  
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

  public searchUsersByUsername(query:string):Promise<any>{
    return this.database.ref('/users').orderByChild('username').startAt(query).endAt(query+'\uf8ff').once('value')
  }

  public searchUsersByName(query:string):Promise<any>{
    return this.database.ref('/users').orderByChild('name').startAt(query).endAt(query+'\uf8ff').once('value')
  }

  

  public checkExistingDirect(firstUsername:string,secondUsername:string,secondUid:string):Promise<any>{

    
    let data = {
      exist:false,
      key: ''
    }

    return this.getUserDirectChats().then((snap)=>{
      
      snap.forEach((childSnap) =>{
        console.log(childSnap.key);
        console.log('second:',secondUid);
        if(this.uid in childSnap.val().participants && secondUid in childSnap.val().participants){
          console.log('we got a chat')
          data.key = childSnap.key;
          data.exist = true;
          return data;
        }
      }) 

      
      return data;
      
    })
  }


  public createDirectChat(receiverUsername:string,receiverUid:string):Promise<any>{

            console.log('receiver:',receiverUsername);
            console.log('receiverUID:',receiverUid);

            return this.checkExistingDirect(this.username,receiverUsername,receiverUid).then((data)=>{
              console.log('DATA EXIST:',data.exist);
              if(!data.exist){
                let directChat = this.database.ref('/directChats/').push();
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
  public addFriend(friend:any) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/friends').update({
      [friend.userKey]:{
        username:friend.user.username
      }
    })
  }

  public getFriendsList():Promise<any>{

    return this.database.ref('/users/'+this.uid+'/friends').once('value')

  }

  public saveNotificationToken(token:string,isBrowser:boolean):Promise<any>{
    if(isBrowser){
      return this.database.ref('/users/'+this.uid).update({
        browserToken: token
      })
    }
    else{
      return this.database.ref('/users/'+this.uid).update({
        phoneToken: token
      })
    }
    // return this.database.ref('/users/'+this.uid).update({
    //   notificationToken: token
    // })
  }


  public sendFCM(data:any):Observable<any>{
    let json = {
      topic:data.id,
      user:this.username,
      title:data.title
    }
    return this.http.post(this.urlEnvironment.getSendFCM(),json)
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

  public saveStripeToken(token:string):Promise<any>{
    return this.database.ref('/users/'+this.uid).update({
      stripeToken:token
    })
  }

  public createStripeCustomer(token:string,plan:any):Observable<any>{

    let json = {
      uid:this.uid,
      token:token,
      email:this.email,
      plan:plan
    }
    return this.http.post(this.urlEnvironment.getStripeCustomer(),json)
  }


}