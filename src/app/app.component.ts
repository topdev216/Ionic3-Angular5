declare let cordova: any;
import { Component,ViewChild } from '@angular/core';
import { Platform, Events, NavController,MenuController, ModalController, ToastController, AlertController, App, Tabs } from 'ionic-angular';
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
import { GamelistPage } from '../pages/gamelist/gamelist';
import { NotificationPage } from '../pages/notification/notification';
import { AddUsernamePage } from '../pages/add-username/add-username';
import { FriendListPage } from '../pages/friend-list/friend-list';
import { BugReportPage } from '../pages/bug-report/bug-report';
import { Globals } from '../providers/backbutton/app.config';
import { BackButtonProvider } from '../providers/backbutton/backbutton';
import { HomePage } from '../pages/home/home';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeKeyboard } from '@ionic-native/native-keyboard';
import { DiscoverPage } from '../pages/discover/discover';
import { LogsPage } from '../pages/logs/logs';

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
  alert;
  y:any;
  h:any;
  offsetY:any;



  @ViewChild('mycontent') navCtrl: NavController;

  constructor(public platform: Platform, statusBar: StatusBar
  , public dataService: DataService
  , splashScreen: SplashScreen
  , public events: Events
  , public menuCtrl: MenuController
  , public modalCtrl: ModalController
  , public toastCtrl: ToastController
  , public alertCtrl: AlertController
  , public fcm: FCM
  , public backButtonService: BackButtonProvider
  , public menu: MenuController
  , public app: App
  , public keyboard: Keyboard) {

    if(this.debug){
      this.rootPage = AddUsernamePage;
    }
    else{
      
      platform.registerBackButtonAction(() => {

        let activeTab = this.dataService.activeTab;
        let previousTab = this.dataService.previousTab;

        if(this.navCtrl.canGoBack()){
          console.log('nav stack')
          //we got a nav stack
          this.navCtrl.pop();
        }
        else{
          console.log('we on tabs');

          if(activeTab === 'HomePage'){
            //we exit the app
            let alert = this.alertCtrl.create({
              title:'Exit app',
              message:'Are you sure you want to exit?',
              buttons:[
                {
                  text:'Cancel',
                  role:'cancel',
                  handler:()=>{
                    console.log('cancel clicked');
                  }
                },
                {
                  text:'Exit',
                  handler:()=>{
                    platform.exitApp();
                  }
                }

              ]
            })
            alert.present();
          }
          else{
            console.log('we can go back');
             //go back to other tab
             const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
            
              tabsNav.select(0);
            
          }
        }
        
      });

    if(platform.is('core')){
      this.messaging = dataService.initialiazeWebFCM();
    }

    

    this.events.subscribe('report bug' , (data)=>{
      this.navCtrl.push(BugReportPage,{screenshot:data.uri, stacktrace: data.stackTrace});
    })
    
    this.events.subscribe('user text',(data)=>{

      dataService.fetchUserKey(data).then((snapshot)=>{
        var key = Object.keys(snapshot.val())[0];
        dataService.createDirectChat(data,key).then((chatKey)=>{
          this.navCtrl.push(MessagingPage,{title:data,key:chatKey.key,username:dataService.username,condition:true});
          })
      })
      
    })

    this.events.subscribe('payment',(data)=>{
      this.navCtrl.push(PaymentModalPage);
    })

    this.events.subscribe('discover page' , () =>{
      this.navCtrl.push(DiscoverPage);
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

    this.events.subscribe('logs page', () => {
      this.navCtrl.push(LogsPage);
    })

    this.events.subscribe('log out', () => {
      console.log('nav views:',this.navCtrl.getViews());
        if(this.navCtrl.getViews().length > 1){
          this.navCtrl.popToRoot().then(()=>{
            const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
            tabsNav.select(0);
          })
        }
        else{
          const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
          tabsNav.select(0);
        }
    })
    

    platform.ready().then(() => {

      this.dataService.platform = platform;

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
          dataService.friendListService();
          dataService.blockedListService();
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
            dataService.directChatService();
            this.events.publish('user logged2',{
              condition:true,
              username:userDB.val().username
            });
                        
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
                    this.remainingDays = this.dataService.getRemainingDays(user);
                    if(this.remainingDays <= (this.dataService.trialEnd) ){
                      this.navCtrl.setRoot(PaymentModalPage);
                    }
                    else{
                      console.log('user on trial')
                    }
                          }
                }
                else{
                 
                }
              })
            });
            
          }
        }
        if (user && user.uid && !user.emailVerified) {
          uid = user.uid;
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
          if(data.chatFlag === "true"){
              this.navCtrl.push(MessagingPage,{title:data.username,key:data.chatKey,username:data.receiverUsername,condition:true,receiverKey:data.receiverUid});
          }
          else{
            this.navCtrl.push(NotificationPage);
          }
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

