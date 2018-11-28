import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, App, LoadingController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ConfirmTradePage } from '../confirm-trade/confirm-trade';
import * as firebase from 'firebase/app';
import { GameInformationPage } from '../game-information/game-information';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

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
  private gameCount:number = 0;
  private consoleCount:number = 0;
  private accessoryCount:number = 0;
  private pickedUnits:number = 0;
  private isUser:boolean = false;
  private filter:string = 'game';
  private chatKey:string;
  private phoneToken:string;
  private browserToken:string;
  private accessories: any[] = [];
  private consoles: any[] = [];
  private isDirect:boolean;
  private tabBar:any;

  constructor(public navCtrl: NavController, public navParams: NavParams
    , public dataService: DataService
    , public viewCtrl: ViewController
    , public appCtrl: App
    , public loadingCtrl: LoadingController) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
    this.games = this.navParams.get('games');
    this.accessories = this.navParams.get('accessories');
    this.consoles = this.navParams.get('consoles');
    console.log('accessories array:',this.accessories);
    console.log('console array:',this.consoles);
    this.games.forEach((game,index)=>{
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
    this.consoles.forEach((game,index)=>{
      if(game.blockedAmount !== undefined){
        this.consoles[index].available = game.quantity - game.blockedAmount;
      }
      else if(game.blockedItem){
        this.consoles[index].available = 0;
      }
      else{
        this.consoles[index].available = game.quantity;
      }
    })

    this.accessories.forEach((game,index)=>{
      if(game.blockedAmount !== undefined){
        this.accessories[index].available = game.quantity - game.blockedAmount;
      }
      else if(game.blockedItem){
        this.accessories[index].available = 0;
      }
      else{
        this.accessories[index].available = game.quantity;
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

    for(let i = 0; i < this.games.length ; i++){
      this.games[i].game.pickedGames = 0;
    }
    for(let i = 0; i < this.consoles.length ; i++){
      this.consoles[i].pickedConsoles = 0;
    }
    for(let i = 0; i < this.accessories.length ; i++){
      this.accessories[i].pickedAccessories = 0;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickGamePage');
    console.log('Picked game:',this.pickedGames);
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
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
      this.dataService.logError(err);
      console.log('server error:',err);
      loader.dismiss();
    })
  }

  ionViewDidEnter(){
    console.log('popped back');
    for(let i = 0; i < this.games.length ; i++){
      console.log('selected games:',this.games[i].game);
    }
  }

  gameSelected(game:any){
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

    this.gameCount = count;
    console.log('this count:',this.gameCount);

  }

  consoleSelected(item:any){
    let count = 0;
    for(let i = 0; i < this.consoles.length ; i++){
      if(this.consoles[i].name == item.name){
        this.consoles[i].selected = true;
        if(this.consoles[i].quantity <= this.consoles[i].pickedConsoles || this.consoles[i].quantity - (this.consoles[i].blockedAmount + this.consoles[i].pickedConsoles) === 0){
          this.consoles[i].pickedConsoles = this.consoles[i].pickedConsoles;
        }
        else{
          this.consoles[i].pickedConsoles++;
        }
      }
      count = this.consoles[i].pickedConsoles + count;
    }

    this.consoleCount = count;
    console.log('this count:',this.consoleCount);
  }

  accessorieSelected(item:any){
    let count = 0;
    for(let i = 0; i < this.accessories.length ; i++){
      if(this.accessories[i].name == item.name){
        this.accessories[i].selected = true;
        if(this.accessories[i].quantity <= this.accessories[i].pickedAccessories || this.accessories[i].quantity - (this.accessories[i].blockedAmount + this.accessories[i].pickedAccessories) === 0){
          this.accessories[i].pickedAccessories = this.accessories[i].pickedAccessories;
        }
        else{
          this.accessories[i].pickedAccessories++;
        }
      }
      count = this.accessories[i].pickedAccessories + count;
    }

    this.accessoryCount = count;
    console.log('this count:',this.accessoryCount);
  }

  gameRemoved(game:any){
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

    this.gameCount = count;
    console.log('this count:',this.gameCount);
    
    for(let j = 0 ; j < this.pickedGames.length ; j++){
      if(this.pickedGames[j].game !== undefined){
        if(this.pickedGames[j].game === game){
          this.pickedGames.splice(j,1);
        }
      }
    }
  }

  consoleRemoved(item:any) { 
    let count = 0;
    for(let i = 0; i < this.consoles.length; i++){
      if(this.consoles[i].name == item.name){
        if(this.consoles[i].pickedConsoles === 0){
          this.consoles[i].pickedConsoles = this.consoles[i].pickedConsoles;
        }
        else{
          this.consoles[i].pickedConsoles--;
          if(this.consoles[i].pickedConsoles === 0){
            this.consoles[i].selected = false;
          }
        }
      }
      count = this.consoles[i].pickedConsoles + count;
    }
    this.consoleCount = count;
    console.log('this count:',this.consoleCount);
    
    for(let j = 0 ; j < this.pickedGames.length ; j++){
      if(this.pickedGames[j].console !== undefined){
        if(this.pickedGames[j].console.name === item.name){
          this.pickedGames.splice(j,1);
        }
      }
    }
  }

  accessorieRemoved(item:any){
    let count = 0;
    for(let i = 0; i < this.accessories.length; i++){
      if(this.accessories[i].name == item.name){
        if(this.accessories[i].pickedAccessories === 0){
          this.accessories[i].pickedAccessories = this.accessories[i].pickedAccessories;
        }
        else{
          this.accessories[i].pickedAccessories--;
          if(this.accessories[i].pickedAccessories === 0){
            this.accessories[i].selected = false;
          }
        }
      }
      count = this.accessories[i].pickedAccessories + count;
    }
    this.accessoryCount = count;
    console.log('this count:',this.accessoryCount);
    
    for(let j = 0 ; j < this.pickedGames.length ; j++){
      if(this.pickedGames[j].accessorie !== undefined){
        if(this.pickedGames[j].accessorie.name === item.name){
          this.pickedGames.splice(j,1);
        }
      }
    }
  }

  getTotalCount(){
    return (this.gameCount+this.consoleCount+this.accessoryCount);
  }


  next(){
    this.dataService.fetchUserOfferGames(this.dataService.uid).then((snap) =>{
      firebase.database().ref('/users/'+this.dataService.uid+'/consoles/offer').once('value').then((consoles)=>{
        firebase.database().ref('/users/'+this.dataService.uid+'/accessories/offer').once('value').then((accessories)=>{
      
      let myGames = [];
      let myAccessories = [];
      let myConsoles = [];

      consoles.forEach((item)=>{
        myConsoles.push(item.val());
      })
      accessories.forEach((item)=>{
        myAccessories.push(item.val());
      })
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
                  type:'offering',
                  itemType:'game'
                }
                let count = 0;
                for(let j = 0; j < this.pickedGames.length; j++){
                  if(this.pickedGames[j].game !== undefined){
                    if(this.pickedGames[j].game.title === obj.game.title){
                      count++;
                    }      
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
                type:'interested',
                itemType:'game'
              }
              let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game !== undefined){
                  if(this.pickedGames[j].game.title === obj.game.title){
                    count++;
                  }      
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

      for(let i = 0; i < this.consoles.length; i++){
        if(this.consoles[i].selected === true){
          if(this.isUser){


              let obj = {
                console:this.consoles[i],
                key:this.consoles[i].platformId,
                type:'offering',
                itemType:'console'
              }
              let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].console !== undefined){
                  if(this.pickedGames[j].console.name === obj.console.name){
                    count++;
                  }      
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
              console:this.consoles[i],
              key:this.consoles[i].platformId,
              type:'interested',
              itemType:'console'
            }
            let count = 0;
            for(let j = 0; j < this.pickedGames.length; j++){
              if(this.pickedGames[j].console !== undefined){
                if(this.pickedGames[j].console.name === obj.console.name){
                  count++;
                }      
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

    for(let i = 0; i < this.accessories.length; i++){
      if(this.accessories[i].selected === true){
        if(this.isUser){


            let obj = {
              accessorie:this.accessories[i],
              key:this.accessories[i].itemId,
              type:'offering',
              itemType:'accessorie'
            }
            let count = 0;
            for(let j = 0; j < this.pickedGames.length; j++){
              if(this.pickedGames[j].accessorie !== undefined){
                if(this.pickedGames[j].accessorie.name === obj.accessorie.name){
                  count++;
                }      
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
            accessorie:this.accessories[i],
            key:this.accessories[i].itemId,
            type:'interested',
            itemType:'accessorie'
          }
          let count = 0;
          for(let j = 0; j < this.pickedGames.length; j++){
            if(this.pickedGames[j].accessorie !== undefined){
              if(this.pickedGames[j].accessorie.name === obj.accessorie.name){
                count++;
              }      
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





      this.navCtrl.push(PickGamePage,{games:myGames,consoles:myConsoles,accessories:myAccessories,username:this.dataService.username,isUser:true,pickedGames:this.pickedGames,secondUsername:this.username,chatKey:this.chatKey,isDirect:this.isDirect})
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

  createTrade(){
    for(let i = 0; i < this.games.length; i++){
        if(this.games[i].game["selected"] === true){
          if(this.isUser){


              let obj = {
                game:this.games[i].game,
                key:this.games[i].key,
                type:'offering',
                itemType:'game'
              }
              let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game !== undefined){
                  if(this.pickedGames[j].game.title === obj.game.title){
                    count++;
                  }      
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
              type:'interested',
              itemType:'game'
            }

            let count = 0;
              for(let j = 0; j < this.pickedGames.length; j++){
                if(this.pickedGames[j].game !== undefined){
                  if(this.pickedGames[j].game.title === obj.game.title){
                    count++;
                  }      
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

    for(let i = 0; i < this.consoles.length; i++){
      if(this.consoles[i].selected === true){
        if(this.isUser){


            let obj = {
              console:this.consoles[i],
              key:this.consoles[i].platformId,
              type:'offering',
              itemType:'console'
            }
            let count = 0;
            for(let j = 0; j < this.pickedGames.length; j++){
              if(this.pickedGames[j].console !== undefined){
                if(this.pickedGames[j].console.name === obj.console.name && this.pickedGames[j].itemType !== obj.itemType){
                  count++;
                }      
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
            console:this.consoles[i],
            key:this.consoles[i].platformId,
            type:'interested',
            itemType:'console'
          }
          let count = 0;
          for(let j = 0; j < this.pickedGames.length; j++){
            if(this.pickedGames[j].console !== undefined){
              if(this.pickedGames[j].console.name === obj.console.name && this.pickedGames[j].itemType !== obj.itemType){
                count++;
              }      
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

  for(let i = 0; i < this.accessories.length; i++){
    if(this.accessories[i].selected === true){
      if(this.isUser){


          let obj = {
            accessorie:this.accessories[i],
            key:this.accessories[i].itemId,
            type:'offering',
            itemType:'accessorie'
          }
          let count = 0;
          for(let j = 0; j < this.pickedGames.length; j++){
            if(this.pickedGames[j].accessorie !== undefined){
              if(this.pickedGames[j].accessorie.name === obj.accessorie.name && this.pickedGames[j].itemType !== obj.itemType){
                count++;
              }      
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
          accessorie:this.accessories[i],
          key:this.accessories[i].itemId,
          type:'interested',
          itemType:'accessorie'
        }
        let count = 0;
        for(let j = 0; j < this.pickedGames.length; j++){
          if(this.pickedGames[j].accessorie !== undefined){
            if(this.pickedGames[j].accessorie.name === obj.accessorie.name && this.pickedGames[j].itemType !== obj.itemType){
              count++;
            }      
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
    .catch((err) => {
      this.dataService.logError(err);
    })


  }

}
