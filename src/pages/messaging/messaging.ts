import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the MessagingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messaging',
  templateUrl: 'messaging.html',
})
export class MessagingPage {

  private chatTitle : string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
     this.chatTitle = this.navParams.get('title');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagingPage');
  }

}
