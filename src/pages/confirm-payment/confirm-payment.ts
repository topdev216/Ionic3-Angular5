import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { TabsPage } from '../tabs/tabs';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

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
    ,public toastCtrl: ToastController
    ,public zone: NgZone
    ) {

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

  private showPopover(myEvent):void{
    StackTrace.get().then((trace) => {
      const stackString = trace[0].toString();
      this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);
    })
    .catch((err) => {
      this.dataService.logError(err);
      this.dataService.showToast('Error sending stacktrace...');
    })
  }

  pay(){
    
    this.zone.run(()=>{
      this.loading = true;
    })
    this.dataService.createStripeCustomer(this.stripeToken,this.pickedPlan).subscribe( (data) =>{
      console.log(data);
      if(data.status == "active"){
        this.zone.run(()=>{
          this.loading = false;
        })
        this.navCtrl.setRoot(TabsPage).then(()=>{
          window.location.reload();
          let toast = this.toastCtrl.create({
            message:'Your payment has been approved! Welcome to TUG',
            duration:3000,
            position:'top'
          })
          toast.present();
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
      else{
        console.log(data.status);
        let toast = this.toastCtrl.create({
          message:data.message,
          duration:3000,
          position:'top'
        });
        toast.present();
        this.zone.run(()=>{
          this.loading = false;
        })
      }
    },(err) =>{
      this.zone.run(()=>{
        this.loading = false;
      })
      let toast = this.toastCtrl.create({
        message:'An error has occurred, please try again',
        duration:2000
      });
      toast.present();
    })
  }

}
