import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { AddressInterface } from '../../providers/interfaces/addressInterface';
import * as firebase from 'firebase/database';

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
  private apiKey:string = 'AIzaSyD7gB6aOgaSWuccp-nkamk_OlDvXRYMR4Y'

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public formBuilder: FormBuilder
  , public dataService: DataService) {

    this.postForm = formBuilder.group({
      streetAddress: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      zipcode: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      city: ['', Validators.compose([Validators.required])],
      state: ['', Validators.compose([Validators.required])],
    });
    
  }

  private submitAddress(form:any) :void {

    let address = {} as AddressInterface;
    
    address = form;
    address.zipCode = form.zipcode;
    address.city = form.city;
    address.state = form.state;
    address.streetAddress = form.streetAddress;
    address.uid = this.dataService.user.uid;

    this.dataService.saveAddress(address);
    this.navCtrl.pop();
  }

  ionViewDidLoad() {
    //Use Device GPS if available
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position:any)=>{
        console.log("position: ", position);
        this.geoX = position.coords.longitude;
        this.geoY = position.coords.latitude;
        this.dataService.getUserAddress(position.coords.latitude,position.coords.longitude,this.apiKey).
      subscribe((res:any)=>{
        let addressArray = res.results;
        console.log(addressArray);
        for (let i = 0; i < addressArray[0].address_components.length; i++) {
          for (let j = 0; j < addressArray[0].address_components[i].types.length; j++) {
            if (addressArray[0].address_components[i].types[j] == 'route') {
              this.streetAddress = res.results[0].address_components[i].short_name;
            }
            if (addressArray[0].address_components[i].types[j] == 'postal_code') {
              this.zipcode = addressArray[0].address_components[i].short_name;
            }
            if (addressArray[0].address_components[i].types[j] == 'administrative_area_level_1') {
              this.state = addressArray[0].address_components[i].long_name;
            }
            if (addressArray[0].address_components[i].types[j] == 'locality') {
              this.city = addressArray[0].address_components[i].long_name;
            }
          }
        }
      })
      });
  }//Use Google Maps API to get location
    // else{
    //   this.dataService.getUserLocation('AIzaSyCM_MMJAqeY-sL0umxqIn9cR-s4-vycnmw')
    //   .subscribe((data:any)=>{
    //     console.log("data.location.lat: ", data.location.lat);
    //     console.log("data.location.lng: ", data.location.lng);
    //     this.geoX = data.location.lng;
    //     this.geoY = data.location.lat;
    //     this.dataService.getUserAddress(data.location.lat, data.location.lng,'AIzaSyCM_MMJAqeY-sL0umxqIn9cR-s4-vycnmw')
    //     .subscribe((res:any)=>{
    //       let addressArray = res.results;
    //       console.log(addressArray);
    //       for (let i = 0; i < addressArray[0].address_components.length; i++) {
    //         for (let j = 0; j < addressArray[0].address_components[i].types.length; j++) {
    //           if (addressArray[0].address_components[i].types[j] == 'route') {
    //             this.streetAddress = res.results[0].address_components[i].short_name;
    //           }
    //           if (addressArray[0].address_components[i].types[j] == 'postal_code') {
    //             this.zipcode = addressArray[0].address_components[i].short_name;
    //           }
    //           if (addressArray[0].address_components[i].types[j] == 'administrative_area_level_1') {
    //             this.state = addressArray[0].address_components[i].long_name;
    //           }
    //           if (addressArray[0].address_components[i].types[j] == 'locality') {
    //             this.city = addressArray[0].address_components[i].long_name;
    //           }
    //         }
    //       }
    //     })
    //   })
    // }
  }

}
