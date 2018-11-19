import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { MessagingPage } from '../messaging/messaging';

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
  private receivingGames:any[] = [];
  private givingGames:any [] = [];
  private chatKey:string;
  private isDirect:boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams
    , public alertCtrl: AlertController
    , public dataService: DataService
    , public viewCtrl: ViewController
    , public loadingCtrl: LoadingController
    , public toastCtrl: ToastController) {
    this.isDirect = this.navParams.get('isDirect');
    this.games = this.navParams.get('games');

    for(let i = 0 ; i < this.games.length ; i++) {
      if(this.games[i].type == "offering"){
        this.givingGames.push(this.games[i]);
      }
      else{
        this.receivingGames.push(this.games[i]);
      }
    }
    this.chatKey = this.navParams.get('chatKey');
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
            let chatKey = this.navParams.get('chatKey');
            this.dataService.createTrade(this.games,this.navParams.get('username'),chatKey).
            then((tradeKey)=>{
              this.dataService.blockInventory(tradeKey,true).then(()=>{
              console.log('trade created:'); 
              let flag = false;                
              this.navCtrl.getViews().forEach(element => {
                
                if(element.name == 'MessagingPage'){
                    flag = true;
                     this.navCtrl.popTo(element)
                     .then(()=>{
                        let loading = this.loadingCtrl.create({content:'Trade is being created...'});
                        loading.present();
                        this.dataService.sendTradeNotification(this.navParams.get('browserToken'),this.navParams.get('phoneToken'),this.dataService.username,'create',this.dataService.tradeKey,chatKey)
                        .subscribe((res:any) =>{

                          console.log(res);
                          loading.dismiss();
                          this.dataService.showTradeCard(chatKey,this.navParams.get('username'),this.isDirect).then(()=>{console.log('message sent')});
                        },err =>{
                          loading.dismiss();
                        })
                      })
                }
              });   

              if(!flag){
                this.navCtrl.push(MessagingPage,{title:this.navParams.get('username'),key:chatKey,username:this.dataService.username,condition:true})
                  .then(()=>{
                  let loading = this.loadingCtrl.create({content:'Trade is being created...'});
                  loading.present();
                  this.dataService.sendTradeNotification(this.navParams.get('browserToken'),this.navParams.get('phoneToken'),this.dataService.username,'create',this.dataService.tradeKey,chatKey)
                        .timeout(8000)
                        .subscribe((res:any) =>{

                          console.log(res);
                          loading.dismiss();
                          this.dataService.showTradeCard(chatKey,this.navParams.get('username'),true).then(()=>{console.log('message sent')});
                        },err =>{
                          loading.dismiss();
                        })
                })
              }
              })
              

                    
                  
            })
            
          }
        }
      ]
    });
    alert.present();
  }

}
