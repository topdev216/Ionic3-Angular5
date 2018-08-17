import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, Events, Navbar, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';
import { AddVideogamePage } from '../add-videogame/add-videogame';
import { ActionPopoverComponent } from '../../components/action-popover/action-popover';


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
  private condition:boolean =false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , public alertCtrl: AlertController
    , public popoverCtrl: PopoverController
    , public events: Events
    , public viewCtrl: ViewController) {

    console.log('called constructor!');

    
    this.condition = this.navParams.get('condition');

    let userKey = this.navParams.get('userKey');

    this.events.subscribe('removeGame', (data) =>{
      this.removeGame(data.game,data.list);
    })

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
    this.navCtrl.push(AddVideogamePage);
  }

}
