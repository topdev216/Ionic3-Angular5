import { Component,NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController, ToastController, LoadingController } from 'ionic-angular';
import { DataService} from '../../providers/services/dataService'; 
import { AddVideogamePage } from '../../pages/add-videogame/add-videogame'; 
import { AddressModalPage } from '../../pages/address-modal/address-modal';
import * as firebase from 'firebase/app';
import { GamelistPage } from '../gamelist/gamelist';
import { MessagingPage } from '../messaging/messaging';
import { PaymentModalPage } from '../payment-modal/payment-modal';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

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
  tabBar:any;
  disabled:boolean = true;
  loading: boolean;
  isFriend:boolean = false;
  comingFromSearch:boolean = false;
  isChecked:boolean = false;
  paramKey:string;
  initialLetter:string;


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public modalCtrl : ModalController
  , public alertCtrl: AlertController
  , public toastCtrl: ToastController
  , public zone: NgZone
  , public loadingCtrl: LoadingController
  , public backbuttonService: BackButtonProvider
  , public cd: ChangeDetectorRef) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');

    
    this.user = this.navParams.get('user');
    this.isChecked = this.dataService.user.chat_notification_disable || false;
    this.comingFromSearch = this.navParams.get('search');

    if(!this.comingFromSearch){
      this.loading = true;
      firebase.database().ref('users/'+this.dataService.uid).on('value',(snap)=>{
      console.log('PROFILE LISTENER:',snap.val());
        this.user = snap.val();
        if(this.user.name !== undefined){
          this.initialLetter = this.user.name.substring(0,1);
        }
        else if(this.user.firstName !== undefined){
          this.initialLetter = this.user.firstName.substring(0,1);
        }
        else{
          this.initialLetter = this.user.username.substring(0,1).toUpperCase();
        }
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
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
      firebase.database().ref('users/'+paramUser.userKey).on('value',(snap)=>{
        console.log('PROFILE LISTENER:',snap.val());
          this.user = snap.val();
          if(this.user.name !== undefined){
            this.initialLetter = this.user.name.substring(0,1);
          }
          else if(this.user.firstName !== undefined){
            this.initialLetter = this.user.firstName.substring(0,1);
          }
          else{
            this.initialLetter = this.user.username.substring(0,1).toUpperCase();
          }
          this.paramKey = paramUser.userKey;
          this.zone.run(() =>{
            this.loading = false;
          })
        });
    }


  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'flex';
    this.comingFromSearch = this.navParams.get('search') || false;
    this.dataService.activeTab = 'ProfilePage';
    console.log(this.dataService.activeTab);
  }

  fileChange(event:any){
    let reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        console.log(reader.result);
        let url = reader.result as string;
        console.log('profile pic:',url);
        this.dataService.updateProfilePicture(url).then(()=>{
          this.user.coverPhoto = url;
          let toast = this.toastCtrl.create({
            message:'Profile picture changed',
            duration:2000
          });
          toast.present();
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  

  openGameList(){

      this.navCtrl.push(GamelistPage,{userKey:this.paramKey,condition:false});

  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
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
          placeholder: 'Phone Number',
          type:'tel'
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
            if(data.phoneNumber)
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

  sendMessage(){
    this.dataService.createDirectChat(this.user.username,this.paramKey).then((chatKey)=>{
      console.log('returned chatkey:',chatKey);
      if(chatKey.error){
        let toast = this.toastCtrl.create({
          message:"It's not possible to message this user right now, please try again later",
          duration:3000
        });
        toast.present();
      }
      else{
      this.navCtrl.push(MessagingPage,{title:this.user.username,key:chatKey.key,username:this.dataService.username,condition:true});
      }
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  goToPlans(){
    this.navCtrl.push(PaymentModalPage);
  }

  addFriend(friend:any){
    console.log(friend);
    friend.userKey = this.paramKey;
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();
      this.dataService.sendFriendNotification(this.paramKey).subscribe((data) => {
        if(data.error){
          let toast = this.toastCtrl.create({
            message: "User couldn't be reached! Please try again later",
            duration: 3000,
            position: 'top'
          });
          loader.dismiss();
          toast.present();
          console.log(data.error);
        }
        else{
          this.dataService.addFriend(friend).then(()=>{
          this.isFriend = true;
          console.log(data);
          let toast = this.toastCtrl.create({
            message: 'User was added successfully',
            duration: 3000,
            position: 'top'
          })
          loader.dismiss();
          toast.present();
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
    },(err)=>{
      let toast = this.toastCtrl.create({
        message: "User couldn't be reached! Please try again later",
        duration: 3000,
        position: 'top'
      });
      loader.dismiss(); 
      toast.present();
    })
  }

  disableChat(event:any){
    if(event.checked){
      let alert = this.alertCtrl.create({
       title:'Confirm action',
       message:"Are you sure you want to disable chat notification? You won't be able to know when someone is trying to contact you",
       buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.isChecked = false;
          }
        },
        {
          text: 'Accept',
          handler: () => {
            this.dataService.disableChatNotifications();
            this.isChecked = true;
          }
        }
      ]
    
      });
      alert.present();
    }
    else{
      this.dataService.enableChatNotifications();
    }
  }

  removeFriend(friend:any){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();
    console.log(friend);
    friend.userKey = this.paramKey;
    this.dataService.removeFriend(friend).then(()=>{
        this.isFriend = false;
        let toast = this.toastCtrl.create({
          message: 'User was removed successfully',
          duration: 3000,
          position: 'top'
        })
        loader.dismiss();
        toast.present();
      
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    
  }

  ionViewWillLeave(){
    this.comingFromSearch = false;
    this.dataService.previousTab = 'ProfilePage';
  }
}
