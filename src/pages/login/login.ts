import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { SignupPage } from '../../pages/signup/signup';
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService) {
  }

  ngOnInit(){
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  private googleLogin():void{
    this.dataService.showLoading();
    this.dataService.googleLogin().then((data:any)=>{
      this.dataService.hideLoading();
      this.navCtrl.setRoot(TabsPage);
    })
  }

  private createAccount(): void {
    this.navCtrl.push(SignupPage);
  }

  private facebookLogin():void{
    this.dataService.showLoading();
    this.dataService.facebookLogin().then((data:any)=>{
      this.dataService.hideLoading();
    })
  }

  private twitterLogin():void{
    this.dataService.showLoading();
    this.dataService.twitterLogin().then((data:any)=>{
      this.dataService.hideLoading();
    })
  }



}
