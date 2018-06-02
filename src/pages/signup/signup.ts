import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { DataService} from '../../providers/services/dataService';
import { Observable, Subscription } from "rxjs/Rx";

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
  subscriptionDoSaveUser: Subscription;
  firstName: string;
  zipcode: number;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }
  private submit(): void {
    this.dataService.showLoading();
    this.error = null;
    this.dataService.signUp(this.email, this.password)
      .then(() => {
          this.navCtrl.push(LoginPage);
          this.dataService.hideLoading();
      })
      .catch((error: any) => {
        this.dataService.hideLoading();
        console.log("error: ", error);
        this.error = error;
        if (error.code == 'auth/email-already-in-use') {
          console.log("email already in use");
        }
      });
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

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }

  cancel(): void {

    this.navCtrl.push(LoginPage)
      .then(() => {
        const index = this.navCtrl.getActive().index;
        this.navCtrl.remove(0, index);
      });
  }

}
