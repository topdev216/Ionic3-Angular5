import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController, ToastController } from 'ionic-angular';
import { DataService} from '../../providers/services/dataService'; 
import { AddVideogamePage } from '../../pages/add-videogame/add-videogame'; 
import { AddressModalPage } from '../../pages/address-modal/address-modal';
import { AddUsernamePage } from '../../pages/add-username/add-username';
import * as firebase from 'firebase/app';
import { GamelistPage } from '../gamelist/gamelist';

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


  user: any;
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
  comingFromSearch:boolean = false;
  paramKey:string;


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl : ModalController
  , public alertCtrl: AlertController
  , public toastCtrl: ToastController
  , public zone: NgZone) {

    
    this.user = this.navParams.get('user');
    this.comingFromSearch = this.navParams.get('search');

    if(!this.comingFromSearch){
      this.loading = true;
      firebase.database().ref('users/'+this.dataService.uid).on('value',(snap)=>{
      console.log('PROFILE LISTENER:',snap.val());
        this.user = snap.val();
        this.paramKey = this.dataService.uid;
        this.remainingDays = this.dataService.getRemainingDays(this.dataService.fireUser);
        this.zone.run(()=>{
          this.loading = false;
        })
      });
    }
    else{

      let paramUser = this.navParams.get('user');
      this.loading = true;
      firebase.database().ref('users/'+paramUser.userKey).on('value',(snap)=>{
        console.log('PROFILE LISTENER:',snap.val());
          this.user = snap.val();
          this.paramKey = paramUser.userKey;
          this.zone.run(() =>{
            this.loading = false;
          })
        });
    }


  }

  ionViewWillEnter(){
    this.comingFromSearch = this.navParams.get('search');

    // this.loading = true;
    // this.user = this.navParams.get('user');
    // this.comingFromSearch = this.navParams.get('search');
    // if(this.user == undefined){
    //   this.dataService.fetchUserFromDatabase(this.dataService.uid).then((user) => {
    //     if(user.val().address){
    //       let address = user.val().address;
    //       console.log(address.street);
    //       this.streetAddress = address.street;
    //       this.city = address.city;
    //       this.state = address.state;
    //       this.zipCode = address.zipCode;
    //       this.country = "USA"
          
    //     }
    //     else{
    //       this.streetAddress = "Please set your address";
    //       this.city = "";
    //       this.state = "";
    //       this.zipCode = "";
    //       this.country = "";
          
    //     }
    //     if(user.val().phoneNumber){
    //       let phoneNumber = user.val().phoneNumber;
    //       this.phoneNumber = phoneNumber;
    //     }
    //     else{
    //       this.phoneNumber = "Please set your phone number"; 
    //     }
    //     if(user.val().username){
    //       this.username = user.val().username;
    //     }
    //     else{
    //       this.username = "";
    //       console.log('no username');
    //       let modal = this.modalCtrl.create(AddUsernamePage);
    //       modal.present();
    //     }

    //     this.remainingDays = this.dataService.getRemainingDays(this.dataService.fireUser);
    //     console.log(this.remainingDays);
    //     this.emailAddress = user.val().email;
    //     this.photoUrl = user.val().coverPhoto;
    //     this.dataService.updateProfilePicture(this.dataService.fireUser.photoURL).then(()=>{
    //       this.loading = false;
    //     })
    //     this.loading = false;
    //   });
    // }

    // else{
    //   this.loading = false;
    //   this.streetAddress = this.user.user.address.street;
    //   this.city = this.user.user.address.city;
    //   this.state = this.user.user.address.state;
    //   this.zipCode = this.user.user.address.zipCode;
    //   this.country = "USA";
    //   this.phoneNumber = this.user.user.phoneNumber;
    //   this.username = this.user.user.username;
    //   this.photoUrl = this.user.user.coverPhoto;
    //   this.emailAddress = this.user.user.email;

    // }
    
    
  }

  openGameList(){

      this.navCtrl.push(GamelistPage,{userKey:this.paramKey});

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

  addFriend(friend:any){
    this.dataService.addFriend(friend).then(()=>{
      let toast = this.toastCtrl.create({
        message: 'User was added successfully',
        duration: 3000,
        position: 'top'
      })
      toast.present();
    })
  }

  ionViewWillLeave(){
    this.comingFromSearch = false;
  }
}
