import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController } from 'ionic-angular';
import { DataService} from '../../providers/services/dataService'; 
import { AddVideogamePage } from '../../pages/add-videogame/add-videogame'; 
import { AddressModalPage } from '../../pages/address-modal/address-modal';
import * as firebase from 'firebase/app';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  emailAddress:string;
  photoUrl:string;
  phoneNumber:string;
  remainingDays:number;
  streetAddress:string;
  city:string;
  state: string;
  zipCode:string;
  country:string;


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl : ModalController
  , public alertCtrl: AlertController) {

    
    
    
  }

  ionViewWillEnter(){
    firebase.database().ref('users/' + this.dataService.uid).once('value', (snapshot) => {
      if(snapshot.val().address){
        let address = snapshot.val().address;
        console.log(address.street);
        this.streetAddress = address.street;
        this.city = address.city;
        this.state = address.state;
        this.zipCode = address.zipCode;
        this.country = "USA"
      }
      else{
        this.streetAddress = "Please set your address";
      }
      if(snapshot.val().phoneNumber){
        let phoneNumber = snapshot.val().phoneNumber;
        this.phoneNumber = phoneNumber;
      }
      else{
        this.phoneNumber = "Please set your phone number"; 
      }
    });
    this.emailAddress = this.dataService.email;
    this.photoUrl = this.dataService.user.photoURL;
    // this.phoneNumber = this.dataService.user.phoneNumber;
    this.remainingDays = this.dataService.getRemainingDays(this.dataService.user);
  }

  editAddress(){
    let addressModal = this.modalCtrl.create(AddressModalPage,{uid: this.dataService.user.uid});
    addressModal.onDidDismiss( (data)=>{
      firebase.database().ref('users/' + this.dataService.uid).once('value', (snapshot) => {
        if(snapshot.val().address){
          let address = snapshot.val().address;
          console.log(address.street);
          this.streetAddress = address.street;
          this.city = address.city;
          this.state = address.state;
          this.zipCode = address.zipCode;
          this.country = "USA"
        }
        else{
          this.streetAddress = "Please set your address";
        }
        if(snapshot.val().phoneNumber){
          let phoneNumber = snapshot.val().phoneNumber;
          this.phoneNumber = phoneNumber;
        }
        else{
          this.phoneNumber = "Please set your phone number"; 
        }
      })
      
    })
    addressModal.present();
  }


  changeProfile(){
    console.log('hello');
  }

  editPhoneNumber(){
    let alert = this.alertCtrl.create({
      title: 'Edit Phone Number',
      inputs: [
        {
          name: 'phoneNumber',
          placeholder: 'Phone Number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Submit',
          handler: data => {
            this.phoneNumber = data.phoneNumber;
            this.dataService.savePhoneNumber(this.phoneNumber);
          }
        }
      ]
    });
    alert.present();
  }

  addVideogame(){
    this.navCtrl.push(AddVideogamePage);
  }
}
