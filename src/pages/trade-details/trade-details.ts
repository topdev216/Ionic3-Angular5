import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';

/**
 * Generated class for the TradeDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trade-details',
  templateUrl: 'trade-details.html',
})
export class TradeDetailsPage {

  receivingGames:any [] = [];
  givingGames:any [] = [];
  tradeKey:string;
  chatKey:string;
  messageKey:string;
  isReceiver:boolean = false;
  isProposer:boolean = false;
  isNotInvolved:boolean = false;
  notificationKey:string;
  accepted: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService) {
    this.tradeKey = this.navParams.get('tradeKey');
    console.log('trade key:',this.tradeKey);
    this.chatKey = this.navParams.get('chatKey');
    console.log('chat key:',this.chatKey);
    this.messageKey = this.navParams.get('messageKey');
    console.log('message key:',this.messageKey);
    this.notificationKey = this.navParams.get('notificationKey');
    console.log('notification key:',this.notificationKey);
    this.dataService.fetchTrade(this.tradeKey).then((snap) =>{



      let games = snap.val().items;
      let proposer = snap.val().proposer;
      let receiver = snap.val().receiver;

      console.log('RECEIVER:',receiver);
      console.log('THIS UID:',this.dataService.uid);

      if(receiver === this.dataService.uid){
        this.isReceiver = true;
        for(let i = 0 ; i < games.length ; i ++){

          if(games[i].type === 'offering'){
            this.receivingGames.push(games[i].game)
          }
          else{
            this.givingGames.push(games[i].game);
          }

        }
        if(snap.val().status === 'accepted'){
          this.accepted = true;
        }
        else if(snap.val().status === 'expired'){
          this.accepted = false;
        }
      }

      else if(proposer === this.dataService.uid){
        this.isProposer = true;
        for(let i = 0 ; i < games.length ; i ++){

          if(games[i].type === 'offering'){
            this.givingGames.push(games[i].game)
          }
          else{
            this.receivingGames.push(games[i].game);
          }

        }
      }
      else{
        this.isNotInvolved = true;
        for(let i = 0 ; i < games.length ; i ++){

          if(games[i].type === 'offering'){
            this.receivingGames.push(games[i].game)
          }
          else{
            this.givingGames.push(games[i].game);
          }

        }
      }

      

    })
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TradeDetailsPage');
  }

  acceptTrade(){
    
    this.dataService.acceptTradeOffer(this.tradeKey).then(()=>{
      this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',this.tradeKey,this.chatKey).subscribe((data:any)=>{
        console.log(data);
        this.navCtrl.pop();
      })
      
    })

  }

  declineTrade(){
    
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',this.tradeKey,this.chatKey).subscribe((data:any)=>{
          console.log(data);
          this.dataService.declineTradeOffer(this.tradeKey).then(()=>{
            this.dataService.cancelTradeMessage(this.chatKey,this.tradeKey).then(()=>{
              console.log('trade declined and removed');
              this.dataService.deleteNotification(this.notificationKey).then(() =>{
                this.navCtrl.pop();
              })
            })
      })
     
    })
  }

}
