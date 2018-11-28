import { Component, ElementRef, ViewChild, NgZone, Output, EventEmitter, AnimationKeyframe, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Gesture, PopoverController, Segment, InfiniteScroll } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../profile/profile';
import { NotificationPopoverComponent } from '../../components/notification-popover/notification-popover';
import { TradeDetailsPage } from '../trade-details/trade-details';
import { MessagingPage } from '../messaging/messaging';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';


/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {

  expanded : boolean = false;
  itemExpandHeight: number = 300;
  loading: boolean;
  type:string = "trading";
  notificationData: any;
  buttonCondition:boolean = false;
  lastKey: string = null;
  finished:boolean = false;
  socialNotifications: any [] = [];
  tradeNotifications: any [] = [];
  gameNotifications: any[] = [];
  socialUnreadNotifications:number = 0;
  tradeUnreadNotifications:number = 0;
  gameUnreadNotifications:number = 0;


  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , private zone: NgZone
    , private events: Events
    , private popoverCtrl: PopoverController) {

  }

  loadNotifications(infiniteScroll? : InfiniteScroll){

    if(this.finished){
      if(infiniteScroll){
      infiniteScroll.enable(false);
      this.loading = false;
      }
      this.loading = false;
      return;
    }
    else{
    this.socialUnreadNotifications = 0;
    this.tradeUnreadNotifications = 0;
    this.gameUnreadNotifications = 0; 
    let arrayKeys = [];
    this.dataService.loadNotifications(this.lastKey).then((snap)=> {
    console.log('snap length',snap.numChildren());
    if(snap.numChildren()==1 && this.lastKey !== null){
      this.finished = true;
      setTimeout(()=>{
        infiniteScroll.complete();
      },3000);
      return;
    }
    else{
    let count = 0;
    snap.forEach((notification,index)=>{
      console.log('notification key:',notification.key);
      arrayKeys.push({
        key:notification.key,
        data:notification.val().data
      });
      console.log('index:',count);
      if(index === snap.numChildren()-1 && this.lastKey !== null){
        return;
      }
      else{
      if(notification.val().data.type == 'social'){
        if(!notification.val().data.read || notification.val().data.read === 'false'){
          this.socialUnreadNotifications++;
        }

        if(this.lastKey !== null && count === (snap.numChildren() - 1) ){
          // this.zone.run(()=>{
          //   this.socialNotifications.splice((this.socialNotifications.length - 1),1);
          // })
          return;
        }
        else{
            let string = notification.val().user;
            let user = JSON.parse(string);
            let initialLetter = user.username.substring(0,1).toUpperCase();
          let obj = {
            notification: notification.val(),
            initialLetter: initialLetter,
            expanded:false,
            timestamp: Number(notification.val().data.creationTime),
            games:notification.val().games,
            expandHeight:100,
            notificationKey:notification.key
          };


          this.zone.run(() => {
            this.socialNotifications.push(obj);
          })
        }
      }
      else if(notification.val().data.type == 'trade'){
        if(!notification.val().data.read || notification.val().data.read === 'false'){
          this.tradeUnreadNotifications++;
        }

        if(this.lastKey !== null && count === (snap.numChildren() - 1) ){
          // this.zone.run(()=>{
          //   this.tradeNotifications.splice((this.tradeNotifications.length - 1),1)
          // })
          return;
        }
        else{
        this.dataService.checkTradeStatus(notification.val().data.key).then((snap) =>{
          if(snap.val() !== null){
            if(snap.val().status === 'pending'){
             
              let obj = {
                notification: notification.val(),
                expanded:false,
                timestamp: Number(notification.val().data.creationTime),
                games:notification.val().games,
                expandHeight:240,
                buttonCondition:true,
                tradeStatus:snap.val().status,
                notificationKey:notification.key

              };
              this.zone.run(() => {
                this.tradeNotifications.push(obj);
              })


            }
            else{
             
              let obj = {
                notification: notification.val(),
                expanded:false,
                timestamp: Number(notification.val().data.creationTime),
                games:notification.val().games,
                expandHeight:240,
                buttonCondition:false,
                tradeStatus:snap.val().status,
                notificationKey:notification.key
              };
              this.zone.run(() => {
                this.tradeNotifications.push(obj);
              })

            }
          }
          else{
           
              let obj = {
                notification: notification.val(),
                expanded:false,
                timestamp: Number(notification.val().data.creationTime),
                games:notification.val().games,
                expandHeight:240,
                buttonCondition:false,
                notificationKey:notification.key
              };
              this.zone.run(() => {
                this.tradeNotifications.push(obj);
              })
          }
          
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
        
      }
      else if(notification.val().data.type == 'offering' || notification.val().data.type == 'interested'){
        if(!notification.val().data.read || notification.val().data.read === 'false'){
          this.gameUnreadNotifications++;
        }

        if(this.lastKey !== null && count === (snap.numChildren() - 1) ){
          // this.zone.run(()=>{
          //   this.gameNotifications.splice((this.gameNotifications.length - 1),1);
          // })
          return;
        }
        else{
          let string = notification.val().data.user as string;
          let obj = {};
          let user = JSON.parse(string);
          console.log('notification user:',user);
          let initialLetter = user.username.substring(0,1).toUpperCase();
          obj = {
            notification: notification.val(),
            initialLetter:initialLetter,
            expanded:false,
            timestamp: Number(notification.val().data.creationTime),
            games:notification.val().games,
            expandHeight:100,
            notificationKey:notification.key
          };
          this.zone.run(() => {
            this.gameNotifications.push(obj);
          })
        }
      }
      else{
        if(this.lastKey !== null && count === (snap.numChildren() - 1) ){
          return;
          // this.zone.run(()=>{
          //   this.tradeNotifications.splice((this.tradeNotifications.length-1),1);
          // })
        }
        else{
         
          let obj = {
            notification: notification.val(),
            expanded:false,
            timestamp: Number(notification.val().data.creationTime),
            games:notification.val().games,
            expandHeight:0,
            notificationKey:notification.key
          };
          this.zone.run(() => {
            this.tradeNotifications.push(obj);
          })
        }
      }
      }
      count++;
    })
    }

    
    this.lastKey = arrayKeys[0].key;    
    console.log('last key:',this.lastKey);

    this.socialNotifications.reverse();
    this.tradeNotifications.reverse();
    this.gameNotifications.reverse();


    console.log('social array length:',this.socialNotifications.length)
    console.log('trade array length:',this.tradeNotifications.length);
    console.log('game array length:',this.gameNotifications.length);
    if(infiniteScroll){
      setTimeout(()=>{
        infiniteScroll.complete();
      },3000);
    }
  })
  .catch((err) => {
    this.dataService.logError(err);
  })
  }

  
  }

  ngOnInit(){
    this.loadNotifications();
    this.readNotifications(this.type);
  }

  private showPopoverHeader(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  ionViewWillEnter() {

    this.events.subscribe('open profile',(data) =>{
      console.log('received',data);
      this.viewProfile(data.data);
    })


    this.events.subscribe('text notification',(data)=>{
      console.log(data);
      let user = JSON.parse(data.user);
      this.dataService.createDirectChat(user.username,data.uid).then((chatKey)=>{
        this.navCtrl.push(MessagingPage,{title:user.username,key:chatKey.key,username:this.dataService.username,condition:true});
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
    })

    this.notificationData = this.navParams.get('data') || null;
    if(this.notificationData !== null){
      if(this.notificationData.type === 'offering' || this.notificationData.type === 'interested' ){
        this.type = 'games';
      }
      else if(this.notificationData.type === 'social'){
        this.type = 'social';
      }
      else{
        this.type = 'trading';
      }

    }
  }

  ionViewWillLeave(){
    this.events.unsubscribe('open profile');
    this.events.unsubscribe('text notification');
  }

  readNotifications(type:string){
    console.log('type is:',type);
   
    this.dataService.markReadNotifications(type); 
    
  }

  showPopover(myEvent:any,notification:any){
    console.log('HELLO')
    let popover = this.popoverCtrl.create(NotificationPopoverComponent,{data:notification})
    popover.present({
      ev: myEvent
    });

  }

  viewDetails(notification:any){
    let tradeKey = notification.notification.data.key;
    let chatKey = notification.notification.data.chatKey;
    this.navCtrl.push(TradeDetailsPage,{tradeKey:tradeKey,chatKey:chatKey,notificationKey:notification.notificationKey})
  }

  expand(notification:any){

    if(notification.notification.data.type == 'trade-accept' || notification.notification.data.type == 'trade-declined'){
      return notification;
    }
    else{

      if(notification.notification.data.type == 'trade'){
        this.itemExpandHeight = 270;
        this.tradeNotifications.map((item) => {
          if( notification === item ){
            item.expanded = !item.expanded;
          }
          else{
            item.expanded = false;
          }
          return item
        })
      }
      // else if(notification.notification.data.type == 'social'){
      //   this.itemExpandHeight = 100;
      //   this.socialNotifications.map((item) => {
      //     if( notification === item ){
      //       item.expanded = !item.expanded;
      //     }
      //     else{
      //       item.expanded = false;
      //     }
      //     return item
      //   })
      // }
      // else if(notification.notification.data.type == 'offering' || notification.notification.data.type == 'interested'){
      //   this.itemExpandHeight = 100;
      //   this.tradeNotifications.map((item) => {
      //     if( notification === item ){
      //       item.expanded = !item.expanded;
      //     }
      //     else{
      //       item.expanded = false;
      //     }
      //     return item
      //   })
      // }
      
    
      

    }
    
  }

  delete(notification:any){
    this.dataService.deleteNotification(notification.notificationKey).then(() =>{
      console.log('notification deleted!');
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  viewProfile(notification:any){
    let uid = notification.notification.data.uid;

    this.navCtrl.push(ProfilePage,{user:{userKey:uid},search:true});
  }

  sendMessage(user:string){
    let userObj = JSON.parse(user);
    this.events.publish('user text',userObj.username);
  }



  acceptTrade(notification:any){
    let tradeKey = notification.notification.data.key;
    let chatKey = notification.notification.data.chatKey;
    this.dataService.acceptTradeOffer(tradeKey).then(()=>{
      this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',tradeKey,chatKey).subscribe((data:any)=>{
        console.log(data)
        this.buttonCondition = true;
        for(let i = 0 ; i < this.tradeNotifications.length ; i++){
          if(this.tradeNotifications[i].notificationKey === notification.notificationKey){
              this.tradeNotifications[i].tradeStatus = 'accepted'
            
          }
        }
      })
      
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  declineTrade(notification:any){
    let tradeKey = notification.notification.data.key;
    let chatKey = notification.notification.data.chatKey
    this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',tradeKey,chatKey).subscribe((data:any)=>{
      console.log(data);
      this.buttonCondition = true;
      this.dataService.declineTradeOffer(tradeKey).then(()=>{
        this.dataService.cancelTradeMessage(chatKey,tradeKey).then(() =>{
          console.log('trade declined and removed');
          this.delete(notification);
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
  })
  .catch((err) => {
    this.dataService.logError(err);
  })
 
})
  }

}
