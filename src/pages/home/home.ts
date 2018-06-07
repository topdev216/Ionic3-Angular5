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
  private loading:boolean;
  constructor(public navCtrl: NavController
  , public dataService: DataService) {
    
  }

  ionViewWillEnter(){
    this.loading = true;
    firebase.auth().onAuthStateChanged( (user) =>{
      if(user){
        this.authState = true
        this.loading = false;
      }
      else{
        this.authState = false;
        this.loading = false;
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
