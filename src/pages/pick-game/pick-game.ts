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
    , public appCtrl: App) {
    this.games = this.navParams.get('games');
    this.games.forEach((game,index)=>{
      if(game.blockedAmount !== undefined){
        this.games[index].available = game.quantity - game.blockedAmount
      }
      else if(game.blockedItem){
        this.games[index].available = 0;
      }
      else{
        this.games[index].available = game.quantity;
      }
    })
    this.pickedGames = this.navParams.get('pickedGames');
    this.username = this.navParams.get('username');
    this.chatKey = this.navParams.get('chatKey');
    this.isUser = this.navParams.get('isUser');

    
    if(this.isUser){
      this.dataService.checkBlockedItems(this.dataService.uid,this.games).then((snap)=>{
        console.log('blocked array:',snap);
      })
    }
    else{
      this.dataService.fetchUserKey(this.username).then((snap)=>{
        var key = Object.keys(snap.val())[0];
        console.log('blocked key:',key);
        this.dataService.checkBlockedItems(key,this.games).then((res)=>{
          console.log('blocked array:',res);
        })
      })
    }
    this.isDirect = this.navParams.get('isDirect');
    this.count = 0;

    for(let i = 0; i < this.games.length ; i++){
      this.games[i].pickedGames = 0;
    }
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
    let count = 0;
    for(let i = 0; i < this.games.length ; i++){
      if(this.games[i].title == game.title){
        this.games[i]["selected"] = true;

        // if(this.games[i].blockedAmount !== undefined){
        //   if(count > this.games[i].quantity - this.games[i].blockedAmount){
        //     this.games[i].pickedGames = this.games[i].pickedGames;
        //   }
        // }

        if(this.games[i].quantity <= this.games[i].pickedGames || this.games[i].quantity - (this.games[i].blockedAmount + this.games[i].pickedGames) === 0){
          this.games[i].pickedGames = this.games[i].pickedGames;
        }
        else{
          this.games[i].pickedGames++;
        }
      }
      count = this.games[i].pickedGames + count;
    }

    this.count = count;
    console.log('this count:',this.count);

  }

  gameRemoved(game:any){
    this.selected = false;
    let count = 0;
    for(let i = 0; i < this.games.length; i++){
      if(this.games[i].title == game.title){
        if(this.games[i].pickedGames === 0){
          this.games[i].pickedGames = this.games[i].pickedGames;
        }
        else{
          this.games[i].pickedGames--;
          if(this.games[i].pickedGames === 0){
            this.games[i]["selected"] = false;
          }
        }
      }
      count = this.games[i].pickedGames + count;
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
      this.navCtrl.push(PickGamePage,{games:myGames,username:this.dataService.username,isUser:true,pickedGames:this.pickedGames,secondUsername:this.username,chatKey:this.chatKey,isDirect:this.isDirect})

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
      this.navCtrl.push(ConfirmTradePage,{games:this.pickedGames,username:this.navParams.get('secondUsername'),chatKey:this.chatKey,phoneToken:this.phoneToken,browserToken:this.browserToken,isDirect:this.isDirect});
    })


  }

}
