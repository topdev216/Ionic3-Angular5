import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, Events, ToastController } from 'ionic-angular';
import { PartnerPopoverComponent } from '../../components/partner-popover/partner-popover';
import { ProfilePage } from '../profile/profile';
import { DataService } from '../../providers/services/dataService';
import { MessagingPage } from '../messaging/messaging';
import { GamelistPage } from '../gamelist/gamelist';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';


/**
 * Generated class for the PartnerResultsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-partner-results',
  templateUrl: 'partner-results.html',
})
export class PartnerResultsPage {


  results:any;
  type:string;
  myUid:string;
  constructor(public navCtrl: NavController, public navParams: NavParams
    , public popoverCtrl: PopoverController
    , public events: Events
    , public dataService: DataService
    , public toastCtrl: ToastController) {
    this.myUid = this.dataService.uid;
    this.results = this.navParams.get('results');
    this.type = this.navParams.get('type');
    let obj = {
      name: 'TUG',
      username:'Trade Up Games',
      coverPhoto:'https://firebasestorage.googleapis.com/v0/b/tug-project-39442.appspot.com/o/logoTU.png?alt=media&token=7f20fc93-2adf-4970-a88c-64bdd7e4cca1'
    }
    this.results.push(obj);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PartnerResultsPage');
  }

  private showPopoverHeader(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  ionViewWillEnter(){
    this.events.subscribe('view profile', (data) => {
      console.log('data from popover:',data);
      this.navCtrl.push(ProfilePage,{user:{userKey:data.data.userKey}, search:true})
    })

    this.events.subscribe('send message', (data)=>{

      console.log('data from popover:',data);
      this.dataService.createDirectChat(data.data.username,data.data.userKey).then((chatKey)=>{
        console.log('returned chatkey:',chatKey);
        if(chatKey.error){
          let toast = this.toastCtrl.create({
            message:"It's not possible to message this user right now, please try again later",
            duration:3000
          });
          toast.present();
        }
        else{
        this.navCtrl.push(MessagingPage,{title:data.data.username,key:chatKey.key,username:this.dataService.username,condition:true,receiverKey:data.data.userKey});
        }
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    })

    this.events.subscribe('view games', (data)=>{
      console.log('data from popover',data);
      this.navCtrl.push(GamelistPage,{segment:'offer',condition:false,userKey:data.data.userKey})
    })
  }

  goProfile(){
    console.log('asdasd');
  }

  ionViewWillLeave(){
    this.events.unsubscribe('view profile');
    this.events.unsubscribe('send message');
    this.events.unsubscribe('view games');
  }

  showPopover(event:any, user:any){
    let popover = this.popoverCtrl.create(PartnerPopoverComponent,{data:user,type:this.type});
    popover.present({
      ev: event
    });
  }

}
