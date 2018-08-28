import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../profile/profile';

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
  type:string = "social";

  socialNotifications: any [] = [];
  tradeNotifications: any [] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , private zone: NgZone) {
      this.loading = true;
    this.dataService.getNotifications().on('value',(data)=>{
      this.loading = true;
      this.socialNotifications = [];
      this.tradeNotifications = [];
      data.forEach( (notification) =>{


        console.log('NOTIFICATION KEY',notification.key);

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
      this.loading = false;
    })

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
  }

  // ionViewWillEnter() {
  //   this.loading = true;
  // }

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
      else if(notification.notification.data.type == 'social'){
        this.itemExpandHeight = 100;
        this.socialNotifications.map((item) => {
          if( notification === item ){
            item.expanded = !item.expanded;
          }
          else{
            item.expanded = false;
          }
          return item
        })
      }
    
      

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

  acceptTrade(notification:any){
    let tradeKey = notification.notification.data.key;
    this.dataService.acceptTradeOffer(tradeKey).then(()=>{
      this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',tradeKey).subscribe((data:any)=>{
        console.log(data);

      })
      
    })
  }

  declineTrade(notification:any){
    let tradeKey = notification.notification.data.key;
    this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',tradeKey).subscribe((data:any)=>{
      console.log(data);
      this.dataService.declineTradeOffer(tradeKey).then(()=>{
        console.log('trade declined and removed');
  })
 
})
  }

}
