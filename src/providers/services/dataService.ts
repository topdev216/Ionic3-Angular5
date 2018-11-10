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
import { Reference } from '@firebase/database-types';
import { GooglePlus } from '@ionic-native/google-plus';
import { Subject, ReplaySubject } from 'rxjs';


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
  public friends:any[] = [];
  public trades:any [] = [];
  public tradesChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public tradeCountChange: ReplaySubject<number> = new ReplaySubject<number> ();
  public friendsChange: ReplaySubject<any[]> =  new ReplaySubject<any[]> ();
  public blockedChange: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
  public directChatChanges: ReplaySubject<any[]> = new ReplaySubject<any[]> ();
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

  constructor(public http: HttpClient
  , public platform: Platform
  , public loadingCtrl: LoadingController
  , public afAuth: AngularFireAuth
  , public toastCtrl: ToastController
  , public zone: NgZone
  , public urlEnvironment: UrlEnvironment
  , public gplus: GooglePlus) {
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
            array[i].trade.items[j].game.platform = array[i].trade.items[j].game.platform.toLowerCase();
            array[i].trade.items[j].game.title = array[i].trade.items[j].game.title.toLowerCase();
        }
    }
      this.tradesChange.next(array);
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
        });
        reads.push(promise);
      })

      Promise.all(reads).then((values)=>{
        this.directChatChanges.next(values);
        console.log('direct chat service:',values);
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
        let obj = {
          friend:user.val()[key],
          key:key,
          online:user.val()[key].online
        };
        return obj
      },err =>{
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
      });
    })
  }

  public blockedListService(){
    this.liveBlockedList().on('value',(data)=>{
      let reads = [];
      this.blockedChange.next(this.blocked = []);
      
      data.forEach((childSnap)=>{
        let promise = this.fetchUserKey(childSnap.val().username).then((user)=>{
          
        var key = Object.keys(user.val())[0];
        let obj = {
          friend:user.val()[key],
          key:key,
          online:user.val()[key].online
        };
        return obj
      },err =>{
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
      });
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

  public saveBug(bug:any) :Promise<any>{
    let bugRef = this.database.ref('/bugs').push();

    if(bug.previousPage !== null){
      return bugRef.set({
        page:bug.page,
        previousPage:bug.previousPage,
        description:bug.description
      })
    }
    else{
      return bugRef.set({
        page:bug.page,
        description:bug.description
      })
    }
    
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
      online:true,
      chat_notification_disable:false,
      paidMember:false,
      userKey:uid
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
          return this.database.ref('/users/' + user.uid).once('value').then( (snapshot) => {
            console.log(snapshot.val());
            //user is not registered on database...
            if(snapshot.val() == null){
              this.addUserToDatabase(user.uid,user.displayName,user.email,user.metadata.creationTime,'',user.photoURL)
              return snapshot.val();
            }//user doesn't have an username yet...
            else{
              return snapshot.val();
            }
          });
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
      return this.flagLogin(this.uid).then(()=>{
        this.user = null;
        this.email = null;
        this.uid = null;
        return this.afAuth.auth.signOut();
      });
    });
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
    return firebase.auth().signInWithEmailAndPassword(email, password).then((data)=>{
      return this.database.ref('/users/'+data.user.uid).once('value').then((snap)=>{
        let user = snap.val();
        return this.flagLogin(data.user.uid).then(()=>{
          return user;
        })
      });
    });
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
  }

  public blockInventory(tradeKey:string,isProposer:boolean):Promise<any>{
    return this.database.ref('/trades/'+tradeKey).once('value').then((snap)=>{
      let proposer = snap.val().proposer;
      let receiver = snap.val().receiver;

      let items = snap.val().items;
      let proposerGames = [];
      let receiverGames = [];

      items.forEach((item)=>{
        if(item.type === 'offering'){
          proposerGames.push(item.game);
        }
        else{
          receiverGames.push(item.game);
        }
      })


      
      if(isProposer){
        return this.database.ref('/users/'+proposer+'/videogames/offer').once('value').then((res)=>{
          
          res.forEach((fetchedGame)=>{
            proposerGames.forEach((game)=>{
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

        })
      }
      else{
        return this.database.ref('/users/'+receiver+'/videogames/offer').once('value').then((res)=>{
          
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

        })
      }
    })
  }

  public unblockInventory(tradeKey:string){
    return this.database.ref('/trades/'+tradeKey).once('value').then((snap)=>{
    
    let proposer = snap.val().proposer;
    let items = snap.val().items;
    let proposerGames = [];
    let receiverGames = [];

    items.forEach((item)=>{
      if(item.type === 'offering'){
        proposerGames.push(item.game);
      }
      else{
        receiverGames.push(item.game);
      }
    })

    return this.database.ref('/users/'+proposer+'/videogames/offer').once('value').then((res)=>{
        
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

    })






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
    
    
  }

  public increaseGameQuantity(id:any,type:string) :Promise<any>{

    
    return this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id+'/quantity').once('value').then((snap) =>{

      let quantity = snap.val();

      this.database.ref('/users/'+this.uid+'/videogames/'+type+'/'+id).update({
        quantity: quantity + 1
      })
      
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
                });              
            })
            
            
  
  }
  public addFriend(friend:any) :Promise<any>{
    return this.database.ref('/users/'+this.uid+'/friends').update({
      [friend.userKey]:{
        username:friend.username
      }
    })
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

  public markReadDirectMessages(chatKey:string):Promise<any>{
    return this.database.ref('/directChats/'+chatKey+'/chats').once('value').then((snap)=>{
      snap.forEach((message)=>{
        if(message.val().user !== this.username){
          message.ref.update({
            read:true
          });
        }
      });
    });
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
              }).then(()=>console.log('trading notification updated!'));
            }
          }
        } 
        else if(type === 'social'){
          if(notification.val().data.type === type && (!notification.val().data.read || notification.val().data.read === 'false')){
            notification.child('data').ref.update({
              read:true
            }).then(()=>console.log('social notification updated!'));
          }
        }
        else{
          if(notification.val().data.type === 'interested' || notification.val().data.type === 'offering'){
            if(!notification.val().data.read || notification.val().data.read === 'false'){
              notification.child('data').ref.update({
                read:true
              }).then(()=>console.log('games notification updated!'));
            }
          }
        }
        
        // notification.ref.update({
        //   read:true
        // }).then(()=>console.log('notification updated!'));
      });
    });
    
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