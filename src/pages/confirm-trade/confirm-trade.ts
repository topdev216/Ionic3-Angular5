import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';

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
    , public alertCtrl: AlertController
    , public dataService: DataService) {
    this.games = this.navParams.get('games');
    // this.games.sort(function(a,b) {return (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0);} ); 

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmTradePage');
    for(let i = 0; i < this.games.length; i++){
      console.log('confirm games:',this.games[i]);
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
            this.dataService.createTrade(this.games,this.navParams.get('username')).
            then(()=>{
              console.log('trade created');
              this.navCtrl.popToRoot();
            })
          }
        }
      ]
    });
    alert.present();
  }

}
