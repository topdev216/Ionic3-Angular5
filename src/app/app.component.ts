import { Component,ViewChild } from '@angular/core';
import { Platform, Nav , NavParams, Events, NavController,MenuController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase/app';
import { DataService } from '../providers/services/dataService';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import { MessagingPage } from '../pages/messaging/messaging';
import { PaymentModalPage } from '../pages/payment-modal/payment-modal';

@Component({
  templateUrl: 'app.html'
})


export class MyApp {

  trialCondition:boolean = null;
  remainingDays:number;
  rootPage:any = TabsPage;
  user: Observable<firebase.User>;
  username:string;

  @ViewChild('mycontent') navCtrl: NavController;

  constructor(platform: Platform, statusBar: StatusBar
  , public dataService: DataService
  , splashScreen: SplashScreen
  , public events: Events
  , public menuCtrl: MenuController
  , public modalCtrl: ModalController) {
    
    
    this.events.subscribe('user text',(data)=>{

      dataService.fetchUserKey(data).then((snapshot)=>{
        var key = Object.keys(snapshot.val())[0];
        dataService.createDirectChat(data,key).then((chatKey)=>{
          this.navCtrl.push(MessagingPage,{title:data,key:chatKey,username:dataService.username,condition:true});
          })
      })
      
    })

    firebase.auth().onAuthStateChanged((user: firebase.User) => {
      let uid = null;
      console.log('entered!');
      if (user && user.uid) {
        console.log("user: ", user);
        dataService.uid = user.uid;
        this.menuCtrl.enable(true,'myMenu');
        
        dataService.email = user.email;
        console.log("user.emailVerified: ", user.emailVerified);
        uid = user.uid;
        dataService.user = user;
        dataService.fetchUserFromDatabase(user.uid).then((user)=>{
          dataService.username = user.username;
          dataService.getFriendsList().then((data)=>{
            data.forEach((childSnap)=>{
              let friend = childSnap.val();
              friend.key = childSnap.key;
              dataService.friends.push(friend);
            })
          })
          this.username = user.username;
        })
        this.events.publish('user logged',{
          condition:true
        })

        
        
        
        if (user.emailVerified) {
          this.dataService.getConstants().then(()=>{
          this.remainingDays = this.dataService.getRemainingDays(user);
          if(this.remainingDays <= (this.dataService.trialEnd) ){
            this.trialCondition = false;
            console.log('Trial expired');
            let paymentModal = this.modalCtrl.create(PaymentModalPage);
            paymentModal.present();
            }
          else{
            this.trialCondition = true;
            console.log(this.remainingDays);
            console.log('User on trial..');
            }
          })
          
        }
      }
      if (user && user.uid && !user.emailVerified) {
        uid = user.uid;
        user.sendEmailVerification();
        this.dataService.showToast("Verification email sent");
      } else if (user == null) {
        this.events.publish('user logged',{
          condition:false
        })
        this.menuCtrl.enable(false,'myMenu');
        console.log("user == null? ", user == null);
        console.log("nothing");
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
    });

  }
}

