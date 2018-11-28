import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { LoginPage} from '../../pages/login/login';
import { TabsPage } from '../../pages/tabs/tabs'; 
import { DataService} from '../../providers/services/dataService';
import { Observable, Subscription } from "rxjs/Rx";
import { FormBuilder, Validators } from '@angular/forms';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  email: string = "";
  password: string = "";
  passwordVerify: string = "";
  majlis: string = "";
  loading: any;
  error: any;
  username: string="";
  subscriptionDoSaveUser: Subscription;
  firstName: string;
  zipcode: number;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  registerForm = this.fb.group({
    firstName:['',Validators.required],
    lastName:['',Validators.required],
    email:['',Validators.compose([Validators.required, Validators.email])],
    username:['',Validators.required],
    password:['',Validators.required],
    verifyPassword:['',Validators.required]
  });
  tabBar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public fb: FormBuilder){
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }
  private submit(form:any): void {
    if(form.value.password === form.value.verifyPassword){
    this.dataService.showLoading('Please wait...');
    this.error = null;
    this.dataService.signUp(form.value.email, form.value.password,form.value.username,form.value.firstName,form.value.lastName)
      .then((user) => {   
            this.navCtrl.push(LoginPage);
            this.dataService.hideLoading();
          
      })
      .catch((error: any) => {
        this.dataService.logError(error);        
        this.dataService.hideLoading();
        console.log("error: ", error);
        this.error = error;
        if (error.code == 'auth/email-already-in-use') {
          console.log("email already in use");
        }
      });
    }
    else {
      alert("Password don't match!");
      return;
    }
  }

  private hideShowPassword(): void {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  private finish(): void {
    this.navCtrl.popToRoot();
  }

  ngOnDestroy(): void {

  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
  }

  cancel(): void {

    this.navCtrl.push(LoginPage)
      .then(() => {
        const index = this.navCtrl.getActive().index;
        this.navCtrl.remove(0, index);
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
  }

}
