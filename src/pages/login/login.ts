import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { SignupPage } from '../../pages/signup/signup';
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';
import { AddUsernamePage } from '../add-username/add-username';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';


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

  email: string;
  password: string;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl: ModalController) {
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
      console.log('logged data: ',data.username);
      if(data.username === ""){
        console.log('da pop up')
        this.navCtrl.push(AddUsernamePage);
      }
      else{
        console.log('no popup')
        this.navCtrl.popToRoot();
      }
    })
  }

  // private  
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';

  private hideShowPassword(): void {

    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    console.log("this.passwordType: ", this.passwordType);
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  private login(): void {
    this.dataService.showLoading();
    this.dataService
      .signIn(this.email, this.password)
      .then((user) => {
        console.log('login user:',user);
        this.dataService.hideLoading();
        if(user.username === ""){
          this.navCtrl.push(AddUsernamePage);
        }
        else{
        this.navCtrl.popToRoot();
        console.log("user: ", user);
        console.log("email verfied: ", user.emailVerified);
        // if(!user.emailVerified) {
        //   user.sendEmailVerification()
        //   .then(() => {
        //     this.contractorService.showToast("Please verify your email address");
        //   });
        // }
        }
      })
      .catch((error) => {
        return new ErrorObservable('Something bad happened; please try again later.');
      })
    console.log("submit");
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
