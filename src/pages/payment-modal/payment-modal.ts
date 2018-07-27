import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,Slides } from 'ionic-angular';
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

  @ViewChild(Slides) slides: Slides;


   planA : boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public viewCtrl: ViewController) {
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentModalPage');
  }

  showCredit(){
    let currentIndex = this.slides.getActiveIndex();
    console.log('Current index is', currentIndex);
    this.navCtrl.push(CreditFormPage,{plan:currentIndex});
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

}
