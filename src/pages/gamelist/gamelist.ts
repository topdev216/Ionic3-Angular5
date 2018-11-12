import { Component, OnInit, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, Events, Navbar, ViewController, LoadingController, App, Tabs } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';
import { AddVideogamePage } from '../add-videogame/add-videogame';
import { ActionPopoverComponent } from '../../components/action-popover/action-popover';
import { GameInformationPage } from '../game-information/game-information';
import { PartnerResultsPage } from '../partner-results/partner-results';


/**
 * Generated class for the GamelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gamelist',
  templateUrl: 'gamelist.html',
})
export class GamelistPage{

  @ViewChild(Navbar) navBar: Navbar;


  private type:string = "offer";
  private offeringGames: any [] = [];
  private interestedGames: any [] = [];
  private offeringConsoles: any [] = [];
  private interestedConsoles: any [] = [];
  private offeringAccessories: any [] = [];
  private interestedAccessories: any [] = [];
  private condition:boolean = false;
  private isOwnUser:boolean = false;
  private username:string;
  private filter:string = "game";
  private tabBar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , public alertCtrl: AlertController
    , public popoverCtrl: PopoverController
    , public events: Events
    , public viewCtrl: ViewController
    , public loadingCtrl: LoadingController
    , public zone: NgZone
    , public app: App
    , private cf: ChangeDetectorRef) {

    console.log('called constructor!');
    this.tabBar = document.querySelector('.tabbar.show-tabbar');


    this.type = this.navParams.get('segment') || 'offer';
    this.filter = this.navParams.get('filter') || 'game';      
    
    this.condition = this.navParams.get('condition');

    let userKey = this.navParams.get('userKey') || undefined;
    console.log('USER KEY PASSED:',userKey);
    console.log('UID:',this.dataService.uid);
    if(userKey === this.dataService.uid){
      this.isOwnUser = true;
    }
    if(userKey === undefined){
      this.isOwnUser = true;
      userKey = this.dataService.uid;
    }

    firebase.database().ref('users/'+userKey).once('value').then((snap)=>{
      if(snap.val().username !== null){
        this.username = snap.val().username;
      }
    })
    
    

    firebase.database().ref('users/'+userKey+'/videogames/offer').on('value', (snap) =>{
      this.offeringGames = [];
      snap.forEach((game)=>{
        let obj = {
          game:game.val(),
          key:game.key
        }

        this.zone.run(()=>{
          this.offeringGames.push(obj);
        })
      })
    })

    firebase.database().ref('users/'+userKey+'/videogames/interested').on('value', (snap) =>{
      this.interestedGames = [];
      snap.forEach((game)=>{
        let obj = {
          game:game.val(),
          key:game.key
        }
        this.zone.run(()=>{
          this.interestedGames.push(obj);
        })
      })
    })

    firebase.database().ref('users/'+userKey+'/consoles/offer').on('value', (snap) =>{
      this.offeringConsoles = [];
      snap.forEach((game)=>{
        let obj = {
          console:game.val(),
          key:game.key
        }

        this.zone.run(()=>{
          this.offeringConsoles.push(obj);
        })
      })
    })

    firebase.database().ref('users/'+userKey+'/consoles/interested').on('value', (snap) =>{
      this.interestedConsoles = [];
      if(snap.numChildren()>0){
        snap.forEach((game)=>{
          let obj = {
            console:game.val(),
            key:game.key
          }

          this.zone.run(()=>{
            this.interestedConsoles.push(obj);
          })
        })
      }
      else{
        this.interestedConsoles.length = 0;
      }
    })

    firebase.database().ref('users/'+userKey+'/accessories/interested').on('value', (snap) =>{
      this.interestedAccessories = [];
      snap.forEach((game)=>{
        let obj = {
          accessory:game.val(),
          key:game.key
        }

        this.zone.run(()=>{
          this.interestedAccessories.push(obj);
        })
      })
    })

    firebase.database().ref('users/'+userKey+'/accessories/offer').on('value', (snap) =>{
      this.offeringAccessories = [];
      snap.forEach((game)=>{
        let obj = {
          accessory:game.val(),
          key:game.key
        }

        this.zone.run(()=>{
          this.offeringAccessories.push(obj);
        })
      })
    })
    
  }

  selectedHome(){
    console.log('selected home');
    this.navCtrl.popToRoot();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GamelistPage');
    this.setBackButtonAction();
  }

  ionViewWillEnter(){
    console.log('enter game list');
    console.log('enter filter:',this.filter);
    this.type = this.navParams.get('segment') || 'offer';
    this.tabBar.style.display = 'none';
    this.events.subscribe('removeGame', (data) =>{
      console.log('THE DATA:',data);
      this.decreaseGame(data.game.key);
      // this.removeGame(data.game,data.list);
    })

    this.events.subscribe('view game',(data)=>{
      console.log('called!');
      
      let loader = this.loadingCtrl.create({
        content:'Please wait...',
        spinner:'crescent'
      });
      loader.present();
      this.dataService.getGame(data.key).subscribe((data)=>{

        console.log('server data:',data);
        this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
          loader.dismiss();
        })
      },(err)=>{
        console.log('server error:',err);
        loader.dismiss();
      })
    })
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
    this.events.unsubscribe('removeGame');
    this.events.unsubscribe('view game');
    this.filter = 'game';
  }

  showPopover(myEvent,game):void{
    let popover = this.popoverCtrl.create(ActionPopoverComponent,{game:game,list:this.type});
    popover.present({
      ev:myEvent
    });
  }

  findPartner(game:any){
    console.log(game);
    let loader = this.loadingCtrl.create({
      content:'Finding partners...',
      spinner:'crescent'
    });
    let type = "";
    if(this.type === 'offer'){
      type = "offering";
    }
    else{
      type = "interested";
    }

    if(this.filter === 'game'){
      loader.present();
      this.dataService.findTradePartner(game,type).then((results)=>{
        this.navCtrl.push(PartnerResultsPage,{results:results,type:this.type}).then(()=>{
          loader.dismiss();
        })
        console.log('results:',results);
      })
    }
  }

  goHome(event:any){  
    this.filter = "game";
    this.navCtrl.popToRoot().then(()=>{
      console.log(this.navCtrl.getActive());
      if(this.navCtrl.getActive().name !== 'TabsPage' && this.navCtrl.getActive().name !== 'HomePage'){
        const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
        tabsNav.select(0);
      }
      else{
        return;
      }
    })
  }

  //Method to override the default back button action
  setBackButtonAction(){
    if(this.condition){
      this.navBar.backButtonClick = () => {
      //Write here wherever you wanna do
        this.navCtrl.popToRoot();
      }
    }
 }

 viewGame(game:any){
  let loader = this.loadingCtrl.create({
    content:'Please wait...',
    spinner:'crescent'
  });
  if(this.filter === 'game'){
    loader.present();
    this.dataService.getGame(game.key).subscribe((data)=>{

      console.log('server data:',data);
      this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
        loader.dismiss();
      })
    },(err)=>{
      console.log('server error:',err);
      loader.dismiss();
    })
  }
  
 }

 addGame(gameId:any){


  if(this.filter === 'game'){
   let alert = this.alertCtrl.create({
     
    title:'Confirmation',
      message:'Are you sure you want to add another copy of this game to your list?',
      buttons:[
        {
          text:'Accept',
          handler: data => {
            this.dataService.increaseGameQuantity(gameId,this.type);
          }
        },
        {
          text:'Cancel',
          handler: data =>{
            console.log('cancel');
          }
        }
      ]
    });
    alert.present();
  }
  else if(this.filter === 'console'){
    let alert = this.alertCtrl.create({
     
      title:'Confirmation',
        message:'Are you sure you want to add another copy of this console to your list?',
        buttons:[
          {
            text:'Accept',
            handler: data => {
              gameId.id = gameId.platformId;
              this.dataService.addConsole(gameId,this.type);
            }
          },
          {
            text:'Cancel',
            handler: data =>{
              console.log('cancel');
            }
          }
        ]
      });
      alert.present();
  }
  else{
    console.log(gameId);
    let alert = this.alertCtrl.create({
     
      title:'Confirmation',
        message:'Are you sure you want to add another copy of this accessory to your list?',
        buttons:[
          {
            text:'Accept',
            handler: data => {
              gameId.id = gameId.itemId;
              this.dataService.addAccessory(gameId,this.type);
            }
          },
          {
            text:'Cancel',
            handler: data =>{
              console.log('cancel');
            }
          }
        ]
      });
      alert.present();
  }

 }

 decreaseGame(gameId:any){


  if(this.filter === 'game'){
    let alert = this.alertCtrl.create({
      
    title:'Confirmation',
      message:'Are you sure you want to substract a copy of this game from your list?',
      buttons:[
        {
          text:'Accept',
          handler: data => {
            this.dataService.decreaseGameQuantity(gameId,this.type);
          }
        },
        {
          text:'Cancel',
          handler: data =>{
            console.log('cancel');
          }
        }
      ]
    });
    alert.present();
  }
  else if(this.filter === 'console'){
    let alert = this.alertCtrl.create({
      
      title:'Confirmation',
        message:'Are you sure you want to substract a copy of this console from your list?',
        buttons:[
          {
            text:'Accept',
            handler: data => {
              gameId.id = gameId.platformId;
              this.dataService.removeConsole(gameId,this.type);
            }
          },
          {
            text:'Cancel',
            handler: data =>{
              console.log('cancel');
            }
          }
        ]
      });
      alert.present();
  }
  else{
    let alert = this.alertCtrl.create({
      
      title:'Confirmation',
        message:'Are you sure you want to substract a copy of this console from your list?',
        buttons:[
          {
            text:'Accept',
            handler: data => {
              gameId.id = gameId.itemId;
              this.dataService.removeAccessory(gameId,this.type);
            }
          },
          {
            text:'Cancel',
            handler: data =>{
              console.log('cancel');
            }
          }
        ]
      });
      alert.present();
  }

}

  removeGame(game:any,list:string) {

    console.log('LIST:',list);

    let alert = this.alertCtrl.create({
      title:'Confirmation',
      message:'Are you sure you want to remove this game from your list?',
      buttons:[
        {
          text:'Accept',
          handler: data => {
            console.log('accepted:',data);
            this.dataService.removeGameFromList(game.key,list,this.dataService.uid).then((res)=>{
              console.log('game has been removed',res);
            })
          }
        },
        {
          text:'Cancel',
          handler: data =>{
            console.log('cancel');
          }
        }
      ]
    });

    alert.present();

    
  }

  goToAddGames(){

    console.log('clicked button!');
    

    if(this.navCtrl.getPrevious() !== null){
      if(this.navCtrl.getPrevious().name === 'AddVideogamePage'){
        this.navCtrl.getPrevious().data.segment = this.type;
        this.navCtrl.pop();
      }
      else{
        this.navCtrl.push(AddVideogamePage,{segment:this.type,filter:this.filter});
      }
    }
    else{
      this.navCtrl.push(AddVideogamePage,{segment:this.type,filter:this.filter});
    }
  }

}
