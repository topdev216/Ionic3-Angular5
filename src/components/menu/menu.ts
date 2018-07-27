import { Component,Input,ViewChild } from '@angular/core';
import { AlertController,NavController,NavParams, Events, PopoverController, Nav, MenuController, Popover, ToastController, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { MessagingPage } from '../../pages/messaging/messaging';
import { PopoverComponent } from '../../components/popover/popover'; 
import * as firebase from 'firebase/app';
import { PaymentModalPage } from '../../pages/payment-modal/payment-modal';
/**
 * Generated class for the MenuComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'menu',
  templateUrl: 'menu.html'
})
export class MenuComponent {

  text: string;
  @Input()
  username:string;
  popover: Popover;

  @ViewChild('mycontent') navCtrl: NavController;

  private friends: any [] = [];

  constructor(public dataService: DataService,public alertCtrl: AlertController
    , public events: Events
    , public popoverCtrl: PopoverController
    , public menuCtrl: MenuController
    , public toastCtrl: ToastController
    , public modalCtrl: ModalController) {
    console.log('Hello MenuComponent Component');
    this.text = 'Hello World';
         
    this.events.subscribe('user logged', (data) =>{
      console.log('MENU UID:',this.dataService.uid) ;
      firebase.database().ref('/users/'+this.dataService.uid+'/friends/').on('value', (snapshot)=>{

        this.friends = [];
  
        snapshot.forEach( (childSnap)=>{
          let friend = childSnap.val();
          friend.key = childSnap.key;
          console.log('friend: '+friend);
          this.friends.push(friend);
        })
      })
    })

    this.events.subscribe('user text',(data)=>{
      this.menuCtrl.close();  
      this.popover.dismiss();
    })

  }

  private presentPopover(myEvent:any,chatKey:string,username:string): void {
    this.popover = this.popoverCtrl.create(PopoverComponent, {userId: chatKey,username:username});
    this.popover.present({
      ev: myEvent
    });
  }


  private createPublic() :void{
    let alert = this.alertCtrl.create({
      title: 'Public Chatroom',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
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
          text: 'Add',
          handler: data => {
            this.dataService.createPublicChatroom(data.name).then(()=>{
                // this.navParams.data('title',data.name)
              })
            }
          }
      ]
    })

    alert.present();

    alert.onDidDismiss(()=>{
      // this.navCtrl.push(MessagingPage);
    })
    
  }

  private showPayment():void{
   this.events.publish('payment');
  }

  private createPrivate() :void{
    let alert = this.alertCtrl.create({
      title: 'Private Chatroom',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
        {
          name: 'password',
          placeholder: 'Password',
          type:'password'
        },
        {
          name:'repeat',
          placeholder:'Repeat Password',
          type:'password'
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
          text: 'Add',
          handler: data => {
            if(data.password == data.repeat){
            this.dataService.createPrivateChatroom(data.name,data.password).then(()=>{
                // this.navParams.data('title',data.name)
              })
            }
            else{
              let toast = this.toastCtrl.create({
                message: "Password don't match!",
                duration: 3000,
                position: 'top'
              });
          
              toast.onDidDismiss(() => {
                console.log('Dismissed toast');
              });
          
              toast.present();
            }
          }
        }
      ]
    })

    alert.present();

    alert.onDidDismiss(()=>{
      // this.navCtrl.push(MessagingPage);
    })
    
  }

}
