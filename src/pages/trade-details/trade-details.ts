import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { PickGamePage } from '../pick-game/pick-game';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

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
  expired:boolean = false;
  userA:any;
  userB:any;
  tabBar:any;
  items:any;
  loading = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService
    , public alertCtrl: AlertController
    , public loadingCtrl: LoadingController) {
    
    // let loader = this.loadingCtrl.create({
    //   content:'Please wait...',
    //   spinner:'crescent'
    // });
    // loader.present();

    this.loading = true;
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
    this.tradeKey = this.navParams.get('tradeKey');
    console.log('trade key:',this.tradeKey);
    this.chatKey = this.navParams.get('chatKey');
    console.log('chat key:',this.chatKey);
    this.messageKey = this.navParams.get('messageKey');
    console.log('message key:',this.messageKey);
    this.notificationKey = this.navParams.get('notificationKey');
    console.log('notification key:',this.notificationKey);
    this.dataService.fetchTrade(this.tradeKey).then((snap) =>{



      let items = snap.val().items;
      this.items = items;
      this.chatKey = snap.val().chatKey;
      let proposer = snap.val().proposer;
      let receiver = snap.val().receiver;

      this.dataService.fetchUserFromDatabase(proposer).then((res)=>{
        this.userA = res.val();
        console.log('userA:',this.userA);
      
      this.dataService.fetchUserFromDatabase(receiver).then((res)=>{
        this.userB = res.val();

        this.loading = false;


      if(snap.val().status === 'accepted'){
        this.accepted = true;
        this.expired = false;
      }
      else if(snap.val().status === 'expired'){
        this.accepted = false;
        this.expired = true;
      }

      console.log('RECEIVER:',receiver);
      console.log('THIS UID:',this.dataService.uid);

      if(receiver === this.dataService.uid){
        this.isReceiver = true;
        for(let i = 0 ; i < items.length ; i ++){

          if(items[i].type === 'offering'){
            if(items[i].hasOwnProperty('game')){
              this.receivingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.receivingGames.push(items[i].console)
            }
            else{
              this.receivingGames.push(items[i].accessorie)
            }
          }
          else{
            if(items[i].hasOwnProperty('game')){
              this.receivingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.receivingGames.push(items[i].console)
            }
            else{
              this.receivingGames.push(items[i].accessorie)
            }
          }

        }
      }

      else if(proposer === this.dataService.uid){
        this.isProposer = true;
        for(let i = 0 ; i < items.length ; i ++){

          if(items[i].type === 'offering'){
            if(items[i].hasOwnProperty('game')){
              this.givingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.givingGames.push(items[i].console)
            }
            else{
              this.givingGames.push(items[i].accessorie)
            }
          }
          else{
            if(items[i].hasOwnProperty('game')){
              this.receivingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.receivingGames.push(items[i].console)
            }
            else{
              this.receivingGames.push(items[i].accessorie)
            }
          }

        }
      }
      else{
        this.isNotInvolved = true;
        for(let i = 0 ; i < items.length ; i ++){

          if(items[i].type === 'offering'){
            if(items[i].hasOwnProperty('game')){
              this.receivingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.receivingGames.push(items[i].console)
            }
            else{
              this.receivingGames.push(items[i].accessorie)
            }
          }
          else{
            if(items[i].hasOwnProperty('game')){
              this.givingGames.push(items[i].game)
            }
            else if(items[i].hasOwnProperty('console')){
              this.givingGames.push(items[i].console)
            }
            else{
              this.givingGames.push(items[i].accessorie)
            }
          }

        }
      }

    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  
  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
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
    .catch((err) => {
      this.dataService.logError(err);
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
              .catch((err) => {
                this.dataService.logError(err);
              })
            })
            .catch((err) => {
              this.dataService.logError(err);
            })
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
     
    })
  }

  offerBetterTrade(){

    let games = [];
    let accessories = [];
    let consoles = [];

    let options = {
      title:'Choose recipient',
      message:'Please choose user you want to send the offer',
      inputs:[],
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler: () => {}
        },
        {
          text:'Accept',
          handler: (data) => {
            console.log(data);

            if(data.username === this.userA.username){
              this.items.forEach((item)=>{
                if(item.type === 'offering'){
                  if(item.hasOwnProperty('game')){
                    games.push(item);
                  }
                  else if(item.hasOwnProperty('console')){
                    consoles.push(item);
                  }
                  else{
                    accessories.push(item);
                  }
                }
              })
              this.navCtrl.push(PickGamePage,{isDirect:true,pickedGames:[],isUser:false,chatKey:this.chatKey,games:games,consoles:consoles,accessories:accessories,username:data.username})
            }
            else{
              this.items.forEach((item)=>{
                if(item.type === 'interested'){
                  if(item.hasOwnProperty('game')){
                    games.push(item);
                  }
                  else if(item.hasOwnProperty('console')){
                    consoles.push(item);
                  }
                  else{
                    accessories.push(item);
                  }
                }
              })
              this.navCtrl.push(PickGamePage,{isDirect:true,pickedGames:[],isUser:false,chatKey:this.chatKey,games:games,consoles:consoles,accessories:accessories,username:data.username})
            }
            
          }
        }
      ]
    };

    options.inputs.push({name:'options',type:'radio',value:{username:this.userA.username,key:this.userA.userKey}, label:this.userA.username})
    options.inputs.push({name:'options',type:'radio',value:{username:this.userB.username,key:this.userB.userKey}, label:this.userB.username})

    let alert = this.alertCtrl.create(options);
    alert.present();

  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

}
