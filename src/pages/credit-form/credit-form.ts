import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Form } from 'ionic-angular';
import { UrlEnvironment } from '../../providers/services/urlEnvironment';
import { FormGroup,Validators,FormBuilder } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { ConfirmPaymentPage } from '../confirm-payment/confirm-payment';
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
  private city:string;
  private country:string;
  private state:string;
  private pickedPlan:any;


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

  submit(){
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
          this.navCtrl.push(ConfirmPaymentPage,{token:result.token.id,plan:this.pickedPlan});
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
