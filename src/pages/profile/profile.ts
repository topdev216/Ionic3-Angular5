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
  isFriend:boolean = false;
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

      firebase.database().ref('users/'+this.dataService.uid+'/friends').once('value').then((snap) =>{
        let friends  = snap;
        friends.forEach((friend) =>{
          if(friend.key === paramUser.userKey){
            this.isFriend = true;
          }
        });
      });
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
    this.comingFromSearch = this.navParams.get('search') || false;
  }

  openGameList(){

      this.navCtrl.push(GamelistPage,{userKey:this.paramKey,condition:false});

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
    console.log(friend);
    friend.userKey = this.paramKey;
    this.dataService.addFriend(friend).then(()=>{
      this.dataService.sendFriendNotification(this.paramKey).subscribe((data) => {
        this.isFriend = true;
        console.log(data);
        let toast = this.toastCtrl.create({
          message: 'User was added successfully',
          duration: 3000,
          position: 'top'
        })
        toast.present();
      })
    })
  }

  removeFriend(friend:any){
    console.log(friend);
    friend.userKey = this.paramKey;
    this.dataService.removeFriend(friend).then(()=>{
        this.isFriend = false;
        let toast = this.toastCtrl.create({
          message: 'User was removed successfully',
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
