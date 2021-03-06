import { HttpClient } from '@angular/common/http';
import { Injectable,NgZone } from '@angular/core';
import { Platform, LoadingController, Loading, ToastController, PopoverController} from 'ionic-angular';
import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';
import { UrlEnvironment} from '../services/urlEnvironment';
import { Observable } from 'rxjs/Observable';
import { AddressInterface } from '../interfaces/addressInterface';  
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Reference } from '@firebase/database-types';
import { ReplaySubject } from 'rxjs';
import * as StackTrace from 'stacktrace-js';


declare var Stripe:any;



/*
  Generated class for the DataService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataService {

  public database = firebase.database();
  public storage = firebase.storage();
  public loading: Loading;
  public uid: string;
  public email: string;
  public authState: boolean;
  public user: any;
  public fireUser: firebase.User;
  public friends:any[] = [];
  public trades:any [] = [];
  public serverLogs: any [] = [];
  public tradesChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public tradeCountChange: ReplaySubject<number> = new ReplaySubject<number> ();
  public friendsChange: ReplaySubject<any[]> =  new ReplaySubject<any[]> ();
  public blockedChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public directChatChanges: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public serverLogsChanges: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public proposedTradesChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public receivedTradesChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public directChats:any[] = [];
  public blocked: any [] = [];
  public username:string;
  public activeChatroomID:string;
  public trialAmount: number;
  public trialEnd:number;
  public errorDismiss: boolean;
  public browserToken:string;
  public phoneToken:string;
  public tradeKey:string;
  public games: any [] = [];
  public activeTab;
  public previousTab;
  public platform: Platform;

  constructor(public http: HttpClient
  , public loadingCtrl: LoadingController
  , public afAuth: AngularFireAuth
  , public toastCtrl: ToastController
  , public zone: NgZone
  , public urlEnvironment: UrlEnvironment
  , public popoverCtrl: PopoverController) {
    console.log('Hello DataService Provider');

    this.friendsChange.subscribe((value)=>{
      console.log('friend list service:',value);
      this.friends = value;
    })
    this.blockedChange.subscribe((value)=>{
      this.blocked = value;
    })

    this.directChatChanges.subscribe((value)=>{
      this.directChats = value;
    })

    this.tradesChange.subscribe((value)=>{
      this.trades = value;
    })

    this.serverLogsChanges.subscribe((value) => {
      this.serverLogs = value;
    })

  }

  public initialiazeWebFCM():firebase.messaging.Messaging{
    const messaging = firebase.messaging();
    messaging.usePublicVapidKey("BNJKkIXoLQCgzWDYJeI41p89a7zcml_rsc6bbE5TVXvMHdsNxSCebW4iu8kv1GOcfnpKCKh5AwsfpnsgExuYiu8");
    return messaging;
  }

  public liveTradesCount(){
    this.database.ref('/constants/trades_count').on('value',(snap)=>{
      let count = snap.val();
      this.tradeCountChange.next(count);
    })
  }

  public liveTradesService(){
    this.database.ref('/trades/').on('value', (snap) =>{
      let array = [];
      snap.forEach((trade)=>{
        let obj = {
          trade:trade.val(),
          key:trade.key
        };
        array.push(obj);
      })

      for(let i = 0 ; i < array.length ; i ++){
        for(let j = 0 ; j < array[i].trade.items.length ; j++){




            if(array[i].trade.items[j].game !== undefined){
              array[i].trade.items[j].game.platform = array[i].trade.items[j].game.platform.toLowerCase();
              array[i].trade.items[j].game.title = array[i].trade.items[j].game.title.toLowerCase();
            }
            else if(array[i].trade.items[j].console !== undefined){
              array[i].trade.items[j].console.name = array[i].trade.items[j].console.name.toLowerCase();
            }
            else{
              array[i].trade.items[j].accessorie.name = array[i].trade.items[j].accessorie.name.toLowerCase();
            }
        }
    }
      this.tradesChange.next(array);
    })
  }

  public liveProposedTrades(){
    this.database.ref('/trades').orderByChild('proposer').equalTo(this.uid).on('value', (snap) =>{
      let array = [];
      snap.forEach((proposedTrade) => {
        let obj = {
          trade: proposedTrade.val(),
          key: proposedTrade.key
        }
        array.push(obj);
      });

      this.proposedTradesChange.next(array);
    });
  }

  public liveReceivedTrades(){
    this.database.ref('/trades').orderByChild('receiver').equalTo(this.uid).on('value', (snap) =>{
      let array = [];
      snap.forEach((receivedTrade) => {
        let obj = {
          trade:receivedTrade.val(),
          key:receivedTrade.key
        };
        array.push(obj);
      });

      this.receivedTradesChange.next(array);
    })
  }

  public liveTrades(lastKey?): Observable<any>{

    let obj = {
      lastKey: lastKey
    };

    return this.http.post(this.urlEnvironment.getTrades(),obj)
  }

  public directChatService(){
    this.database.ref('/directChats/').orderByChild('participants/'+this.uid+'/username').equalTo(this.username).on('value', snapshot =>{
      this.directChatChanges.next([]);
      let reads = [];
      snapshot.forEach((chat)=>{
        let promise = this.NewDirectMessagesCount(chat.key).then((result)=>{

          let obj = {};
          if(chat.val().senderA === this.username){
            obj = {
              unread:result,
              key:chat.key,
              chat:chat.val(),
              type:'direct',
              username:chat.val().senderB
            }
          }
          else{
            obj = {
              unread:result,
              key:chat.key,
              chat:chat.val(),
              type:'direct',
              username:chat.val().senderA
            }
          }
          
          return obj;
        })
        .catch((err) => {
          this.logError(err);
        })
        reads.push(promise);
      })

      Promise.all(reads).then((values)=>{
        this.directChatChanges.next(values);
        console.log('direct chat service:',values);
      })
      .catch((err) => {
        this.logError(err);
      })
    });
  }

  public friendListService(){
    this.liveFriendsList().on('value',(data)=>{
      let reads = [];
      this.friendsChange.next(this.friends = []);
      
      data.forEach((childSnap)=>{
        let promise = this.fetchUserKey(childSnap.val().username).then((user)=>{
          
        var key = Object.keys(user.val())[0];
        let initialLetter;
        if(user.val()[key].firstName !== undefined){
          initialLetter = user.val()[key].firstName.substring(0,1).toUpperCase();
        }
        else if(user.val()[key].username !== undefined){
          initialLetter = user.val()[key].username.substring(0,1).toUpperCase();
        }
        else{
          initialLetter = user.val()[key].name.substring(0,1).toUpperCase();
        }
        let obj = {
          friend:user.val()[key],
          key:key,
          initialLetter:initialLetter,
          online:user.val()[key].online
        };
        return obj
      },err =>{
        this.logError(err);
        return err;
      });
        reads.push(promise);
      });
      Promise.all(reads).then((values)=>{
            let array = [];
            this.friendsChange.next(this.friends = []);
            values.map((friend,index) =>{
              console.log('friend list service index:',index);
              array.push(friend);
              this.onlineFriendListener(friend.key,index,true);
            })
            this.friendsChange.next(array);
      })
      .catch((err) => {
        this.logError(err);
      })
    })
  }

  public blockedListService(){
    this.liveBlockedList().on('value',(data)=>{
      let reads = [];
      this.blockedChange.next(this.blocked = []);
      
      data.forEach((childSnap)=>{
        let promise = this.fetchUserKey(childSnap.val().username).then((user)=>{
          
        var key = Object.keys(user.val())[0];
        let initialLetter;
        if(user.val()[key].firstName !== undefined){
          initialLetter = user.val()[key].firstName.substring(0,1).toUpperCase();
        }
        else if(user.val()[key].username !== undefined){
          initialLetter = user.val()[key].username.substring(0,1).toUpperCase();
        }
        else{
          initialLetter = user.val()[key].name.substring(0,1).toUpperCase();
        }
        let obj = {
          friend:user.val()[key],
          key:key,
          online:user.val()[key].online,
          initialLetter:initialLetter
        };
        return obj
      },err =>{
        this.logError(err);
        return err;
      });
        reads.push(promise);
      });
      Promise.all(reads).then((values)=>{
            let array = [];
            values.map((friend,index) =>{
              console.log('friend list service index:',index);
              array.push(friend);
              this.onlineFriendListener(friend.key,index,false);
            })
            this.blockedChange.next(array);
      })
      .catch((err) => {
        this.logError(err);
      })
    })
  }



  public onlineFriendListener(uid:string,position:number,isFriend:boolean){
    this.getOnlineStatus(uid).on('value',(data) =>{
      this.zone.run(()=>{
        console.log('online status uid:',uid);
        console.log('online:',data.val())
        if(isFriend){
          if(this.friends[position] !== undefined){
            this.friends[position].online = data.val();
          }
        }
        else{
          if(this.blocked[position] !== undefined){
            this.blocked[position].online = data.val();
          }
        }
      });
    });
  }

  public saveBug(bug:any,stackframe:string,screenshot: string, type:string) :Promise<any>{
      let bugRef = this.database.ref('/bugs').push();

      let url;
      if(type === 'core'){
        url = screenshot.substring(22);
      }
      else{
        url = screenshot.substring(23);
      }

      console.log('save bug called');

      console.log('image to upload:',url);
      return this.storage.ref('/bugs/'+bugRef).putString(url,'base64').then((result) => {
        console.log('Upload result:',result)
        let screenshotRef = result.ref;
        let timestamp = Date.now();
        let date = new Date(timestamp),
        datevalues = [
          date.getUTCFullYear(),
          date.getUTCMonth()+1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
        ];

        return screenshotRef.getDownloadURL().then((screenshotUrl)=>{
          return bugRef.set({
            description: bug.description,
            stackframe: stackframe,
            screenshot:screenshotUrl,
            timestamp:date.toString()
          })
          .catch((err)=>{
            this.logError(err);
          });
        })  
        .catch((err)=>{
          this.logError(err);
        });
      })
      .catch((err)=>{
        this.logError(err);
      })

      
 
  }

  public logError(error:any) :void {
    console.log(error);
    let obj = {
      description: error.message
    };

    StackTrace.fromError(error).then((stacktrace) => {
      const stackString = stacktrace[0].toString();
            if(this.platform.is('cordova')){
              this.saveBug(obj,stackString,'','mobile');
            }
            else{
              this.saveBug(obj,stackString,'','core');
            }
    })
    
  }

  public getInterestedConsoles(uid:string) :Promise <any> {
    return this.database.ref('/users/'+uid+'/consoles/interested').once('value');
  }

  public getOfferingConsoles(uid:string) :Promise <any> {
    return this.database.ref('/users/'+uid+'/consoles/offer').once('value');
  }
  public getInterestedAccessories(uid:string) :Promise <any> {
    return this.database.ref('/users/'+uid+'/accessories/interested').once('value');
  }

  public getOfferingAccessories(uid:string) :Promise <any> {
    return this.database.ref('/users/'+uid+'/accessories/offer').once('value');
  }

  public showLoading(content:string): Promise<any> {
    this.loading = this.loadingCtrl.create({
      content: content,
      spinner:'crescent'
    });
    return this.loading.present();
  }

  public hideLoading():  Promise<any>{
    return this.loading.dismiss()
  }

  public showToast(message: string): Promise<any> {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    return toast.present();
  }

  public showPopover(component:any,event:any,stacktrace:string): Promise<any> {
    let popover = this.popoverCtrl.create(component,{stacktrace: stacktrace});
    return popover.present({
      ev:event
    });
  }

  //SOCIAL LOGINS
  private socialSignIn(provider): Promise<any> {
    if (this.platform.is('cordova')) {
      
      return firebase.auth().signInWithRedirect(provider)
        .then((data: any) => {
          console.log("data: ", data);
          return firebase.auth().getRedirectResult();
        })
        .catch((err) => {
          this.logError(err);
        })
    } else {
      return this.afAuth.auth.signInWithPopup(provider)
        .then((credential) => {
          return credential;
        })
        .catch((err) => {
          this.logError(err);
        })
    }
  }

  public addUserToDatabase(uid:string,name:string,email:string,date: string,username:string,url:string,firstName:string,lastName:string): Promise<any> {
    return this.database.ref('users/'+uid).set({
      username: username,
      name: name,
      email: email,
      creationTime: date,
      coverPhoto:url,
      online:true,
      chat_notification_disable:false,
      paidMember:false,
      userKey:uid,
      firstName: firstName,
      lastName: lastName
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

  public serverLogsService() {
    this.database.ref('/bugs').on('value', (snap) =>{
      let array = [];
      snap.forEach((bugSnap) => {
        array.push(bugSnap.val());
      })
      this.serverLogsChanges.next(array);
    })
  }

  public googleLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.GoogleAuthProvider)
      .then((credential: any) => {
        let user = credential.user;
          return this.database.ref('/users/' + user.uid).once('value').then( (snapshot) => {
            console.log(snapshot.val());
            //user is not registered on database...
            if(snapshot.val() == null){
              this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,'',user.photoURL,'','')
              return snapshot.val();
            }//user doesn't have an username yet...
            else{
              return snapshot.val();
            }
          })
          .catch((err) => {
            this.logError(err);
          })
      })
      .catch((err) => {
        this.logError(err);
      })
  }

  public facebookLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.FacebookAuthProvider)
      .then((credential: any) => {
        return credential;
      })
      .catch((err) => {
        this.logError(err);
      })
  }

  public twitterLogin(): Promise<void> {
    return this.socialSignIn(new firebase.auth.TwitterAuthProvider)
      .then((credential: any) => {
        return credential;
      })
      .catch((err) => {
        this.logError(err);
      })
  }

  public signOut(): Promise<any> {
    var user = firebase.auth().currentUser;
    let uid = user.uid;
    
    return this.updateOnlineStatus(false,this.uid).then(()=>{
      return this.flagLogin(this.uid).then(()=>{
        this.user = null;
        this.email = null;
        this.uid = null;
        return this.afAuth.auth.signOut();
      })
      .catch((err) => {
        this.logError(err);
      })
    })
    .catch((err) => {
      this.logError(err);
    })
    // return this.afAuth.auth.signOut() 
  }

  public flagLogin(uid:string): Promise<any> {
    if(this.platform.is('cordova')){
      return this.database.ref('users/'+uid).update({
        not_available_phone:true
      });
    }
    else{
      return this.database.ref('users/'+uid).update({
        not_available_browser:true
      });
    }
  }
  public updateOnDisconnect(uid:string):Promise<any> {
    return this.database.ref('users/'+uid)
            .onDisconnect()
            .update({online: false})
  }

  public updateChatOnDisconnect(chatKey:any):Promise<any>{
    console.log('chatKey:',chatKey);
    if(chatKey.hasOwnProperty('key')){
      return this.database.ref('/directChats/'+chatKey.key+'/participants/'+this.uid).onDisconnect().update({
        isInside:false
      });
    }
    else{
      return this.database.ref('/directChats/'+chatKey+'/participants/'+this.uid).onDisconnect().update({
        isInside:false
      });
    }
  }

  public NewDirectMessagesCount(chatKey:string):Promise<any>{

    return this.database.ref('/directChats/'+chatKey+'/chats').once('value').then((snap)=>{
      let count = 0 as number;
      snap.forEach((message)=>{
        if(!message.val().read && message.val().user !== this.username){
          count++;
        }
      })
      return count;
    })
    .catch((err) => {
      this.logError(err);
    })

  }

  public fetchUserFromDatabase(uid:string): Promise<any>{
    return this.database.ref('users/'+uid).once('value', (userSnapshot) => {
      let user = {};
      user = userSnapshot.val();
      return user;
    })
  }

  public fetchTrade(tradeKey:string): Promise<any>{
    return this.database.ref('trades/'+tradeKey).once('value');
  }

  public acceptTradeOffer(tradeKey:string): Promise<any>{
    return this.database.ref('trades/'+tradeKey).update({
      status:'accepted'
    });
  }

  public declineTradeOffer(tradeKey:string):Promise<any>{
    return this.database.ref('trades').child(tradeKey).remove();
  }

  public removeTradeMessage(tradeKey:string,isDirect:boolean,chatKey:string,messageKey:string):Promise<any>{

    console.log('CHAT:',chatKey);
    console.log('MESSAGE:',messageKey);
    if(!isDirect){
      return this.database.ref('chatrooms/'+chatKey+'/chats/').child(messageKey).remove();
    }
    else{
      return this.database.ref('directChats/'+chatKey+'/chats/').child(messageKey).remove();
    }

  }


  public checkAmountConsole(type:string,id:any) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/consoles/'+type+'/'+id).once('value').then((snap)=>{
      if(snap.val()!== null){
        let amount = snap.val().quantity;
        return amount;
      }
      else{
        return 0;
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public addConsole(platform:any,type:string) :Promise<any>{

      return this.checkAmountConsole(type,platform.id).then((result)=>{
        if(result>0){
          return this.database.ref('/users/'+this.uid+'/consoles/'+type+'/'+platform.id).set({
            name: platform.name,
            quantity:(result + 1),
            platformId:platform.id,
            coverImage:platform.coverImage,
            blockedItem:false,
            blockedAmount:0,
          })
        }
        else{
          return this.database.ref('/users/'+this.uid+'/consoles/'+type+'/'+platform.id).set({
            name: platform.name,
            quantity:1,
            platformId:platform.id,
            coverImage:platform.coverImage,
            blockedItem:false,
            blockedAmount:0,
          })
        }
      })
      .catch((err) => {
        this.logError(err);
      })
  }

  public removeConsole(platform:any,type:string) :Promise<any>{
    return this.checkAmountConsole(type,platform.id).then((result)=>{
      if(result === 1){
        return this.database.ref('/users/'+this.uid+'/consoles/'+type+'/'+platform.id).remove();
      }
      else{
        return this.database.ref('/users/'+this.uid+'/consoles/'+type+'/'+platform.id).set({
          name: platform.name,
          quantity:(result-1),
          platformId:platform.id,
          coverImage:platform.coverImage
        })
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public checkAmountAccessory(type:string,id:any){
    return this.database.ref('/users/'+this.uid+'/accessories/'+type+'/'+id).once('value').then((snap)=>{
      if(snap.val()!== null){
        let amount = snap.val().quantity;
        return amount;
      }
      else{
        return 0;
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public addAccessory(item:any,type:string) :Promise<any>{
    return this.checkAmountAccessory(type,item.id).then((result)=>{
      if(result>0){
        return this.database.ref('/users/'+this.uid+'/accessories/'+type+'/'+item.id).set({
          name: item.name,
          quantity:(result + 1),
          itemId:item.id,
          coverImage:item.coverImage,
          blockedItem:false,
          blockedAmount:0,
        })
      }
      else{
        return this.database.ref('/users/'+this.uid+'/accessories/'+type+'/'+item.id).set({
          name: item.name,
          quantity:1,
          itemId:item.id,
          coverImage:item.coverImage,
          blockedItem:false,
          blockedAmount:0,
        })
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public removeAccessory(item:any,type:string) :Promise<any>{
    return this.checkAmountAccessory(type,item.id).then((result)=>{
      if(result === 1){
        return this.database.ref('/users/'+this.uid+'/accessories/'+type+'/'+item.id).remove();
      }
      else{
        return this.database.ref('/users/'+this.uid+'/accessories/'+type+'/'+item.id).set({
          name: item.name,
          quantity:(result-1),
          itemId:item.id,
          coverImage:item.coverImage
        })
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  // public generateStacktrace() : Promise<any> {
  //   return StackTrace.get();
  // }

  public sendTradeNotification(browserToken:string,phoneToken:string,username:string,message:string,tradeKey:string,chatKey:string): Observable<any>{

      return this.http.post(this.urlEnvironment.getTradeNotification(),{phoneToken:phoneToken,browserToken:browserToken,username:username,tradeKey:tradeKey,message:message,games:this.games,chatKey:chatKey})

    
  }

  public deleteNotification(notificationKey:string):Promise<any>{
    return this.database.ref('/notifications/'+this.uid+'/'+notificationKey).remove();
  }

  public checkPaidMembership(): Promise<any>{
    return this.database.ref('users/'+this.uid+'/paidMember').once('value');
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
      .catch((err) => {
        this.logError(err);
      })
    })
    .catch((err) => {
      this.logError(err);
    })


  }

  public errorDismissed(value:boolean):void{
    this.errorDismiss = value;
  }

  public signUp(email: string, password: string,username:string,firstName:string,lastName:string): Promise<any> {
    
    return firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
          let user = firebase.auth().currentUser;
          this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,username,'',firstName,lastName)
          .then(()=>{
            return user.sendEmailVerification();
          })
          .catch((err) => {
            this.logError(err);
          })
      })
      .catch((err) => {
        this.logError(err);
      })
      .then((user) => {
        return this.signOut();
      })
      .catch((err) => {
        this.logError(err);
      })
  }
  
  public signIn(email: string, password: string): Promise<any> {
    return firebase.auth().signInWithEmailAndPassword(email, password).then((data)=>{
      return this.database.ref('/users/'+data.user.uid).once('value').then((snap)=>{
        let user = snap.val();
        return this.flagLogin(data.user.uid).then(()=>{
          return user;
        })
        .catch((err) => {
          this.logError(err);
        })
      })
      .catch((err) => {
        this.logError(err);
      })
    })
    .catch((err) => {
      this.logError(err);
    })
  }




  public getUserAddress(lat:string,lng:string,apiKey:string):Observable<any>{
    
    return this.http.get(this.urlEnvironment.getUserAddress()+lat+','+lng+'&key='+apiKey);
  }

  public getGamesAPI() : Observable<any> {
    let body = {};
    return this.http.get(this.urlEnvironment.getGamesAPI())
  }

  public getOfferingCount(gameId:number,platformId:number,) :Promise<any>{
    return this.database.ref('/videogames/'+platformId+'/'+gameId+'/offering_count').once('value')
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
     
    })
    .catch((err) => {
      this.logError(err);
    })

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
    .catch((err) => {
      this.logError(err);
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
    .catch((err) => {
      this.logError(err);
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

  public findTradePartner(game:any,type:string):Promise<any>{
    return this.database.ref('/users').once('value').then((snap)=>{
      let users = [];
      if(type === 'offering'){
        snap.forEach((user)=>{
          if(user.val().videogames !== undefined){
            if(user.val().videogames.interested !== undefined){
              let interestedGames = user.val().videogames.interested
              if(game.key in interestedGames){
                console.log('interested match found:',user.val().videogames.interested[game.key]);
                users.push(user.val());
              }
            }
          }
        })
        return users;
      }
      else{
        snap.forEach((user)=>{
          if(user.val().videogames !== undefined){
            if(user.val().videogames.offer !== undefined){
              let offeringGames = user.val().videogames.offer;
              if(game.key in offeringGames){
                console.log('offering match found:',user.val().videogames.offer[game.key]);
                users.push(user.val());
              }
            }
          }
        })
        return users;
      }
      
    })
    .catch((err) => {
      this.logError(err);
    })
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
    .catch((err) => {
      this.logError(err);
    })
    
    
  }

  public sendMessageToUser():Promise<any>{
    return
  }

  public createTrade(games:any,username: string,chatKey:string):Promise<any>{

    this.games = games;

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
        proposer:this.uid,
        receiver:key,
        chatKey:chatKey,
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
        creationTime: new Date().getTime()
      }).then(()=>{
        return tradeKey;
      })
      .catch((err) => {
        this.logError(err);
      })
    })
    .catch((err) => {
      this.logError(err);
    })
    
  }

  public checkBlockedItems(userKey:string,games:any):Promise<any>{
    return this.database.ref('/users/'+userKey+'/videogames/offer').once('value').then((snap)=>{
     if(snap.val() !== null){
        let blockedArray = [];
        snap.forEach((item)=>{
          let obj = {
            gameId: item.key,
            platformId: item.val().platformId,
            blocked:item.val().blockedItem,
            blockedAmount:item.val().blockedAmount
          }
          blockedArray.push(obj);
        })

        return blockedArray;
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public blockInventory(tradeKey:string,isProposer:boolean):Promise<any>{
    return this.database.ref('/trades/'+tradeKey).once('value').then( (snap)=>{
      if(snap.val() !== null){
      let proposer = snap.val().proposer;
      let receiver = snap.val().receiver;

      let items = snap.val().items;
      let proposerGames = [];
      let proposerConsoles = [];
      let proposerAccessories = [];
      let receiverGames = [];
      let receiverConsoles = [];
      let receiverAccessories = [];

      items.forEach((item)=>{
        if(item.type === 'offering'){
          if(item.hasOwnProperty('game')){
            proposerGames.push(item.game);
          }
          else if(item.hasOwnProperty('console')){
            proposerConsoles.push(item.console);
          }
          else if(item.hasOwnProperty('accessorie')){
            proposerAccessories.push(item.accessorie);
          }
          else{

          }
        }
        else{
          if(item.hasOwnProperty('game')){
            receiverGames.push(item.game);
          }
          else if(item.hasOwnProperty('console')){
            receiverConsoles.push(item.console);
          }
          else if(item.hasOwnProperty('accessorie')){
            receiverAccessories.push(item.accessorie);
          }
          else{}
        }
      })


      
      if(isProposer){
        return this.database.ref('/users/'+proposer+'/videogames/offer').once('value').then((res)=>{
          return this.database.ref('/users/'+proposer+'/consoles/offer').once('value').then((snap)=>{
            return this.database.ref('/users/'+proposer+'/accessories/offer').once('value').then((snap2)=>{
              
            
                
          
          res.forEach((fetchedGame)=>{
            proposerGames.forEach((game)=>{
              console.log('blocked fetched:',fetchedGame.val());
              console.log('blocked game:',game);
              if(game.title === fetchedGame.val().title && game.platform === fetchedGame.val().platform){
                if(game.pickedGames === fetchedGame.val().quantity){
                  // we completely block it
                  fetchedGame.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedGame.key);
                }
                else{
                  //we block only picked amount
                  fetchedGame.ref.update({
                    blockedAmount:game.pickedGames
                  })
                  console.log('partial block:',fetchedGame.key);
                }
              }
            })
          })

          snap.forEach((fetchedConsole)=>{
            proposerConsoles.forEach((item)=>{
              if(item.name === fetchedConsole.val().name){
                if(item.pickedConsoles === fetchedConsole.val().quantity){
                  // we completely block it
                  fetchedConsole.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedConsole.key);
                }
                else{
                  //we block only picked amount
                  fetchedConsole.ref.update({
                    blockedAmount:item.pickedConsoles
                  })
                  console.log('partial block:',fetchedConsole.key);
                }
              }
            })
          })

          snap2.forEach((fetchedAccessory)=>{
            proposerAccessories.forEach((item)=>{
              if(item.name === fetchedAccessory.val().name){
                if(item.pickedAccessories === fetchedAccessory.val().quantity){
                  // we completely block it
                  fetchedAccessory.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedAccessory.key);
                }
                else{
                  //we block only picked amount
                  fetchedAccessory.ref.update({
                    blockedAmount:item.pickedAccessories
                  })
                  console.log('partial block:',fetchedAccessory.key);
                }
              }
            })
          })
        })
        .catch((err) => {
          this.logError(err);
        })
        })
        .catch((err) => {
          this.logError(err);
        })
        })
        .catch((err) => {
          this.logError(err);
        })
      }
      else{
        return this.database.ref('/users/'+receiver+'/videogames/offer').once('value').then((res)=>{
          return this.database.ref('/users/'+receiver+'/consoles/offer').once('value').then((snap)=>{
            return this.database.ref('/users/'+receiver+'/accessories/offer').once('value').then((snap2)=>{
          
          res.forEach((fetchedGame)=>{
            receiverGames.forEach((game)=>{
              if(game.title === fetchedGame.val().title && game.platform === fetchedGame.val().platform){
                if(game.pickedGames === fetchedGame.val().quantity){
                  // we completely block it
                  fetchedGame.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedGame.key);
                }
                else{
                  //we block only picked amount
                  fetchedGame.ref.update({
                    blockedAmount:game.pickedGames
                  })
                  console.log('partial block:',fetchedGame.key);
                }
              }
            })
          })

          snap.forEach((fetchedConsole)=>{
            receiverGames.forEach((item)=>{
              if(item.name === fetchedConsole.val().name){
                if(item.pickedConsoles === fetchedConsole.val().quantity){
                  // we completely block it
                  fetchedConsole.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedConsole.key);
                }
                else{
                  //we block only picked amount
                  fetchedConsole.ref.update({
                    blockedAmount:item.pickedConsoles
                  })
                  console.log('partial block:',fetchedConsole.key);
                }
              }
            })
          })

          snap2.forEach((fetchedAccessory)=>{
            receiverGames.forEach((item)=>{
              if(item.name === fetchedAccessory.val().name){
                if(item.pickedAccessories === fetchedAccessory.val().quantity){
                  // we completely block it
                  fetchedAccessory.ref.update({
                    blockedItem:true
                  });

                  console.log('completely block:',fetchedAccessory.key);
                }
                else{
                  //we block only picked amount
                  fetchedAccessory.ref.update({
                    blockedAmount:item.pickedConsoles
                  })
                  console.log('partial block:',fetchedAccessory.key);
                }
              }
            })
          })

              
      })
      .catch((err) => {
        this.logError(err);
      })
      })
      .catch((err) => {
        this.logError(err);
      })

        })
        .catch((err) => {
          this.logError(err);
        })
      }
    }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public unblockInventory(tradeKey:string){
    return this.database.ref('/trades/'+tradeKey).once('value').then((snap)=>{
    
    let proposer = snap.val().proposer;
    let items = snap.val().items;
    let proposerGames = [];
    let proposerConsoles = [];
    let proposerAccessories = [];
    let receiverGames = [];
    let receiverConsoles = [];
    let receiverAccessories = [];

    items.forEach((item)=>{
      if(item.type === 'offering'){
        if(item.hasOwnProperty('game')){
          proposerGames.push(item.game);
        }
        else if(item.hasOwnProperty('console')){
          proposerConsoles.push(item.console);
        }
        else if(item.hasOwnProperty('accessorie')){
          proposerAccessories.push(item.accessorie);
        }
        else{

        }
      }
      else{
        if(item.hasOwnProperty('game')){
          receiverGames.push(item.game);
        }
        else if(item.hasOwnProperty('console')){
          receiverConsoles.push(item.console);
        }
        else if(item.hasOwnProperty('accessorie')){
          receiverAccessories.push(item.accessorie);
        }
        else{}
      }
    })

    return this.database.ref('/users/'+proposer+'/videogames/offer').once('value').then((res)=>{
      return this.database.ref('/users/'+proposer+'/consoles/offer').once('value').then((snap)=>{
        return this.database.ref('/users/'+proposer+'/accessories/offer').once('value').then((snap2)=>{

    
        
      res.forEach((fetchedGame)=>{
        proposerGames.forEach((game)=>{
          if(game.title === fetchedGame.val().title && game.platform === fetchedGame.val().platform){
            if(game.pickedGames === fetchedGame.val().quantity){
              // we completely block it
              fetchedGame.ref.update({
                blockedItem:false
              });

              console.log('completely block:',fetchedGame.key);
            }
            else{
              //we block only picked amount
              fetchedGame.ref.update({
                blockedAmount: (fetchedGame.val().blockedAmount - game.pickedGames)
              })
              console.log('partial block:',fetchedGame.key);
            }
          }
        })
      })

      snap.forEach((fetchedConsole)=>{
        proposerConsoles.forEach((item)=>{
          if(item.name === fetchedConsole.val().name){
            if(item.pickedConsoles === fetchedConsole.val().quantity){
              // we completely block it
              fetchedConsole.ref.update({
                blockedItem:false
              });

              console.log('completely block:',fetchedConsole.key);
            }
            else{
              //we block only picked amount
              fetchedConsole.ref.update({
                blockedAmount: (fetchedConsole.val().blockedAmount - item.pickedConsoles)
              })
              console.log('partial block:',fetchedConsole.key);
            }
          }
        })
      })

      snap2.forEach((fetchedAccessory)=>{
        proposerAccessories.forEach((item)=>{
          if(item.name === fetchedAccessory.val().name){
            if(item.pickedAccessories === fetchedAccessory.val().quantity){
              // we completely block it
              fetchedAccessory.ref.update({
                blockedItem:false
              });

              console.log('completely block:',fetchedAccessory.key);
            }
            else{
              //we block only picked amount
              fetchedAccessory.ref.update({
                blockedAmount: (fetchedAccessory.val().blockedAmount - item.pickedAccessories)
              })
              console.log('partial block:',fetchedAccessory.key);
            }
          }
        })
      })


    })
    .catch((err) => {
      this.logError(err);
    })
  })
  .catch((err) => {
    this.logError(err);
  })

    })
    .catch((err) => {
      this.logError(err);
    })






    })
    .catch((err) => {
      this.logError(err);
    })
  }

  // public incrementTradeCounter() :Promise<any>{
  //   return this.database.ref('/constants/trades_count').once('value').then((snap)=>{
  //     let count = snap.val();
  //     console.log('current trade count:',snap.val());
      
  //     return snap.ref.set(count+1);
  //   })
  // }

  // public decreaseTradeCounter() :Promise<any>{
  //   return this.database.ref('/constants/trades_count').once('value').then((snap)=>{
  //     let count = snap.val();

  //     console.log('current trade count:',snap.val());
  //     return snap.ref.set(count-1);

  //   })

  // }
  

  public cancelTradeMessage(chatKey:string,tradeKey:string): Promise<any>{
    return this.database.ref('chatrooms/'+chatKey+'/chats').orderByChild('tradeKey').equalTo(tradeKey).once('value').then((snap) =>{
      if(snap.val() !== null){
        snap.forEach((result) =>{
          let messageKey = result.val().messageKey;
          this.database.ref('chatrooms/'+chatKey+'/chats/').child(messageKey).remove();
        })
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

 

  // public updateTradeNotificationStatus(notificationKey:string): Promise<any>{
  //   return this.database.ref('/notifications/'+notificationKey).update({

  //   })
  // }

  public checkTradeStatus(tradeKey:string):Promise<any>{
    return this.database.ref('/trades/'+tradeKey).once('value')
  }

  public updateTradeStatus(tradeKey:string,status:string):Promise<any>{
    return this.database.ref('/trades/'+tradeKey).update({
      status: status
    });
  }

  public blockUser(uid:string,username:string) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/blocked').update({
      [uid]:{
        username: username
      }
    });
  }

  public unblockUser(uid:string,username:string) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/blocked/'+uid).remove();
  }

  public showTradeCard(chatKey:string,username:string,isDirect:boolean):Promise<any>{

    return this.fetchUserKey(username).then((snap)=>{

      var key = Object.keys(snap.val())[0];

      if(!isDirect){

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
          messageKey:messageKey,
        })
      }
      else{

        let newMessage = firebase.database().ref('directChats/'+chatKey+'/chats').push();

        let messageKey = newMessage.key;

        console.log('MESSAGE KEY:',messageKey);

        return newMessage.set({
          type:'trade',
          user:this.username,
          sendDate:Date(),
          tradeKey:this.tradeKey,
          toUid:key,
          fromUid:this.uid,
          messageKey:messageKey,
          read:false
        })
      }

    })
    .catch((err) => {
      this.logError(err);
    })

   
  }

  public searchGamesAPI(queryString: string,id:string):Observable<any>{

  
    let json = {
      query: queryString,
      platformID: id
    }

    return this.http.post(this.urlEnvironment.getGamesAPI(),json);
  }

  public checkExistingVideogame(id:any,list:string): Promise<any>{
    let checkType = '';
    if(list == 'offer'){
      checkType = 'interested'
    }
    else{
      checkType = 'offer';
    }
    return this.database.ref('users/'+this.uid+'/videogames/'+checkType+'/'+id).once('value')
  }

  public addVideogame(game:any,id:any,platformId:any):Promise<any>{

    return this.database.ref('/users/'+this.uid+'/videogames/'+game.type+'/'+id).once('value').then((snap)=>{
      if(snap.val() !== null){
        let count = snap.val().quantity;
        if(game.type === "offer"){
        return this.database.ref('users/'+this.uid+'/videogames/'+game.type+'/'+id).update({
          quantity:count+1
        });
        }
        else{
          return game;
        }
      }
      else{


        if(game.type === "offer"){
          return this.database.ref('users/'+this.uid+'/videogames/'+game.type+'/'+id).set({
            title:game.title,
            blockedItem:false,
            blockedAmount:0,
            genre:game.genre,
            releaseDate:game.releaseDate,
            coverPhoto:game.coverPhoto,
            esrbRating:game.esrbRating,
            platform:game.platform,
            platformId:platformId,
            quantity: 1
          });
        }
        else{
          return this.database.ref('users/'+this.uid+'/videogames/'+game.type+'/'+id).set({
            title:game.title,
            genre:game.genre,
            blockedItem:false,
            blockedAmount:0,
            releaseDate:game.releaseDate,
            coverPhoto:game.coverPhoto,
            esrbRating:game.esrbRating,
            platform:game.platform,
            platformId:platformId
          });
        }
      }
    })
    .catch((err) => {
      this.logError(err);
    })
    
    
  }

  public increaseGameQuantity(id:any,type:string) :Promise<any>{

    
    return this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id+'/quantity').once('value').then((snap) =>{

      let quantity = snap.val();

      this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id).update({
        quantity: quantity + 1
      })
      
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public unsubscribeFromTopic(id:any): Observable<any>{
    return this.http.post(this.urlEnvironment.getUnsubscribeTopic(),{uid:this.uid,gameId:id})
  }

  public decreaseGameQuantity(id:any,type:string) :Promise<any>{

    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    
    return this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id+'/quantity').once('value').then((snap) =>{

      let quantity = snap.val();

      if(type === 'offer'){

        if(quantity === 1){
          return this.removeGameFromList(id,type,this.uid);
        }

        else{
          return this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id).update({
            quantity: quantity - 1
          })
        }
      }
      else{
        loader.present();
        this.unsubscribeFromTopic(id).subscribe((data)=>{
          console.log('Unsubscribed from game topic');
          loader.dismiss();
          return this.removeGameFromList(id,type,this.uid);
        })
      }
      
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public notifyUsers(topic:string,gameTitle:string):Observable<any>{
    console.log('TOPIC ID:',topic);
    let json = {
      topic:topic,
      user:this.user,
      uid:this.uid,
      title:gameTitle
    }
    return this.http.post(this.urlEnvironment.getSendFCM(),json)
  }

  

  public subscribeToGame(topic:string):Observable<any>{
    let json = {
      topic:topic,
      browserToken:this.browserToken,
      phoneToken:this.phoneToken,
      uid:this.uid,
      username:this.username
    }
    return this.http.post(this.urlEnvironment.getSubscribeFCM(),json)
  }

  public saveReceivedNotification(notification:any):Promise<any>{
    let obj = {
      data:notification
    }
    let ref = this.database.ref('/notifications/'+this.uid).push();
    return ref.set(obj);
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

  public getOnlineStatus(uid:string):Reference{
    return this.database.ref('/users/'+uid+'/online');
  }

  public fetchUserKey(username:string):Promise<any>{
    
    return this.database.ref('/users').orderByChild('username').equalTo(username).once('value')
  }

  public searchUsersByUsername(query:string):Promise<any>{
    return this.database.ref('/users').orderByChild('usernameLower').startAt(query).endAt(query+'\uf8ff').once('value')
  }

  public searchUsersByName(query:string):Promise<any>{
    return this.database.ref('/users').orderByChild('nameLower').startAt(query).endAt(query+'\uf8ff').once('value')
  }

  public searchTradePartners(query:string):Observable<any>{
    return this.http.post(this.urlEnvironment.getPartners(),{query:query})
  }

  public getGame(gameId:any):Observable<any>{
    return this.http.post(this.urlEnvironment.getGame(),{id:gameId});
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
    .catch((err) => {
      this.logError(err);
    })
  }

  public disableChatNotifications(): Promise<any>{
    return this.database.ref('/users/'+this.uid).update({
      chat_notification_disable:true
    });
  }

  public enableChatNotifications(): Promise<any>{
    return this.database.ref('/users/'+this.uid).update({
      chat_notification_disable:false
    });
  }
  
  public checkIfBlocked(uid:string) :Promise<any>{

    let data = {
      exist : false
    };


    return this.database.ref('/users/'+uid+'/blocked/'+this.uid).once('value').then((snap)=>{
      if(snap.val() !== null){
        data.exist = true;
        return data;
      }
      else{
        return data;
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public checkMyBlockedList(uid:string) :Promise<any>{
    let data = {
      exist : false
    };


    return this.database.ref('/users/'+this.uid+'/blocked/'+uid).once('value').then((snap)=>{
      if(snap.val() !== null){
        data.exist = true;
        return data;
      }
      else{
        return data;
      }
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public fetchChatroomParticipants(chatKey:string,isDirect:boolean) :Promise<any>{
    if(!isDirect){
      return this.database.ref('/chatrooms/'+chatKey+'/participants').once('value');
    }
    else{
      return this.database.ref('/directChats/'+chatKey+'/participants').once('value');
    }
  }


  public createDirectChat(receiverUsername:string,receiverUid:string):Promise<any>{

            console.log('receiver:',receiverUsername);
            console.log('receiverUID:',receiverUid);

            let object = {
              key:'',
              error:false
            };
        

            return this.checkExistingDirect(this.username,receiverUsername,receiverUid).then((data)=>{
                  return this.checkIfBlocked(receiverUid).then((result)=>{
                    console.log('DATA EXIST:',data.exist);
                    console.log('RESULT EXIST:',result.exist);
                    if(!data.exist && !result.exist){
                      
                      let directChat = this.database.ref('/directChats/').push();
                      directChat.set({
                        participants:{
                          [this.uid]:{
                            username: this.username,
                            isInside:true
                          },
                          [receiverUid]:{
                            username: receiverUsername,
                            isInside:false
                          }
                        },
                        senderA:this.username,
                        senderB:receiverUsername
                      })
                      object.key = directChat.key;
                      return object;
                    }
                    else if(data.exist && !result.exist){
                      object.key = data.key;
                      return object;
                    }
                    else{
                      object.error = true;
                      return object;
                    }
                })
                .catch((err) => {
                  this.logError(err);
                })              
            })
            .catch((err) => {
              this.logError(err);
            })
            
            
  
  }
  public addFriend(friend:any) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/friends').update({
      [friend.userKey]:{
        username:friend.username
      }
    })
  }

  public fetchUserTradesAsProposer() :Promise<any>{
    return this.database.ref('/trades').orderByChild('proposer').equalTo(this.uid).once('value')
  }

  public fetchUserTradesAsReceiver() :Promise<any>{
    return this.database.ref('/trades').orderByChild('receiver').equalTo(this.uid).once('value')
  }

  public removeFriend(friend:any) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/friends/'+friend.userKey).remove();
  }

  public sendFriendNotification(userKey:string) :Observable<any>{
    return this.http.post(this.urlEnvironment.getFriendNotification(),{username:this.username,userKey:userKey,uid:this.uid,test:'test'})
  }

  public getNotifications() :Reference{
    return this.database.ref('/notifications/'+this.uid);
  }

  public loadNotifications(lastKey:string) :Promise<any>{
    if(lastKey !== null && lastKey !== undefined){ 
      return this.database.ref('/notifications/'+this.uid).orderByKey().limitToLast(7).endAt(lastKey).once('value')
    }
    else{
      return this.database.ref('/notifications/'+this.uid).orderByKey().limitToLast(7).once('value') 
    }
  }

  public markReadDirectMessages(chatKey:string):Promise<any>{
    return this.database.ref('/directChats/'+chatKey+'/chats').once('value').then((snap)=>{
      snap.forEach((message)=>{
        if(message.val().user !== this.username){
          message.ref.update({
            read:true
          });
        }
      });
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public markUserInsideChat(chatKey:string):Promise<any>{
    return this.database.ref('/directChats/'+chatKey+'/participants').once('value').then((snap)=>{
      snap.forEach((user) =>{
        if(user.key === this.uid){
          user.ref.update({
            isInside:true
          })
        }
      })
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public checkIfUserInsideChat(chatKey:string,receiverKey:string) :Promise<any>{
    
    return this.database.ref('/directChats/'+chatKey+'/participants/'+receiverKey).once('value').then((snap)=>{
      if(snap.val()!== null){
        if(snap.val().isInside !== undefined && snap.val().isInside ){
          return true;
        }
        else{
          return false;
        }
      }
    })
    .catch((err) => {
      this.logError(err);
    })
    
  }

  public notifyNewDirectMessage(chatKey:string,message:string):Observable<any>{
    let obj = {
      chatKey:chatKey,
      uid:this.uid,
      username:this.username,
      message:message,
      photo:this.user.coverPhoto
    };
    return this.http.post(this.urlEnvironment.getNewDirectMessageNotification(),obj);
  }

  public markUserOutsideChat(chatKey:string):Promise<any>{
    return this.database.ref('/directChats/'+chatKey+'/participants').once('value').then((snap)=>{
      snap.forEach((user) =>{
        if(user.key === this.uid){
          user.ref.update({
            isInside:false
          })
        }
      })
    })
    .catch((err) => {
      this.logError(err);
    })
  }

  public markReadNotifications(type:string):Promise<any>{
    // return this.database.ref('/notifications/'+this.uid+'/'+notificationKey+'/data').update({
    //   read:true
    // });

    

    return this.database.ref('/notifications/'+this.uid).once('value').then((snap)=>{
      snap.forEach((notification)=>{
        if(type === 'trading'){
          if(notification.val().data.type === 'trade' || notification.val().data.type === 'trade-accept' || notification.val().data.type === 'trade-declined'){
            if(!notification.val().data.read || notification.val().data.read === 'false'){
              notification.child('data').ref.update({
                read:true
              }).then(()=>console.log('trading notification updated!'))
              .catch((err) => {
                this.logError(err);
              })
            }
          }
        } 
        else if(type === 'social'){
          if(notification.val().data.type === type && (!notification.val().data.read || notification.val().data.read === 'false')){
            notification.child('data').ref.update({
              read:true
            }).then(()=>console.log('social notification updated!'))
            .catch((err) => {
              this.logError(err);
            })
          }
        }
        else{
          if(notification.val().data.type === 'interested' || notification.val().data.type === 'offering'){
            if(!notification.val().data.read || notification.val().data.read === 'false'){
              notification.child('data').ref.update({
                read:true
              }).then(()=>console.log('games notification updated!'))
              .catch((err) => {
                this.logError(err);
              })
            }
          }
        }
        
        // notification.ref.update({
        //   read:true
        // }).then(()=>console.log('notification updated!'));
      });
    })
    .catch((err) => {
      this.logError(err);
    })
    
  }

  public getTrades() :Reference{
    return this.database.ref('/trades/');
  }

  public getLiveTradeStatus(tradeKey:string): Reference{
    return this.database.ref('/trades/'+tradeKey);
  }

  public getFriendsList():Promise<any>{

    return this.database.ref('/users/'+this.uid+'/friends').once('value')

  }

  public liveFriendsList(): Reference{
    return this.database.ref('/users/'+this.uid+'/friends')
  }

  public liveBlockedList(): Reference{
    return this.database.ref('/users/'+this.uid+'/blocked');
  }

  public saveNotificationToken(token:string,isBrowser:boolean):Promise<any>{
    if(isBrowser){
      return this.database.ref('/users/'+this.uid).update({
        browserToken: token,
        not_available_browser:false
      })
    }
    else{
      return this.database.ref('/users/'+this.uid).update({
        phoneToken: token,
        not_available_phone:false
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
        this.logError(err);
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