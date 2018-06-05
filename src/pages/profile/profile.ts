import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController } from 'ionic-angular';
import { DataService} from '../../providers/services/dataService'; 
import { AddVideogamePage } from '../../pages/add-videogame/add-videogame'; 
import { AddressModalPage } from '../../pages/address-modal/address-modal';
import { AddUsernamePage } from '../../pages/add-username/add-username';
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

  username:string = null;
  emailAddress:string = null;
  photoUrl:string = null;
  phoneNumber:string = null;
  remainingDays:number;
  streetAddress:string = null;
  city:string = null;
  state: string = null;
  zipCode:string = null;
  country:string = null;
  disabled:boolean = true;
  loading: boolean;


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl : ModalController
  , public alertCtrl: AlertController) {

    
    
    
  }

  ionViewWillEnter(){
    this.loading = true;

    this.dataService.fetchUserFromDatabase(this.dataService.uid).then((user) => {
      if(user.val().address){
        let address = user.val().address;
        console.log(address.street);
        this.streetAddress = address.street;
        this.city = address.city;
        this.state = address.state;
        this.zipCode = address.zipCode;
        this.country = "USA"
        
      }
      else{
        this.streetAddress = "Please set your address";
        this.city = "";
        this.state = "";
        this.zipCode = "";
        this.country = "";
        
      }
      if(user.val().phoneNumber){
        let phoneNumber = user.val().phoneNumber;
        this.phoneNumber = phoneNumber;
      }
      else{
        this.phoneNumber = "Please set your phone number"; 
      }
      if(user.val().username){
        this.username = user.val().username;
      }
      else{
        this.username = "";
        console.log('no username');
        let modal = this.modalCtrl.create(AddUsernamePage);
        modal.present();
      }

      this.remainingDays = this.dataService.getRemainingDays(this.dataService.user);
      this.emailAddress = this.dataService.email;
      this.photoUrl = this.dataService.user.photoURL;
      this.loading = false;
    });
    
    
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
        // if(snapshot.val().phoneNumber){
        //   let phoneNumber = snapshot.val().phoneNumber;
        //   this.phoneNumber = phoneNumber;
        // }
        // else{
        //   this.phoneNumber = "Please set your phone number"; 
        // }
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
