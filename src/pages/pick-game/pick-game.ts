import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, App } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ConfirmTradePage } from '../confirm-trade/confirm-trade';
import { Navbar } from 'ionic-angular';

/**
 * Generated class for the PickGamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pick-game',
  templateUrl: 'pick-game.html',
})
export class PickGamePage {


  private games:any [] = [];
  private username:string;
  private pickedGames:any[] = [];
  private count:number;
  private selected:boolean = false;
  private isUser:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public viewCtrl: ViewController
    , public appCtrl: App) {
    this.games = this.navParams.get('games');
    this.pickedGames = this.navParams.get('pickedGames');
    this.username = this.navParams.get('username');
    this.isUser = this.navParams.get('isUser');
    this.count = 0;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickGamePage');
    for(let i = 0; i < this.pickedGames.length ; i++){
      console.log('Picked game:',this.pickedGames[i])
    }
  }

  ionViewDidEnter(){
    console.log('popped back');
    console.log('count:',this.count);
    for(let i = 0; i < this.games.length ; i++){
      console.log('selected games:',this.games[i]);
    }
  }

  gameSelected(game:any){
    this.selected = true;
    for(let i = 0; i < this.games.length ; i++){
      if(this.games[i].title == game.title){
        this.games[i]["selected"] = true;
        this.count++;
      }
    }
  }

  gameRemoved(game:any){
    this.selected = false;
    for(let i = 0; i < this.games.length; i++){
      if(this.games[i].title == game.title){
        this.games[i]["selected"] = false;
        this.count--;
      }
    }    
  }

  next(){
    this.dataService.fetchUserOfferGames(this.dataService.uid).then((snap) =>{
      let myGames = [];
      snap.forEach((game) =>{
        myGames.push(game.val());
      })

      for(let i = 0; i < this.games.length; i++){
        for(let j = 0; j < this.pickedGames.length; j++){
          if(this.games[i]["selected"] === true){
            if(this.isUser){

              if(this.games[i].title !== this.pickedGames[j].game.title){

                let obj = {
                  game:this.games[i],
                  type:'offering'
                }
                this.pickedGames.push(obj);
              }
            }
            else{
              let obj = {
                game:this.games[i],
                type:'interested'
              }
              this.pickedGames.push(obj);
            }
          }
        }
      }
      this.navCtrl.push(PickGamePage,{games:myGames,username:this.dataService.username,isUser:true,pickedGames:this.pickedGames})

    })
  }

  createTrade(){
    for(let i = 0; i < this.games.length; i++){
      for(let j = 0 ; j < this.pickedGames.length; j++){
        if(this.games[i]["selected"] == true ){
          if(this.isUser){


              let obj = {
                game:this.games[i],
                type:'offering'
              }
              this.pickedGames.push(obj);
            
          }
          else{
            let obj = {
              game:this.games[i],
              type:'interested'
            }
            this.pickedGames.push(obj);
          }
        }
    }
    }

    this.navCtrl.push(ConfirmTradePage,{games:this.pickedGames});

  }

}
