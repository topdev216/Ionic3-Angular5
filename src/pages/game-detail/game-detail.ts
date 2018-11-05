import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { PartnerResultsPage } from '../partner-results/partner-results';

/**
 * Generated class for the GameDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-game-detail',
  templateUrl: 'game-detail.html',
})
export class GameDetailPage {

    countArray: any [] = [];
    game:any;
  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public loadingCtrl: LoadingController
    , public alertCtrl: AlertController) {
    this.countArray = this.navParams.get('data');
    this.game = this.navParams.get('game');
  }

  ngOnInit(){
    this.countArray = this.navParams.get('data');
    this.game = this.navParams.get('game');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GameDetailPage');
  }

  findPartners(){
    let options = {
      title:'Partner Type',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Find',
          handler:data =>{
            console.log(data);
            let loader = this.loadingCtrl.create({
              content:'Finding partners...',
              spinner:'crescent'
            });
            loader.present();
            if(data.type === 'offering'){
              let type = 'interested'
              this.dataService.findTradePartner(data,type).then((results)=>{
            
                this.navCtrl.push(PartnerResultsPage,{results:results,type:data}).then(()=>{
                  loader.dismiss();
                })
                console.log('results:',results);
              })
            }
            else{
              let type = 'offering';
              this.dataService.findTradePartner(data,type).then((results)=>{
            
                this.navCtrl.push(PartnerResultsPage,{results:results,type:data}).then(()=>{
                  loader.dismiss();
                })
                console.log('results:',results);
              })
            }
            
            
          }
        }
      ],
      inputs:[]
    }

    options.inputs.push({
      name:'options',
      value:{
        type:'offering',
        key:this.game.id
      },
      label:'Partner offering this game',
      type:'radio'
    });

    options.inputs.push({
        name:'options',
        value:{
          type:'interested',
          key:this.game.id
        },
        label:'Partner interested in this game',
        type:'radio'
    })

    let alert = this.alertCtrl.create(options);
    alert.present();
    
  }

}
