import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Form, Checkbox } from 'ionic-angular';
import { UrlEnvironment } from '../../providers/services/urlEnvironment';
import { FormGroup,Validators,FormBuilder } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { ConfirmPaymentPage } from '../confirm-payment/confirm-payment';
import { AddressInterface } from '../../providers/interfaces/addressInterface';
import { ShippingAddressFormPage } from '../shipping-address-form/shipping-address-form';
declare var Stripe:any;
/**
 * Generated class for the CreditFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-credit-form',
  templateUrl: 'credit-form.html',
})
export class CreditFormPage {

  private stripe:any;
  private card:any;
  private cardHolderName:string;
  private addressOne:string;
  private addressTwo:string;
  private zipcode:string;
  private city:string;
  private country:string;
  private state:string;
  private pickedPlan:any;
  private useAsShipping:boolean = false;
  @Input('checkbox') checkbox: Checkbox;


  constructor(public navCtrl: NavController, public navParams: NavParams
    , public urlEnvironment: UrlEnvironment
    , public dataService: DataService
   ) {

    this.pickedPlan = this.navParams.get('plan');

    this.stripe = Stripe(this.urlEnvironment.getStripeAPI());

    var elements = this.stripe.elements({locale:'en'});

    this.card = elements.create('card', {
      style: {
        base: {
          color: 'white',
          lineHeight: '18px',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
                }
        }
    });
  }

  ionViewDidLoad() {
    this.card.mount('#card-element');
  }

  selectState(event:any){
    console.log(event);
    this.state = event;
  }

  toggleAddress(event:any){
    console.log('toggle',event.checked);
    if(event.checked){
      this.useAsShipping = true;
    }
    else{
      this.useAsShipping = false;
    }
  }

  submit(){
    console.log('SHIPPING ADDRESS doesnt shows:',this.useAsShipping);


    this.stripe.createToken(this.card,{
      name:this.cardHolderName,
      address_line1:this.addressOne,
      address_line2:this.addressTwo,
      address_city:this.city,
      address_state:this.state,
      address_country:'US'
      })
      .then((result: any) => {
        console.log("result: ", result);
        console.log("result.token: ", result.token);
        console.log("result.token.id: ", result.token.id);
        this.dataService.saveStripeToken(result.token.id).then(()=>{
          console.log('token saved');
          if(this.useAsShipping){
            let address = {} as AddressInterface;
            address.streetAddress = this.addressOne + ' ' + this.addressTwo;
            address.city = this.city;
            address.state = this.state;
            address.zipCode = result.token.card.address_zip;
            this.dataService.saveAddress(address).then(()=>{
              this.navCtrl.push(ConfirmPaymentPage,{token:result.token.id,plan:this.pickedPlan});
            })
          }
          else{
            this.navCtrl.push(ShippingAddressFormPage,{token:result.token.id,plan:this.pickedPlan})
          }
        })
        // if (result && result.token) {
        //   return this.contractorService.saveCreditCard(result.token.id)
        //     .catch((error: any) => {
        //       console.log("error: ", error);
        //       return new EmptyObservable();
        //     })
        //     .subscribe();
        // } else {
        //   this.error = "error"
        // }
      });
  }



}
