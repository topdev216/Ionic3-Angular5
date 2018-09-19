import { Component } from '@angular/core';
import { Events, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ActionPopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'action-popover',
  templateUrl: 'action-popover.html'
})
export class ActionPopoverComponent {

  text: string;
  game:any;
  type:string;

  constructor(public events: Events,public navParams: NavParams, public viewCtrl: ViewController) {
    console.log('Hello ActionPopoverComponent Component');
    this.text = 'Hello World';
    this.game = this.navParams.get('game');
    this.type = this.navParams.get('list');
  }

  removeGame(){
    let obj = {
      game:this.game,
      list:this.type
    }
    this.events.publish('removeGame',obj);
    this.viewCtrl.dismiss();
  }

}
