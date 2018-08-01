import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, App } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ConfirmTradePage } from '../confirm-trade/confirm-trade';
import { Navbar } from 'ionic-angular';
import { ArrayType } from '@angular/compiler/src/output/output_ast';

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
  private chatKey:string;
  private phoneToken:string;
  private browserToken:string;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public viewCtrl: ViewController
    , public appCtrl: App) {
    this.games = this.navParams.get('games');
    this.pickedGames = this.navParams.get('pickedGames');
    this.username = this.navParams.get('username');
    this.chatKey = this.navParams.get('chatKey');
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
    
    for(let j = 0 ; j < this.pickedGames.length ; j++){
      if(this.pickedGames[j].game === game){
        this.pickedGames.splice(j,1);
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
          if(this.games[i]["selected"] === true){
            if(this.isUser){


                let obj = {
                  game:this.games[i],
                  type:'offering'
                }
                let count = 0;
                for(let j = 0; j < this.pickedGames.length; j++){
                  if(this.pickedGames[j].game.title === obj.game.title){
                    count++;
                  }      
                }
                if(count > 0){
                }
                else{
                  this.pickedGames.push(obj);
                }
            }
            
            else{
              let obj = {
                game:this.games[i],
                type:'interested'
              }
              let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game.title === obj.game.title){
                  count++;
                }      
              }
              if(count > 0){
              }
              else{
                this.pickedGames.push(obj);
              }
            }
          }
        
      }
      this.navCtrl.push(PickGamePage,{games:myGames,username:this.dataService.username,isUser:true,pickedGames:this.pickedGames,secondUsername:this.username,chatKey:this.chatKey})

    })
  }

  createTrade(){
    for(let i = 0; i < this.games.length; i++){
        if(this.games[i]["selected"] == true){
          if(this.isUser){


              let obj = {
                game:this.games[i],
                type:'offering'
              }
              let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game.title === obj.game.title){
                  count++;
                }      
              }
              if(count > 0){
              }
              else{
                this.pickedGames.push(obj);
              }
              
            
          }
          else{
            let obj = {
              game:this.games[i],
              type:'interested'
            }

            let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game.title === obj.game.title){
                  count++;
                }      
              }
              if(count > 0){
              }
              else{
                this.pickedGames.push(obj);
              }
          }
        }
    }

    this.dataService.fetchUserKey(this.navParams.get('secondUsername')).then((snap)=>{
     
      var key = Object.keys(snap.val())[0];
      this.phoneToken = snap.val()[key].phoneToken;
      console.log('phone:',this.phoneToken);
      this.browserToken = snap.val()[key].browserToken;
      this.navCtrl.push(ConfirmTradePage,{games:this.pickedGames,username:this.navParams.get('secondUsername'),chatKey:this.chatKey,phoneToken:this.phoneToken,browserToken:this.browserToken});
    })


  }

}
