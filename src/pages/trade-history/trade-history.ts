import { Component, NgZone } from '@angular/core';
import * as firebase from 'firebase';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { EN_TAB_PAGES } from '../../providers/backbutton/app.config';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';
import { PartnerResultsPage } from '../partner-results/partner-results';

/**
 * Generated class for the TradeHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trade-history',
  templateUrl: 'trade-history.html',
})
export class TradeHistoryPage {
  
  type:string="interested";
  offeringGames: any[] = [];
  interestedGames: any[] = [];
  results:any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService
    , public backbuttonService: BackButtonProvider
    , public loadingCtrl: LoadingController
    , public zone: NgZone) {

      // let loader = this.loadingCtrl.create({
      //   content:'Please wait...',
      //   spinner:'crescent'
      // });

      firebase.database().ref('/users/'+this.dataService.uid+'/videogames/offer').on('value',(snap)=>{
        this.offeringGames = [];
        snap.forEach((game)=>{
          this.zone.run(()=>{
            let obj = {
              game:game.val(),
              key:game.key
            }
            this.offeringGames.push(obj);
          })
        })
      })

      firebase.database().ref('/users/'+this.dataService.uid+'/videogames/interested').on('value',(snap)=>{
        this.interestedGames = [];
        snap.forEach((game)=>{
          this.zone.run(()=>{
            let obj = {
              game:game.val(),
              key:game.key
            }
            this.interestedGames.push(obj);
          })
        })
      })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TradeHistoryPage');
  }

  ionViewWillEnter() {
    this.dataService.activeTab = 'TradeHistoryPage';
  }

  ionViewWillLeave(){
    this.dataService.previousTab = 'TradeHistoryPage';
  }

  findPartner(game:any){
    console.log(game);
    let loader = this.loadingCtrl.create({
      content:'Finding partners...',
      spinner:'crescent'
    });
    loader.present();
    this.dataService.findTradePartner(game,this.type).then((results)=>{
      // this.results = [];
      // this.results = results;
      // this.type = 'results';
      this.navCtrl.push(PartnerResultsPage,{results:results,type:this.type}).then(()=>{
        loader.dismiss();
      })
      console.log('results:',results);
    })
  }

}
