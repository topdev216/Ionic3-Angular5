import { Component } from '@angular/core';
import { NavParams, ViewController, NavController, Events } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../../pages/profile/profile';

/**
 * Generated class for the NotificationPopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'notification-popover',
  templateUrl: 'notification-popover.html'
})
export class NotificationPopoverComponent {

  text: string;
  type:string;
  data:any;
  key:string;
  constructor(private navParams: NavParams, private dataService: DataService, private viewCtrl: ViewController
    , private navCtrl: NavController
    , private events: Events) {
    console.log('Hello NotificationPopoverComponent Component');
    this.data = this.navParams.get('data').notification.data;
    this.key = this.navParams.get('data').notificationKey
    this.type = this.data.type;
    console.log('THE DATA:',this.data);
  }


  remove(){
    this.dataService.deleteNotification(this.key).then(() =>{
      console.log('notification deleted!');
      this.viewCtrl.dismiss();
    })
  }

  goProfile(){
      this.navCtrl.push(ProfilePage,{user:{userKey:this.data.uid},search:true})
      this.viewCtrl.dismiss();
  }

  sendMessage(){
    let userObj = JSON.parse(this.data.user);
    this.events.publish('user text',userObj.username);
    this.viewCtrl.dismiss();
  }




}
