import { Component, Sanitizer, SecurityContext, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { DataService } from '../../providers/services/dataService';
import { PartnerResultsPage } from '../partner-results/partner-results';
import { VideogameInterface } from '../../providers/interfaces/videogameInterface';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';

/**
 * Generated class for the GameInformationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-game-information',
  templateUrl: 'game-information.html',
})
export class GameInformationPage {

  game:any;
  year:number;
  tbd:string = null;
  showTbd:boolean = false;
  expanded:boolean = false;
  imageIndex:number;
  carouselItems:any[] = [];
  genre:string;
  isMobile:boolean = false;
  screenWidth:any;
  esrbTable:any [] = [
    {value:1,rating:'RP'},
    {value:2,rating:'EC'},
    {value:3,rating:'E'},
    {value:4,rating:'E10+'},
    {value:5,rating:'T'},
    {value:6,rating:'M'},
    {value:7,rating:'AO'},
  ];
  esrbValue:string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform
    , public photoViewer: PhotoViewer
    , public sanitizer: DomSanitizer
    , public youtube: YoutubeVideoPlayer
    , public zone: NgZone
    , public loadingCtrl: LoadingController
    , public dataService: DataService
    , public alertCtrl: AlertController
    , public toastCtrl: ToastController) {

      this.game = this.navParams.get('data');
      this.genre = this.game.genres[0].name;
      var checkYear = Math.floor(this.game.first_release_date / 31536000000);
      this.year = 1970 + checkYear;
      this.screenWidth = window.innerWidth;
      this.esrbTable.forEach((item)=>{
        if(this.game.esrb !== undefined){
          if(item.value === this.game.esrb.rating){
            this.zone.run(()=>{
              this.esrbValue = item.rating;
            })
          }
        }
      })
      if(this.game.videos !== undefined){
        this.game.videos.forEach((video)=>{
          let obj = {
            type:'video',
            video:video
          };
          this.carouselItems.push(obj);
        })
      }
      if(this.game.screenshots !== undefined){
        this.game.screenshots.forEach((item)=>{
          let obj = {
            type:'screenshot',
            screenshot:item
          };
          this.carouselItems.push(obj);
        })
      }
      
      if(isNaN(this.year)){
        this.showTbd = true;
        this.tbd = "TBA"; 
      }
      

      if(this.game.screenshots !== undefined){
        this.imageIndex = Math.floor(Math.random() * this.game.screenshots.length  );
      }
  
      console.log('random index:',this.imageIndex);
  

    this.platform.ready().then(()=>{
      if(this.platform.is('cordova')){
        this.isMobile = true;
      }
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GameInformationPage');
  }

  ionViewWillEnter(){
    
  }

  videoURL(id:string) {

    const url = "https://www.youtube.com/embed/"+id;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  addGame(){
    console.log(this.game);

    let optionsList = {
      title:'Type',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Accept',
          handler:data =>{
            console.log(data);
            this.game.type = data.name;

            let game = {} as VideogameInterface;
            game.title = this.game.name;
            game.genre = this.game.genres[0].name;
            let date = moment(this.game.first_release_date).format("MMM Do YYYY");
            game.releaseDate = date;
            game.coverPhoto = this.game.cover.url;
            this.esrbTable.forEach((data)=>{
              if(this.game.esrb.rating === data.value){
                game.esrbRating = data.rating;
              }
            });
            game.platform = this.game.selectedPlatformName;
            game.type = data.name;
            game.platformId = this.game.selectedPlatformId;

            let loader = this.loadingCtrl.create({
              content:'Please wait...',
              spinner:'crescent'
            });
            loader.present();
            this.dataService.checkExistingVideogame(this.game.id,game.type).then((snap)=>{
              if(snap.val() == null){
                this.dataService.addVideogame(game,this.game.id,game.platformId).then((result)=>{
                  console.log('game added:',result);
                  if(game.type === "offer"){
                    this.dataService.notifyUsers(this.game.id,game.title).subscribe(((data) =>{
                      console.log('users notified!',data);
                    }))
                  }
                  else{
                    this.dataService.subscribeToGame(this.game.id).subscribe((data)=>{
                      console.log('user subscribed:',data);
                    });
                  }
                  loader.dismiss();
                  if(result.title === game.title){
                    let toast = this.toastCtrl.create({
                      message:'You are already subscribed to this game!',
                      duration:2000
                    });
                    toast.present();
                  }
                  else{
                  let toast = this.toastCtrl.create({
                    message:'Game added successfully!',
                    duration:2000
                  });
                  toast.present();
                  }
                })
                .catch((err) => {
                  this.dataService.logError(err);
                })
              }
              else{
                loader.dismiss();
                
                let alert = this.alertCtrl.create({
                  title:'Error',
                  message:"You can't have the same game on both lists!",
                  buttons:[
                    {
                      text:'Accept',
                      handler:data =>{

                      }
                    }
                  ]
                })
                alert.present();
                
              }
            })
            .catch((err) => {
              this.dataService.logError(err);
            })

          }
        }
      ],
      inputs:[]
    }

    optionsList.inputs.push({
      name:'options',
            value:{
              name:'offer'
            },
            label: 'Offering',
            type:'radio',
            checked:true
    });

    optionsList.inputs.push({
      name:'options',
            value:{
              name:'interested'
            },
            label: 'Interested',
            type:'radio',
    });
 
    let optionsPlatform = {
      title:'Platforms',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Accept',
          handler:data =>{
            let alert = this.alertCtrl.create(optionsList);
            console.log(data);
            this.game.selectedPlatformId = data.key;
            this.game.selectedPlatformName = data.name;
            alert.present();
          }
        }
      ],
      inputs:[]
    }

    let flag = false;
    this.game.platforms.forEach((platform)=>{
      if(platform !== null && typeof platform === 'object'){
        if(!flag){
          flag = true;
          optionsPlatform.inputs.push({
            name:'options',
            value:{
              name:platform.name,
              key:platform.id
            },
            label: platform.name,
            type:'radio',
            checked:true
          });
        }
        else{
          optionsPlatform.inputs.push({
            name:'options',
            value:{
              name:platform.name,
              key:platform.id
            },
            label: platform.name,
            type:'radio',
            checked:false
          });
        }
    }
    })
   

    let alert = this.alertCtrl.create(optionsPlatform);
    alert.present();
  }

  styleObject(){
    if(this.game.screenshots !== undefined){
      return { 'background-image':'url('+'https://'+this.game.screenshots[this.imageIndex].url+')','background-size': 'cover' }
    }
}
  expandText(){
    this.expanded = true;
  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  reduceText(){
    this.expanded = false;
  }

  viewVideo(id:string){
    if(this.platform.is('cordova')){
      this.youtube.openVideo(id);
    }
  }

  findPartner(){

    let options = {
      title:'Partner Type',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Find',
          handler:data =>{
            console.log(data);
            let loader = this.loadingCtrl.create({
              content:'Finding partners...',
              spinner:'crescent'
            });
            loader.present();
            if(data.type === 'offering'){
              let type = 'interested'
              this.dataService.findTradePartner(data,type).then((results)=>{
            
                this.navCtrl.push(PartnerResultsPage,{results:results,type:data}).then(()=>{
                  loader.dismiss();
                })
                .catch((err) => {
                  this.dataService.logError(err);
                })
                console.log('results:',results);
              })
              .catch((err) => {
                this.dataService.logError(err);
              })
            }
            else{
              let type = 'offering';
              this.dataService.findTradePartner(data,type).then((results)=>{
            
                this.navCtrl.push(PartnerResultsPage,{results:results,type:data}).then(()=>{
                  loader.dismiss();
                })
                .catch((err) => {
                  this.dataService.logError(err);
                })
                console.log('results:',results);
              })
              .catch((err) => {
                this.dataService.logError(err);
              })
            }
            
            
          }
        }
      ],
      inputs:[]
    }

    options.inputs.push({
      name:'options',
      value:{
        type:'offering',
        key:this.game.id
      },
      label:'Partner offering this game',
      type:'radio'
    });

    options.inputs.push({
        name:'options',
        value:{
          type:'interested',
          key:this.game.id
        },
        label:'Partner interested in this game',
        type:'radio'
    })


    let optionsPlatform = {
      title:'Platforms',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Accept',
          handler:data =>{
            console.log(data);
            let alert = this.alertCtrl.create(options);
            alert.present();
          }
        }
      ],
      inputs:[]
    }


    let flag = false;
    this.game.platforms.forEach((platform)=>{
      if(platform !== null && typeof platform === 'object'){
        if(!flag){
          flag = true;
          optionsPlatform.inputs.push({
            name:'options',
            value:{
              name:platform.name,
              key:platform.id
            },
            label: platform.name,
            type:'radio',
            checked:true
          });
        }
        else{
          optionsPlatform.inputs.push({
            name:'options',
            value:{
              name:platform.name,
              key:platform.id
            },
            label: platform.name,
            type:'radio',
            checked:false
          });
        }
    }
    })
   

    let alert = this.alertCtrl.create(optionsPlatform);
    alert.present();
  }

  viewImage(url:string){
    if(this.platform.is('cordova')){
      this.photoViewer.show('https://'+url);
    }
  }

}
