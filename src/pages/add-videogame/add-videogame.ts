import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ToastController, AlertController, ActionSheetController, Searchbar, Keyboard, Platform, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormGroupDirective } from '@angular/forms';
import { SelectSearchableComponent } from 'ionic-select-searchable';
import { VideogameInterface } from '../../providers/interfaces/videogameInterface'; 
import { DataService } from '../../providers/services/dataService';
import * as moment from 'moment';
import * as firebase from 'firebase';
import { GamelistPage } from '../gamelist/gamelist';
import { PlatformSelectionPage } from '../platform-selection/platform-selection';

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
  private platform:string = null;
  private gameList:any [] = [];
  private genres: any [] = [];
  private genre:string;
  private title:string;
  private tabBar:any;
  private releaseDate:string;
  private esrbRating:string;
  private coverPhoto:string;
  private gamePicked: boolean = false;
  private searching: boolean = false;
  private searchPlaceholder: string;
  private submitPlaceholder: string = "Search";
  private platformPlaceholder: string = "Select Platform"
  private platformSelected:boolean = false;
  private searchCondition:boolean = false;
  private offeringCount:number;
  private accessories: any [] = [];
  private filter:string = "game";
  private consoles: any [] = [];
  @ViewChild ('mySearch') searchbar: Searchbar;
  @ViewChild('gameForm') documentEditForm: FormGroupDirective;



  constructor(public navCtrl: NavController, public navParams: NavParams
  , public formBuilder: FormBuilder
  , private dataService : DataService
  , public events: Events
  , public toastCtrl: ToastController
  , public alertCtrl: AlertController
  , public actionCtrl: ActionSheetController
  , public keyboard: Keyboard
  , public appPlatform: Platform
  , public loadingCtrl: LoadingController) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');

    this.postForm = formBuilder.group({
      title: ['', Validators.compose([Validators.required])],
      releaseDate: ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      genre: ['', Validators.compose([Validators.required])],
      esrbRating: ['', Validators.compose([Validators.required])],
      platform: ['', Validators.compose([Validators.required])],
      coverPhoto: ['', Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
    });

    this.type = this.navParams.get('segment') || 'offer';

    firebase.database().ref('platformTable').once('value').then((snap)=>{
      snap.forEach((platform)=>{
        //PC or Mac
        if(platform.val().id !== 6 && platform.val().id !== 14){
          this.consoles.push(platform.val());
        }
      })
    });

    firebase.database().ref('accessoriesTable').once('value').then((snap)=>{
      snap.forEach((item)=>{
        this.accessories.push(item.val());
      });
    });

  
    this.platforms = [
      
      {
        name:"PC",
        old:false
      },
      {
        name:"PlayStation",
        old:true
      },
      {
        name:"PlayStation 2",
        old:false
      },
      {
        name:"PlayStation Portable",
        old:false
      },
      {
        name:"PlayStation 3",
        old:false
      },
      {
        name:"PlayStation Vita",
        old:false
      },
      {
        name: "PlayStation 4",
        old:false
      },
      {
        name:"Xbox",
        old:false
        },
      {
        name: "Xbox 360",
        old:false
      },
      {
        name: "Xbox One",
        old:false
      },
      {
        name:"Game Boy",
        old:true
      },
      {
        name:"Game Boy Color",
        old:true
      },
      {
        name:"Game Boy Advance",
        old:false
      },
      {
        name: "Super Nintendo Entertainment System (SNES)",
        old:true
      },
      {
        name:"Nintendo 64",
        old:true
      },

      {
        name:"Nintendo GameCube",
        old:false
      },
      {
        name:"Nintendo DS",
        old:false
      },
      {
        name:"Nintendo 3DS",
        old:false
      },
      {
        name: "Wii",
        old:false
      },
      {
        name: "Wii U",
        old:false
      },
      {
        name: "Nintendo Switch",
        old:false
      },
      {
        name: "Dreamcast",
        old:true
      },
      {
        name: "Mac",
        old:false
      },


    ]


    


  }

  ionViewWillEnter(){
    this.type = this.navParams.get('segment') || 'offer';
    this.tabBar.style.display = 'none';
    let obj = this.navParams.get('platform') || null;
    this.platformChange(obj);
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'none';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddVideogamePage');
    const inputs: any = document.getElementById("input").getElementsByTagName("INPUT");
    inputs[0].disabled=true;
    this.searchPlaceholder = "Select a platform first."
    this.submitPlaceholder = "Search";
    this.platformPlaceholder = "Select Platform"
  }

  onSearchInput(event:any){

    if(event.target.value && event.target.value.trim() !== ''){
      this.searchCondition = true;
    }
    else{
      this.searchCondition = false;
    }
    // console.log('search input!');
    // if(event.data){
    //   this.searching = true
    // }
    // else{
    //   this.searching = false;
    // }
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

  private pickConsole(platform:any){
    let alert = this.alertCtrl.create({
      title:'Confirm',
      message:'Do you want to add '+platform.name+' to your consoles list?',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('canceled');
          }
        },
        {
          text:'Add',
          handler:() => {
            let loader = this.loadingCtrl.create({
              content:'Please wait...',
              spinner:'crescent'
            });
            loader.present();
            this.dataService.addConsole(platform,this.type).then(()=>{
              let toast = this.toastCtrl.create({
                message:'Console was added to your list successfully!',
                duration:2000
              });
              loader.dismiss();
              toast.present();
            })
          }
        }
      ]
    })

    alert.present();
  }

  private pickAccessory(item:any){
    let alert = this.alertCtrl.create({
      title:'Confirm',
      message:'Do you want to add '+item.name+' to your accessories list?',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('canceled');
          }
        },
        {
          text:'Add',
          handler:() => {
            let loader = this.loadingCtrl.create({
              content:'Please wait...',
              spinner:'crescent'
            });
            loader.present();
            this.dataService.addAccessory(item,this.type).then(()=>{
              let toast = this.toastCtrl.create({
                message:'Accessory was added to your list successfully!',
                duration:2000
              });
              loader.dismiss();
              toast.present();
            })
          }
        }
      ]
    })

    alert.present();

  }

  

  private submitVideogame(form: any) :void{


    if(this.gamePicked){
    console.log(form);
    if(form.title === ""){
      return form;
    }
    console.log(this.coverPhoto);
    let game = {} as VideogameInterface;


    game.title = form.title;
    game.releaseDate = form.releaseDate;
    game.genre = form.genre;
    game.platform = this.platform;
    game.esrbRating = form.esrbRating;
    game.coverPhoto = this.coverPhoto;
    game.type = form.type;
    

    this.dataService.checkExistingVideogame(this.gameId,game.type).then((snap) =>{
      if(snap.val() == null){
        this.dataService.addVideogame(game,this.gameId,this.platformID).then(()=>{

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
    
          let alert = this.alertCtrl.create({
            title:'Confirmation',
            message:'Do you want to add more games?',
            buttons:[
              {
                text:'Done',
                handler: data =>{
                  console.log('Done')
                  console.log('game submitted');
                  this.navCtrl.push(GamelistPage,{userKey:this.dataService.uid,condition:true,segment:game.type});
                }
              },
              {
                text:'Add More',
                handler: data =>{
                  console.log('pressed yes');
                }
              }
    
            ]
          })
    
          alert.present();
          let toast = this.toastCtrl.create({
            message: 'Game was added successfully to your collection!',
            duration: 3000,
            position: 'top'
          })
          toast.present();
          
        })
      }
      else{

        let correctSegment = {};

        if(game.type === 'offer'){
          correctSegment = 'interested';
        }
        else{
          correctSegment = 'offer'
        }

        let alert = this.alertCtrl.create({
          title:'Error',
          message:"You can't have the same game in both lists! Please remove from either list and add again",
          buttons:[
            {
              text:'Go to List',
              handler: data =>{
                this.navCtrl.push(GamelistPage,{userKey:this.dataService.uid,condition:true,segment:correctSegment});
              }
            },
            {
              text:'Cancel',
              role:'cancel',
              handler: data =>{
                
              }
            }
  
          ]
        })
  
        alert.present();
      }
    })

  }
    
  }

  private goToList():void{
    this.navCtrl.push(GamelistPage,{userKey:this.dataService.uid,condition:true,segment:this.type});
  }

  private openPlatforms():void{

    this.navCtrl.push(PlatformSelectionPage,{platforms:this.platforms})

    // let array = [];

    // for(let i = 0 ; i < this.platforms.length; i ++){
    //   array.push({
    //     text:this.platforms[i].name,
    //     handler: () => {
    //       this.platformChange(this.platforms[i].name);
    //     }
    //   })
    // }

    // array.push({
    //   text: 'Cancel',
    //   role: 'cancel', // will always sort to be on the bottom
    //   handler: () => {
    //     console.log('Cancel clicked');
    //   }
    //   });


    // let actionSheet = this.actionCtrl.create({
    //   title:'Platforms',
    //   buttons: array
    // });

    // actionSheet.present();
  }

  private platformChange(name:string):void{
    this.searching = true;
    this.searchPlaceholder = "Please wait..."
    this.gamePicked = false;
    const inputs: any = document.getElementById("input").getElementsByTagName("INPUT");
    inputs[0].disabled=true;
    this.gameList = [];
    this.platform = name;
    console.log('platform:',name);
    if(this.platform !== null){
    this.dataService.searchPlatformsAPI(name).subscribe((data:any)=>{
      console.log('data',data);
      this.searching = false;
      this.platformID = data[0].id;
      this.platformSelected = true;
      inputs[0].disabled=false;
      
      this.searchPlaceholder = "Search Games";
      this.submitPlaceholder = "Add";
      this.platformPlaceholder = "Change Platform";
    }, (err) =>{
      this.searching = false;
      let toast = this.toastCtrl.create({
        message:'An error has occurred, please try again',
        duration:2000
      });
      toast.present();
    })
    }
    else{
      this.searching = false;
      this.platformID = null;
      this.platformSelected = true;
      inputs[0].disabled=false;
      
      this.searchPlaceholder = "Search Games";
      this.submitPlaceholder = "Add";
      this.platformPlaceholder = "Change Platform";
    }
    

  }

  private onCancel(event:any):void{
    this.searchCondition = false;
    console.log('CANCELED!');
    this.searching = false;
    this.gameList = [];
    this.genres = [];
    this.title = "";
    this.genre = "";
    this.releaseDate = "";
    this.esrbRating = "";
  }

  private onClear(event:any):void{
    this.searchCondition = false;
    console.log('CANCELED!');
    this.searching = false;
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
    if(title.value === ''){
      this.searching = false;
      return title;
    }
    else{
    this.dataService.searchGamesAPI(title.value,this.platformID).subscribe((data:any) =>{
      console.log('games data:',data);
      this.gameList = data;
      this.searching = false;
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
    },(err)=>{
      this.searching = false;
      let toast = this.toastCtrl.create({
        message:'An error has occurred, please try again',
        duration:2000
      });

      toast.present();
    })
  }
}

