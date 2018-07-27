import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';

/**
 * Generated class for the ConfirmPaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-confirm-payment',
  templateUrl: 'confirm-payment.html',
})
export class ConfirmPaymentPage {

  private stripeToken:string;
  private pickedPlan:any;


  constructor(public navCtrl: NavController, public navParams: NavParams
    ,public dataService: DataService) {

      this.pickedPlan = this.navParams.get('plan');
      this.stripeToken = this.navParams.get('token');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmPaymentPage');
  }

  pay(){
    this.dataService.createStripeCustomer(this.stripeToken,this.pickedPlan).subscribe( (data) =>{
      console.log(data);
      if(data.status == "succeeded"){
        this.navCtrl.popToRoot();
      }
      else{
        console.log(data.status);
      }
    })
  }

}
