import { Component } from '@angular/core';
import { ViewController, Events, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

  text: string;
  chatKey:string;
  userID:string;
  username:string;

  constructor(public viewCtrl: ViewController
    , public dataService: DataService
    , public events: Events
    , public navParams: NavParams) {
      this.chatKey = this.navParams.get('chatKey');
      this.userID = this.navParams.get('userId');
      this.username = this.navParams.get('username');
    console.log('Hello PopoverComponent Component');
    this.text = 'Hello World';
  }

  leaveChatroom(): void {
    this.events.publish('room leave',this.chatKey);
    this.close();
  }

  textUser():void{
    this.events.publish('user text',this.username);
    // this.close();
  }


  close() {
    this.viewCtrl.dismiss();
  }

}
