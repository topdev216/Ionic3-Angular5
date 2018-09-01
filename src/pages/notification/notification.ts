import { Component, ElementRef, ViewChild, NgZone, Output, EventEmitter, AnimationKeyframe } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Gesture, PopoverController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../profile/profile';
import { NotificationPopoverComponent } from '../../components/notification-popover/notification-popover';

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


  socialNotifications: any [] = [];
  tradeNotifications: any [] = [];
  gameNotifications: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , private zone: NgZone
    , private events: Events
    , private popoverCtrl: PopoverController) {
      this.loading = true;
    this.dataService.getNotifications().on('value',(data)=>{
      this.loading = true;
      this.socialNotifications = [];
      this.tradeNotifications = [];
      this.gameNotifications = [];
      data.forEach( (notification) =>{

        if(notification.val().data.type == 'social'){
          let obj = {
            notification: notification.val(),
            expanded:false,
            timestamp: Number(notification.val().data.creationTime),
            games:notification.val().games,
            expandHeight:100,
            notificationKey:notification.key
          };

          console.log('notification browser:',obj)

          this.zone.run(() => {
            this.socialNotifications.push(obj);
          })
        }
        else if(notification.val().data.type == 'trade'){

          

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
                console.log('notification browser asdasdasd:',obj)


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
                console.log('notification browser asdasdasd:',obj)

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
                console.log('notification browser asdasdasd:',obj)
            }
            
          })
          

        }
        else if(notification.val().data.type == 'offering' || notification.val().data.type == 'interested'){
          let obj = {
            notification: notification.val(),
            expanded:false,
            timestamp: Number(notification.val().data.creationTime),
            games:notification.val().games,
            expandHeight:100,
            notificationKey:notification.key
          };
          console.log('notification browser:',obj)
          this.zone.run(() => {
            this.gameNotifications.push(obj);
          })
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
          console.log('notification browser:',obj)
          this.zone.run(() => {
            this.tradeNotifications.push(obj);
          })
        }
      })
      this.socialNotifications.reverse();
      this.tradeNotifications.reverse();
      this.gameNotifications.reverse();
      this.loading = false;
    })

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  ionViewWillEnter() {
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

  showPopover(myEvent:any,notification:any){
    console.log('HELLO')
    let popover = this.popoverCtrl.create(NotificationPopoverComponent,{data:notification})
    popover.present({
      ev: myEvent
    });

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
    this.dataService.acceptTradeOffer(tradeKey).then(()=>{
      this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',tradeKey).subscribe((data:any)=>{
        console.log(data)
        for(let i = 0 ; i < this.tradeNotifications.length ; i++){
          if(this.tradeNotifications[i].notificationKey === notification.notificationKey){
              this.tradeNotifications[i].tradeStatus = 'accepted'
            
          }
        }
      })
      
    })
  }

  declineTrade(notification:any){
    let tradeKey = notification.notification.data.key;
    this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',tradeKey).subscribe((data:any)=>{
      console.log(data);
      this.dataService.declineTradeOffer(tradeKey).then(()=>{
        console.log('trade declined and removed');
        this.delete(notification);
  })
 
})
  }

}
