import { Component } from '@angular/core';
import { ViewController, Events, NavParams } from 'ionic-angular';

/**
 * Generated class for the PartnerPopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'partner-popover',
  templateUrl: 'partner-popover.html'
})
export class PartnerPopoverComponent {

  type: string;
  data:any;
  constructor(public viewCtrl: ViewController, public events: Events, public navParams: NavParams) {
    console.log('Hello PartnerPopoverComponent Component');
    this.type = this.navParams.get('type');
    this.data = this.navParams.get('data');
  }

  viewProfile(){
    this.viewCtrl.dismiss();
    this.events.publish('view profile',{data:this.navParams.get('data'),type:this.type});
  }

  viewGames(){
    this.viewCtrl.dismiss();
    this.events.publish('view games',{data:this.navParams.get('data'),type:this.type});
  }

  sendMessage(){
    this.viewCtrl.dismiss();
    this.events.publish('send message', {data:this.navParams.get('data'), type:this.type});
  }

}
