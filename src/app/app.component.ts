declare let cordova: any;
import { Component,ViewChild } from '@angular/core';
import { Platform, Nav , NavParams, Events, NavController,MenuController, ModalController, ToastController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase/app';
import { DataService } from '../providers/services/dataService';
import { TabsPage } from '../pages/tabs/tabs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import { MessagingPage } from '../pages/messaging/messaging';
import { PaymentModalPage } from '../pages/payment-modal/payment-modal';
import { FCM } from '@ionic-native/fcm';
import { ProfilePage } from '../pages/profile/profile';
import { ConfirmPaymentPage } from '../pages/confirm-payment/confirm-payment';
import { GamelistPage } from '../pages/gamelist/gamelist';
import { NotificationPage } from '../pages/notification/notification';
import { AddUsernamePage } from '../pages/add-username/add-username';
import { FriendListPage } from '../pages/friend-list/friend-list';

@Component({
  templateUrl: 'app.html'
})


export class MyApp {

  trialCondition:boolean = null;
  remainingDays:number;
  rootPage:any = TabsPage;
  user: Observable<firebase.User>;
  username:string;
  messaging:any;
  debug:boolean = false;

  @ViewChild('mycontent') navCtrl: NavController;

  constructor(platform: Platform, statusBar: StatusBar
  , public dataService: DataService
  , splashScreen: SplashScreen
  , public events: Events
  , public menuCtrl: MenuController
  , public modalCtrl: ModalController
  , public toastCtrl: ToastController
  , public alertCtrl: AlertController
  , public fcm: FCM) {

    if(this.debug){
      this.rootPage = AddUsernamePage;
    }
    else{

    

    if(platform.is('core')){
      this.messaging = dataService.initialiazeWebFCM();
    }
    
    this.events.subscribe('user text',(data)=>{

      dataService.fetchUserKey(data).then((snapshot)=>{
        var key = Object.keys(snapshot.val())[0];
        dataService.createDirectChat(data,key).then((chatKey)=>{
          this.navCtrl.push(MessagingPage,{title:data,key:chatKey,username:dataService.username,condition:true});
          })
      })
      
    })

    this.events.subscribe('payment',(data)=>{
      this.navCtrl.push(PaymentModalPage);
    })

    this.events.subscribe('friends list',(data) =>{
      this.navCtrl.push(FriendListPage);
    })

    this.events.subscribe('myList',(data)=>{
      this.navCtrl.push(GamelistPage,{userKey:this.dataService.uid,condition:false});
    })

    this.events.subscribe('notification page', (data) => {
      this.navCtrl.push(NotificationPage);
    })

    this.events.subscribe('invite room', (data) =>{
      // dataService.sendInvitation(data).subscribe( (response) =>{
      //   console.log(response);
      // })
    })

    this.events.subscribe('invite friend', (data) => {
      
    })
    

    platform.ready().then(() => {


      firebase.auth().onAuthStateChanged((user: firebase.User) => {
        let uid = null;
        console.log('entered!');
        if (user && user.uid) {
          dataService.updateOnlineStatus(true,user.uid).then(()=>{
            console.log('user is online');
            this.events.publish('user logged',{
              condition:true
            });
          })
          console.log("user: ", user);
          dataService.uid = user.uid;
          dataService.fireUser = user;
          dataService.updateOnDisconnect(user.uid);
          this.menuCtrl.enable(true,'myMenu');
          console.log(platform);
          if(!platform.is('cordova')){
            
              this.messaging.requestPermission().then(() => {
                console.log('Notification permission granted.');
                this.messaging.getToken().then(function(currentToken) {
                  if (currentToken) {
                  console.log(currentToken)
                  dataService.browserToken = currentToken;
                  dataService.saveNotificationToken(currentToken,true).then(()=>{
                    console.log('notification token saved');
                  })
  
                  } else {
                    // Show permission request.
                    console.log('No Instance ID token available. Request permission to generate one.');
                    // Show permission UI.
                  
                  }
                }).catch(function(err) {
                  console.log('An error occurred while retrieving token. ', err);
                  
                });
              
              }).catch(function(err) {
                console.log('Unable to get permission to notify.', err);
              });
          }
          else{
            this.fcm.getToken().then((token)=>{
              dataService.phoneToken = token;
              dataService.saveNotificationToken(token,false).then(()=>{
                console.log('token saved');
              })
              .catch((err)=>{
                console.log('Something ocurred while saving token. ',err);
              })
            })
            .catch((error)=>{
              console.log('Something ocurred while retrieving token. ',error)
            })
            
          }
          dataService.email = user.email;
          console.log("user.emailVerified: ", user.emailVerified);
          uid = user.uid;
          dataService.user = user;
          dataService.fetchUserFromDatabase(user.uid).then((userDB)=>{
            dataService.user = userDB.val();
            dataService.username = userDB.val().username;
            this.events.publish('user logged2',{
              condition:true,
              username:userDB.val().username
            });
            dataService.getFriendsList().then((data)=>{
              data.forEach((childSnap)=>{
                let friend = childSnap.val();
                friend.key = childSnap.key;
                dataService.friends.push(friend);
              })
            })
            this.username = userDB.val().username;
  
          })
  
          
          if (user.emailVerified) {
            this.events.publish('user logged',{
              condition:true
            })
            this.dataService.getConstants().then(()=>{
              this.dataService.checkPaidMembership().then((snap) =>{
                console.log('paid membership:',snap.val());
                if(snap.val()!== null){
                  if(snap.val() == true){
                            console.log('user has paid!')
                          }
                  else{
                            this.navCtrl.push(PaymentModalPage);
                          }
                }
                else{
                  this.remainingDays = this.dataService.getRemainingDays(user);
                  if(this.remainingDays <= (this.dataService.trialEnd) ){
                    this.navCtrl.push(PaymentModalPage);
                  }
                  else{
                    console.log('user on trial')
                  }
                }
              })
            // this.remainingDays = this.dataService.getRemainingDays(user);
            // if(this.remainingDays <= (this.dataService.trialEnd) ){
            //   this.trialCondition = false;
            //   console.log('Trial expired');
            //   this.dataService.checkPaidMembership().then((snap) =>{
            //     if(snap.val()!== null){
            //       if(snap.val()){
            //         console.log('user has paid!')
            //       }
            //       else{
            //         this.navCtrl.push(PaymentModalPage);
            //       }
            //     }
            //   })
            //   this.navCtrl.push(PaymentModalPage);
            //   }
            // else{
            //   this.trialCondition = true;
            //   console.log(this.remainingDays);
            //   console.log('User on trial..');
            //   }
            })
            
          }
        }
        if (user && user.uid && !user.emailVerified) {
          uid = user.uid;
          user.sendEmailVerification();
          this.dataService.showToast("Verification email sent");
          this.events.publish('user logged',{
            condition:true
          })
        } else if (user == null) {
          this.events.publish('user logged',{
            condition:false
          });
          this.events.publish('user logged2',{
            condition:false
          });
          this.menuCtrl.enable(false,'myMenu');
          console.log("user == null? ", user == null);
          console.log("nothing");
        }
      });
  
      
      
  
  
      
      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.

    if(platform.is('mobile')){
      this.fcm.onNotification().subscribe(data => {
        if(data.wasTapped){
          console.log("Received in background");
          console.log('THE DATA',data);
          this.navCtrl.push(NotificationPage);
        } else {
          console.log('Message received. ', JSON.stringify(data));
          let alert = alertCtrl.create({
            title: data.title,
            message: data.body,
            buttons: [
              {
                text: 'Decline',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Accept',
                handler: () => {
                  dataService.joinPublicRoom(data.chatKey,dataService.username,false).then(()=>{
                    this.navCtrl.push(MessagingPage,{title:'',key:data.chatKey,condition:false,username:dataService.username})
                  })
                  console.log('Invitation accepted')
                }
              }
            ]
          });

          let toast = toastCtrl.create({
            message:"You've got a new notification! Check your notification tray",
            duration:2200,
            showCloseButton: true,
          })

          
          if(data.type == "chatroom"){
            alert.present();
          }
          else{
            toast.present();
          }

        };
      });

      this.fcm.onTokenRefresh().subscribe(() => {
        this.fcm.getToken().then((token)=>{
          dataService.saveNotificationToken(token,false).then(()=>{
            dataService.phoneToken = token;
            console.log('token refreshed');
          })
        })
      });
    }


    else{
      //     Retrieve Firebase Messaging object.
      this.messaging.onMessage((payload) => {
        console.log('Message received. ', payload);

        if(payload.data.type == "chatroom"){
          let alert = alertCtrl.create({
            title: 'Chatroom Invitation',
            message: payload.notification.body,
            buttons: [
              {
                text: 'Decline',
                role: 'cancel',
                handler: () => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Accept',
                handler: () => {
                  console.log('Invitation accepted')
                  dataService.joinPublicRoom(payload.data.chatKey,dataService.username,false).then(()=>{
                    this.navCtrl.push(MessagingPage,{title:'',key:payload.data.chatKey,condition:false,username:dataService.username})
                  })
                }
              }
            ]
          });
          alert.present();
        }
        else{

          let toast = toastCtrl.create({
            message:"You've got a new notification! Check your notification tray",
            duration:2200,
            showCloseButton: true,
          });
  
          toast.present();
        }

        
      });

      this.messaging.onTokenRefresh(() => {
        this.messaging.getToken().then((refreshedToken) => {
          console.log('Token refreshed.');
          // Indicate that the new Instance ID token has not yet been sent to the
          // app server.
          // Send Instance ID token to app server.
          console.log(refreshedToken);
          dataService.browserToken = refreshedToken;
          dataService.saveNotificationToken(refreshedToken,true).then(()=>{
            console.log('notification token saved');
          })
          // ...
        }).catch(function(err) {
          console.log('Unable to retrieve refreshed token ', err);
        });
      });
    }

        
      statusBar.styleDefault();
    });
    }
  }
}

