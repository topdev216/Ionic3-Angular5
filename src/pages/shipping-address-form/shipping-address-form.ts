import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { AddressInterface } from '../../providers/interfaces/addressInterface';
import { ConfirmPaymentPage } from '../confirm-payment/confirm-payment';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

/**
 * Generated class for the ShippingAddressFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shipping-address-form',
  templateUrl: 'shipping-address-form.html',
})
export class ShippingAddressFormPage {

  private stripeToken:string;
  private addressOne:string;
  private addressTwo:string;
  private zipcode:string;
  private city:string;
  private state:string;
  private pickedPlan:any;


  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService) {
    this.pickedPlan = this.navParams.get('plan');
    this.stripeToken = this.navParams.get('token');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShippingAddressFormPage');
  }

  private submit(){

    let address = {} as AddressInterface;
      address.streetAddress = this.addressOne + ' ' + this.addressTwo;
      address.city = this.city;
      address.state = this.state;
      address.zipCode = this.zipcode;
      this.dataService.saveAddress(address).then(()=>{
        this.navCtrl.push(ConfirmPaymentPage,{token:this.stripeToken,plan:this.pickedPlan});
      })
      .catch((err) => {
        this.dataService.logError(err);
      })

  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

}
