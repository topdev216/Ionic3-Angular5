import { Component,ViewChild } from '@angular/core';
import { Platform, Nav , NavParams, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as firebase from 'firebase/app';
import { DataService } from '../providers/services/dataService';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';

@Component({
  templateUrl: 'app.html'
})


export class MyApp {

  trialCondition:boolean = null;
  rootPage:any = TabsPage;
  user: Observable<firebase.User>;

  constructor(platform: Platform, statusBar: StatusBar
  , public dataService: DataService
  , splashScreen: SplashScreen
  , public events: Events) {

    firebase.auth().onAuthStateChanged((user: firebase.User) => {
      let uid = null;
      console.log('entered!');
      if (user && user.uid) {
        console.log("user: ", user);
        dataService.uid = user.uid;
        dataService.email = user.email;
        console.log("user.emailVerified: ", user.emailVerified);
        uid = user.uid;
        dataService.user = user;
        this.events.publish('user logged',{
          condition:true
        })

        
        
        
        if (user.emailVerified) {
          if(dataService.getRemainingDays(user) <= 0){
            this.trialCondition = false;
            console.log('Trial expired');
          }
          else{
            this.trialCondition = true;
            console.log('User on trial..')
          }
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

