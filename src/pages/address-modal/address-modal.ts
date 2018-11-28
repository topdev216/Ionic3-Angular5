import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { AddressInterface } from '../../providers/interfaces/addressInterface';
import * as firebase from 'firebase/database';
import * as StackTrace from 'stacktrace-js';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';

/**
 * Generated class for the AddressModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-address-modal',
  templateUrl: 'address-modal.html',
})
export class AddressModalPage {

  private postForm: FormGroup;
  private streetAddress: string = null;
  private city: string = null;
  private zipcode: string = null;
  private state: string = null;
  private geoX:any;
  private geoY:any;
  private apiKey:string = 'AIzaSyA9RMaRNiybHZvMLsQcGB0aFR8bE7TYdcI';
  validation_messages: any;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public formBuilder: FormBuilder
  , public dataService: DataService
  , public alertCtrl: AlertController) {

    let address = this.dataService.user.address;

    this.postForm = formBuilder.group({
      streetAddress: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      zipcode: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.pattern('^(0|[1-9][0-9]*)$')])],
      city: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required, Validators.maxLength(2), Validators.minLength(2)])],
    });

    this.validation_messages = {
      'streetAddress': [
          { type: 'required', message: 'Street Address is required.' },
          { type: 'minlength', message: 'Street Address must be at least 10 characters long.' },
        ],
      'zipcode': [
        { type: 'required', message: 'Zip Code is required. '},
        { type: 'minlength', message: 'Zip Code must be at least 5 characters long.' },
        { type: 'pattern' , message: 'Zip Code must be only numbers.'}
      ],
      'city': [
        { type: 'required', message: 'City is required.' },
      ],
      'state': [
        { type: 'required', message: 'State is required.' },
      ]
      };

    this.streetAddress = address.street;
    this.state = address.state;
    this.city = address.city;
    this.zipcode = address.zipCode;
    
  }

  private submitAddress(form:any) :void {

    let address = {} as AddressInterface;
    
    address = form;
    address.zipCode = form.zipcode;
    address.city = form.city;
    address.state = form.state.toUpperCase();
    address.streetAddress = form.streetAddress;

    let alert = this.alertCtrl.create({
      title:'Confirm',
      message:'Please make sure that your address is correct. This is where you will receive return label and traded items.',
      buttons: [
        {
          text:'Accept',
          handler: () => {
            this.dataService.saveAddress(address);
            this.navCtrl.pop();
          }
        },
        {
        text:'Cancel',
        role:'cancel',
        handler: () => {}
        }
      ]
    });

    alert.present();
    
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

  ionViewDidLoad() {
    //Use Device GPS if available
    // if(navigator.geolocation){
    //   navigator.geolocation.getCurrentPosition((position:any)=>{
    //     console.log("position: ", position);
    //     this.geoX = position.coords.longitude;
    //     this.geoY = position.coords.latitude;
    //     this.dataService.getUserAddress(position.coords.latitude,position.coords.longitude,this.apiKey).
    //   subscribe((res:any)=>{
    //     let addressArray = res.results;
    //     console.log(res);
    //     console.log(addressArray);
    //     for (let i = 0; i < addressArray[0].address_components.length; i++) {
    //       for (let j = 0; j < addressArray[0].address_components[i].types.length; j++) {
    //         if (addressArray[0].address_components[i].types[j] == 'route') {
    //           this.streetAddress = res.results[0].address_components[i].short_name;
    //         }
    //         if (addressArray[0].address_components[i].types[j] == 'postal_code') {
    //           this.zipcode = addressArray[0].address_components[i].short_name;
    //         }
    //         if (addressArray[0].address_components[i].types[j] == 'administrative_area_level_1') {
    //           this.state = addressArray[0].address_components[i].long_name;
    //         }
    //         if (addressArray[0].address_components[i].types[j] == 'locality') {
    //           this.city = addressArray[0].address_components[i].long_name;
    //         }
    //       }
    //     }
    //   })
    //   });
    // }
  }

}
