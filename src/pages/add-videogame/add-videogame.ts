import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectSearchableComponent } from 'ionic-select-searchable';
import { VideogameInterface } from '../../providers/interfaces/videogameInterface'; 
import { DataService } from '../../providers/services/dataService';
import * as moment from 'moment';
/**
 * Generated class for the AddVideogamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-videogame',
  templateUrl: 'add-videogame.html',
})
export class AddVideogamePage {

  private postForm: FormGroup;
  private game: VideogameInterface;
  private gameId:any;
  private games: VideogameInterface[];
  private type: string;
  private platforms: any [] = [];
  private platformID:any;
  private platform:string;
  private gameList:any [] = [];
  private genres: any [] = [];
  private genre:string;
  private title:string;
  private releaseDate:string;
  private esrbRating:string;
  private coverPhoto:string;
  private gamePicked: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams
  , public formBuilder: FormBuilder
  , private dataService : DataService
  , public events: Events
  , public toastCtrl: ToastController) {
    

    this.postForm = formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      releaseDate: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      genre: ['', Validators.compose([Validators.required])],
      esrbRating: ['', Validators.compose([Validators.required])],
      platform: ['', Validators.compose([Validators.required])],
      coverPhoto: ['', Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
    });

    this.type = "offer";

  
    this.platforms = [
      
      {
      name:"PC"
      },
      {
      name:"PlayStation 3"
      },
      {
      name: "PlayStation 4",
      },
      {
        name: "Xbox 360",
      },
      {
        name: "Xbox One",
      },
      {
        name: "Wii",
      },
      {
        name: "Wii U",
      },
      {
        name: "Nintendo Switch",
      },
      {
        name:"Nintendo GameCube"
      }
    ]
    


  }

  ionViewWillEnter(){
   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddVideogamePage');
    const inputs: any = document.getElementById("input").getElementsByTagName("INPUT");
    inputs[0].disabled=true;
  }

  parseRatings(rating:any){

    if(rating == 1){
      this.esrbRating = "RP"
    }
    else if(rating == 2){
      this.esrbRating = "EC"
    }
    else if(rating == 3){
      this.esrbRating = "E"
    }
    else if(rating == 4){
      this.esrbRating = "E10+"
    }
    else if(rating == 5){
      this.esrbRating = "T"
    }
    else if(rating == 6){
      this.esrbRating = "M"
    }
    else if(rating == 'undefined'){
      this.esrbRating = "Not Available"
    }
    else{
      this.esrbRating = "AO"
    }
  }

  

  private submitVideogame(form: any) :void{
    console.log(form);
    console.log(this.coverPhoto);
    let game = {} as VideogameInterface;

    game.title = form.title;
    game.releaseDate = form.releaseDate;
    game.genre = form.genre;
    game.platform = form.platform;
    game.esrbRating = form.esrbRating;
    game.coverPhoto = this.coverPhoto;
    game.type = form.type;
    this.dataService.addVideogame(game,this.gameId).then(()=>{

      if(game.type == "offer"){
        this.dataService.notifyUsers(this.gameId,game.title).subscribe(((data) =>{
          console.log(data);
        }))
      }
      else{
        this.dataService.subscribeToGame(this.gameId).subscribe((data)=>{
          console.log(data);
        })
      }
      let toast = this.toastCtrl.create({
        message: 'Game was added successfully to your collection!',
        duration: 3000,
        position: 'top'
      })
      toast.present();
      console.log('game submitted');
    })
  }
  private platformChange(name:string):void{
    this.gamePicked = false;
    const inputs: any = document.getElementById("input").getElementsByTagName("INPUT");
    inputs[0].disabled=true;
    this.gameList = [];
    this.platform = name;
    console.log('platform:',name);
    this.dataService.searchPlatformsAPI(name).subscribe((data:any)=>{
      console.log('data',data);
      this.platformID = data[0].id;
      inputs[0].disabled=false;
    })
    

  }

  private onCancel(event:any):void{
    this.gameList = [];
    this.genres = [];
    this.title = "";
    this.genre = "";
    this.releaseDate = "";
    this.esrbRating = "";
  }

  private gameChange(title: any) :void {
    this.gamePicked = false;
    console.log(title.value);
    this.gameList = [];
    this.dataService.searchGamesAPI(title.value,this.platformID).subscribe((data:any) =>{
      this.gameList = data;
      for(let i = 0; i < data.length ; i++){
        let date = moment(this.gameList[i].first_release_date).format("MMM Do YYYY");
        this.gameList[i].first_release_date = date;
        if(data[i].genres !== undefined){
          this.genres[i] = {
            genreId:data[i].genres[0],
          }
          
        }
        console.log(this.genres[i]);
      }
      console.log(data);
    })
}

private selectedGame(game:any):void{
  this.title = game.name;
  this.gameId = game.id;
  if("genres" in game){
    this.genre = game.genres[0].name;
  }
  else{
    this.genre = "Not Available"
  }
  this.releaseDate = game.first_release_date;

  if("esrb" in game){
  this.parseRatings(game.esrb.rating);
  }
  else{
    this.esrbRating = "Not Available"
  }

  if("cover" in game){
    this.coverPhoto = game.cover.url;
  }
  else{
    this.coverPhoto= "";
  }


  this.gameList = [];
  this.gamePicked = true;

  console.log('cover photo',this.coverPhoto);
  console.log('selected',game);
}

}