private doSearch(){
  
    if(this.appPlatform.is('cordova')){
      this.keyboard.close();
    }
    this.searching = true;
    let input = this.searchbar.value;
    console.log('da input',input);
    this.gamePicked = false;
    this.gameList = [];
    if(input === ''){
      this.searching = false;
      return input;
    }
    else{
    if(this.filter === 'game'){
      this.dataService.searchGamesAPI(input,this.platformID).subscribe((data:any) =>{
        console.log('games data:',data);
        this.gameList = data;
        this.searching = false;
        for(let i = 0; i < data.length ; i++){
          let date = moment(this.gameList[i].first_release_date).format("MMM Do YYYY");
          this.gameList[i].first_release_date = date;
          if(data[i].genres !== undefined){
            this.genres[i] = {
              genreId:data[i].genres[0].id,
            }
            
          }
          console.log(this.genres[i]);
        }
        console.log(data);
      },(err) =>{
        this.searching = false;
        let toast = this.toastCtrl.create({
          message:'An error has occurred, please try again',
          duration:2000
        });

        toast.present();
        console.log('An error has ocurred.');
      })
    }
    else if(this.filter === 'console'){
      this.searching = false;
      return;
    }
  }
}

private backToList(){
  this.gamePicked = false;
}

private selectedGame(game:any):void{

  if(this.platform == null){
    
      let options = {
        title:'Platforms',
        message:'Please choose a platform',
        buttons:[
          {
            text:'Cancel',
            role:'cancel',
            handler:()=>{
              console.log('cancel clicked');
              this.backToList();
            }
          },
          {
            text:'Ok',
            handler:data =>{
              this.platformID = data.id;
              this.platform = data.name;
            }
          }
        ],
        inputs:[]
      }

      game.platforms.forEach((platform,index)=>{
        if(index === 0){
          options.inputs.push({name:'options',value:{id:platform.id,name:platform.name},label:platform.name,type:'radio',checked:true})
        }
        else{
          options.inputs.push({name:'options',value:{id:platform.id,name:platform.name},label:platform.name,type:'radio',checked:false})
        }
      })

      let alert = this.alertCtrl.create(options);
      alert.present();
  }

  this.title = game.name;
  this.gameId = game.id;
  this.offeringCount = game.offering_count;
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


  // this.gameList = [];
  this.gamePicked = true;

  console.log('cover photo',this.coverPhoto);
  console.log('selected',game);
}

}
