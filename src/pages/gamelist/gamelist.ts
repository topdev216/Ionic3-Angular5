import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, Events, Navbar, ViewController, LoadingController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';
import { AddVideogamePage } from '../add-videogame/add-videogame';
import { ActionPopoverComponent } from '../../components/action-popover/action-popover';
import { GameInformationPage } from '../game-information/game-information';


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
  private condition:boolean = false;
  private isOwnUser:boolean = false;
  private username:string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , public alertCtrl: AlertController
    , public popoverCtrl: PopoverController
    , public events: Events
    , public viewCtrl: ViewController
    , public loadingCtrl: LoadingController) {

    console.log('called constructor!');

    this.type = this.navParams.get('segment') || 'offer';
    
    this.condition = this.navParams.get('condition');

    let userKey = this.navParams.get('userKey');

    firebase.database().ref('users/'+userKey).once('value').then((snap)=>{
      if(snap.val().username !== null){
        this.username = snap.val().username;
      }
    })
    
    console.log('USER KEY PASSED:',userKey);
    console.log('UID:',this.dataService.uid);
    if(userKey === this.dataService.uid){
      this.isOwnUser = true;
    }

    firebase.database().ref('users/'+userKey+'/videogames/offer').on('value', (snap) =>{
      this.offeringGames = [];
      snap.forEach((game)=>{
        let obj = {
          game:game.val(),
          key:game.key
        }
        this.offeringGames.push(obj);
      })
    })

    firebase.database().ref('users/'+userKey+'/videogames/interested').on('value', (snap) =>{
      this.interestedGames = [];
      snap.forEach((game)=>{
        let obj = {
          game:game.val(),
          key:game.key
        }
        this.interestedGames.push(obj);
      })
    })

    
    // this.dataService.fetchUserOfferGames(this.dataService.uid).then((snap)=>{
    //   snap.forEach((game) =>{
    //     let obj = {
    //       game:game.val(),
    //       key:game.key
    //     }
    //     this.offeringGames.push(obj);
    //     console.log('game offer:',game.val());
    //   })
    // });

    // this.dataService.fetchUserInterestedGames(this.dataService.uid).then((snap)=>{
    //   snap.forEach((game) =>{
    //     let obj = {
    //       game:game.val(),
    //       key:game.key
    //     }
    //     this.interestedGames.push(obj);
    //     console.log('game interested:',game.val());
    //   })
    // });
    
  }

  // ngOnInit(){

  //   this.dataService.fetchUserOfferGames(this.dataService.uid).then((snap)=>{
  //     snap.forEach((game) =>{
  //       this.offeringGames.push(game.val());
  //       console.log('game offer:',game.val());
  //     })
  //   });

  //   this.dataService.fetchUserInterestedGames(this.dataService.uid).then((snap)=>{
  //     snap.forEach((game) =>{
  //       this.interestedGames.push(game.val());
  //       console.log('game interested:',game.val());
  //     })
  //   });

  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GamelistPage');
    this.setBackButtonAction();
  }

  ionViewWillEnter(){
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

    this.type = this.navParams.get('segment') || 'offer';
  }

  ionViewWillLeave(){
    this.events.unsubscribe('removeGame');
    this.events.unsubscribe('view game');
  }

  showPopover(myEvent,game):void{
    let popover = this.popoverCtrl.create(ActionPopoverComponent,{game:game,list:this.type});
    popover.present({
      ev:myEvent
    });
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

 addGame(gameId:any){

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

 decreaseGame(gameId:any){

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
    console.log('LAST',this.navCtrl.getPrevious().name);
    if(this.navCtrl.getPrevious().name === 'AddVideogamePage'){
      this.navCtrl.getPrevious().data.segment = this.type;
      this.navCtrl.pop();
    }
    else{
      this.navCtrl.push(AddVideogamePage,{segment:this.type});
    }
  }

}
