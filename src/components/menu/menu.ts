import { Component,Input,ViewChild, ApplicationRef } from '@angular/core';
import { AlertController,NavController,NavParams, Events, PopoverController, Nav, MenuController, Popover, ToastController, ModalController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { MessagingPage } from '../../pages/messaging/messaging';
import { PopoverComponent } from '../../components/popover/popover'; 
import * as firebase from 'firebase/app';
import { PaymentModalPage } from '../../pages/payment-modal/payment-modal';
import { GamelistPage } from '../../pages/gamelist/gamelist';
import { ProfilePage } from '../../pages/profile/profile';
import { BugReportPage } from '../../pages/bug-report/bug-report';
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
    , public modalCtrl: ModalController
    ) {
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

    // this.events.subscribe('user text',(data)=>{
    //   this.menuCtrl.close();  
    //   this.popover.dismiss();
    // })

  }

  private goToFeedback(){
    this.events.publish('report bug');
  }

  private goToDiscover(){
    this.events.publish('discover page');
  }

  private presentPopover(myEvent:any,chatKey:string,username:string): void {
    this.popover = this.popoverCtrl.create(PopoverComponent, {userId: chatKey,username:username});
    this.popover.present({
      ev: myEvent
    });
  }

  private showPayment():void{
   this.events.publish('payment');
  }

  private goToList():void{
    this.events.publish('myList');
  }

  private goToNotification():void{
    this.events.publish('notification page');
  }

  private goToFriends():void{
    this.events.publish('friends list');
  }
}
