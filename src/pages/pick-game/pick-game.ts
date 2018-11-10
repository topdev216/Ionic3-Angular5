import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, App, LoadingController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ConfirmTradePage } from '../confirm-trade/confirm-trade';
import { Navbar } from 'ionic-angular';
import { ArrayType } from '@angular/compiler/src/output/output_ast';
import { GameInformationPage } from '../game-information/game-information';

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
  private count:number = 0;
  private pickedUnits:number = 0;
  private selected:boolean = false;
  private isUser:boolean = false;
  private chatKey:string;
  private phoneToken:string;
  private browserToken:string;
  private isDirect:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public viewCtrl: ViewController
    , public appCtrl: App
    , public loadingCtrl: LoadingController) {
    this.games = this.navParams.get('games');
    this.games.forEach((game,index)=>{
      console.log('for each game:',game);
      if(game.game.blockedAmount !== undefined){
        this.games[index].game.available = game.game.quantity - game.game.blockedAmount
      }
      else if(game.game.blockedItem){
        this.games[index].game.available = 0;
      }
      else{
        this.games[index].game.available = game.game.quantity;
      }
    })
    this.pickedGames = this.navParams.get('pickedGames');
    this.username = this.navParams.get('username');
    this.chatKey = this.navParams.get('chatKey');
    this.isUser = this.navParams.get('isUser');

    const games = [];
    this.games.forEach((game)=>{
      games.push(game.game);
    });
    
    this.isDirect = this.navParams.get('isDirect');
    this.count = 0;

    for(let i = 0; i < this.games.length ; i++){
      this.games[i].game.pickedGames = 0;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickGamePage');
    for(let i = 0; i < this.pickedGames.length ; i++){
      console.log('Picked game:',this.pickedGames[i].game)
    }
  }

  viewGame(id:string){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    })

    loader.present();

    this.dataService.getGame(id).subscribe((data)=>{

      console.log('server data:',data);
      this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
        loader.dismiss();
      })
    },(err)=>{
      console.log('server error:',err);
      loader.dismiss();
    })
  }

  ionViewDidEnter(){
    console.log('popped back');
    console.log('count:',this.count);
    for(let i = 0; i < this.games.length ; i++){
      console.log('selected games:',this.games[i].game);
    }
  }

  gameSelected(game:any){
    this.selected = true;
    let count = 0;
    for(let i = 0; i < this.games.length ; i++){
      if(this.games[i].game.title == game.title){
        this.games[i].game["selected"] = true;

        if(this.games[i].game.quantity <= this.games[i].game.pickedGames || this.games[i].game.quantity - (this.games[i].game.blockedAmount + this.games[i].game.pickedGames) === 0){
          this.games[i].game.pickedGames = this.games[i].game.pickedGames;
        }
        else{
          this.games[i].game.pickedGames++;
        }
      }
      count = this.games[i].game.pickedGames + count;
    }

    this.count = count;
    console.log('this count:',this.count);

  }

  gameRemoved(game:any){
    this.selected = false;
    let count = 0;
    for(let i = 0; i < this.games.length; i++){
      if(this.games[i].game.title == game.title){
        if(this.games[i].game.pickedGames === 0){
          this.games[i].game.pickedGames = this.games[i].game.pickedGames;
        }
        else{
          this.games[i].game.pickedGames--;
          if(this.games[i].game.pickedGames === 0){
            this.games[i].game["selected"] = false;
          }
        }
      }
      count = this.games[i].game.pickedGames + count;
    }

    this.count = count;
    console.log('this count:',this.count);
    
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
        let obj = {
          game:game.val(),
          key:game.key
        }
        myGames.push(obj);
      })

      for(let i = 0; i < this.games.length; i++){
          if(this.games[i].game["selected"] === true){
            if(this.isUser){


                let obj = {
                  game:this.games[i].game,
                  key:this.games[i].key,
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
                game:this.games[i].game,
                key:this.games[i].key,
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
      this.navCtrl.push(PickGamePage,{games:myGames,username:this.dataService.username,isUser:true,pickedGames:this.pickedGames,secondUsername:this.username,chatKey:this.chatKey,isDirect:this.isDirect})

    })
  }

  createTrade(){
    for(let i = 0; i < this.games.length; i++){
        if(this.games[i].game["selected"] == true){
          if(this.isUser){


              let obj = {
                game:this.games[i].game,
                key:this.games[i].key,
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
              game:this.games[i].game,
              key:this.games[i].key,
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
      this.navCtrl.push(ConfirmTradePage,{games:this.pickedGames,username:this.navParams.get('secondUsername'),chatKey:this.chatKey,phoneToken:this.phoneToken,browserToken:this.browserToken,isDirect:this.isDirect});
    })


  }

}
