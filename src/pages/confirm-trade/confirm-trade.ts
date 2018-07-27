import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

/**
 * Generated class for the ConfirmTradePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-confirm-trade',
  templateUrl: 'confirm-trade.html',
})
export class ConfirmTradePage {

  private games:any [] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams
    , public alertCtrl: AlertController) {
    this.games = this.navParams.get('games');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmTradePage');
    for(let i = 0; i < this.games.length; i++){
      console.log(this.games[i]);
    }
  }

  confirmTrade(){
    let alert = this.alertCtrl.create({
      title: 'Confirm trade',
      message: 'Do you want to perform this trade?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm clicked');
            
          }
        }
      ]
    });
    alert.present();
  }

}
