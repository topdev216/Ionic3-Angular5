import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Form } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { SignupPage } from '../../pages/signup/signup';
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';
import { AddUsernamePage } from '../add-username/add-username';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { FormBuilder, Validators } from '@angular/forms';
import { Keyboard } from 'ionic-angular';



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
   
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  email: string;
  password: string;
  loginForm = this.fb.group({
    email: ['',Validators.compose([Validators.required,Validators.email])],
    password:['',Validators.required]
  });
  tabBar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl: ModalController
  , public fb: FormBuilder
  , public keyboard: Keyboard) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
  }

  ngOnInit(){
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  private googleLogin():void{
    this.dataService.showLoading('Please wait...');
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
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  private hideShowPassword(): void {

    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    console.log("this.passwordType: ", this.passwordType);
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  private login(form:any): void {
    console.log(form);
    this.dataService.showLoading('Please wait...');
    this.dataService
      .signIn(form.value.email, form.value.password)
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



}
