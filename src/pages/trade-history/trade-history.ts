import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { EN_TAB_PAGES } from '../../providers/backbutton/app.config';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';

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
  
  type:string="active";
  activeTrades: any[] = [];
  completedTrades: any[] = [];
  acceptedTrades: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService
    , public backbuttonService: BackButtonProvider) {

    this.dataService.getTrades().on('value',(snap) =>{
      this.activeTrades = [];
      this.completedTrades = [];
      this.acceptedTrades = [];
      snap.forEach((trade) =>{
        if(trade.val().proposer === this.dataService.uid || trade.val().receiver === this.dataService.uid){
          if(trade.val().status === 'pending'){
            this.activeTrades.push(trade.val());
          }
          else if(trade.val().status === 'completed'){
            this.completedTrades.push(trade.val());
          }
          else if (trade.val().status === 'accepted'){
            this.acceptedTrades.push(trade.val());
          }
          else{
          }
          
        }
      })
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TradeHistoryPage');
  }

  ionViewWillEnter() {
    this.dataService.activeTab = 'TradeHistoryPage';
    console.log(this.dataService.activeTab);
  }

  ionViewWillLeave(){
    this.dataService.previousTab = 'TradeHistoryPage';
  }

}
