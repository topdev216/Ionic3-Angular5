import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { CreditFormPage } from '../credit-form/credit-form';

/**
 * Generated class for the PaymentModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment-modal',
  templateUrl: 'payment-modal.html',
})
export class PaymentModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentModalPage');
  }

  showCredit(){
    this.navCtrl.push(CreditFormPage);
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
