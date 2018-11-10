import { Component, Sanitizer, SecurityContext, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController, AlertController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { DataService } from '../../providers/services/dataService';
import { PartnerResultsPage } from '../partner-results/partner-results';

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
    , public alertCtrl: AlertController) {

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

  styleObject(){
    if(this.game.screenshots !== undefined){
      return { 'background-image':'url('+'https://'+this.game.screenshots[this.imageIndex].url+')','background-size': 'cover' }
    }
}
  expandText(){
    this.expanded = true;
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
                console.log('results:',results);
              })
            }
            else{
              let type = 'offering';
              this.dataService.findTradePartner(data,type).then((results)=>{
            
                this.navCtrl.push(PartnerResultsPage,{results:results,type:data}).then(()=>{
                  loader.dismiss();
                })
                console.log('results:',results);
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
