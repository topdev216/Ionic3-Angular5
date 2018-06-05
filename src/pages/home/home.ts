import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { LoadingPage } from '../../pages/loading/loading';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public authState:boolean = null;
  constructor(public navCtrl: NavController
  , public dataService: DataService) {
    
  }

  ionViewWillEnter(){
    
    firebase.auth().onAuthStateChanged( (user) =>{
      if(user){
        this.authState = true
      }
      else{
        this.authState = false;
      }  
    })
  }

  

  private goToLogin() :void{
    this.navCtrl.push(LoginPage);
  }

  private logout(): void{
    this.dataService.signOut().then(()=>{
      
    });
  }
}
