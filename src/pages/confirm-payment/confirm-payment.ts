import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
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
  private membership:string;
  private amount:string;
  private loading:boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams
    ,public dataService: DataService
    ,public toastCtrl: ToastController) {

      this.pickedPlan = this.navParams.get('plan');
      this.stripeToken = this.navParams.get('token');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmPaymentPage');
    if(this.pickedPlan ==='planA'){
      this.membership = 'Lite';
      this.amount = '$9.99';
    }
    else if(this.pickedPlan === 'planB'){
      this.membership = 'Standard';
      this.amount = '$12.99';
    }
    else{
      this.membership = 'Premium';
      this.amount = '$15.99';
    }
  }

  pay(){
    this.loading = true;
    this.dataService.createStripeCustomer(this.stripeToken,this.pickedPlan).subscribe( (data) =>{
      console.log(data);
      if(data.status == "active"){
        this.loading = false;
        this.navCtrl.popToRoot().then(()=>{
          let toast = this.toastCtrl.create({
            message:'Your payment has been approved! Welcome to TUG',
            duration:3000,
            position:'top'
          })
          toast.present();
        });
      }
      else{
        console.log(data.status);
        this.loading = false;
      }
    })
  }

}
