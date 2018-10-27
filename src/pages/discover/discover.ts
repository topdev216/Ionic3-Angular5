import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../profile/profile';
import { EN_TAB_PAGES } from '../../providers/backbutton/app.config';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';

/**
 * Generated class for the DiscoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-discover',
  templateUrl: 'discover.html',
})
export class DiscoverPage {

  private query:string;
  private queryResults: any [] = [];
  private type: string;
  private emptyResult:boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService
    , public backbuttonService: BackButtonProvider) {

    this.type = "username";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DiscoverPage');
  }

  ionViewWillLeave(){
    this.dataService.previousTab = 'DiscoverPage';
  }
  ionViewWillEnter(){
    this.dataService.activeTab = 'DiscoverPage';
    console.log(this.dataService.activeTab);
  }

  segmentChange(){
    this.queryResults = [];
  }

  userChange(query:any){

    
    
    this.query = query.value.toLowerCase();
    // this.query = this.query.replace(/[^-\s]+/g, function(word) {
    //   return word.replace(/^./, function(first) {
    //     return first.toUpperCase();
    //   });
    // });
    console.log(this.query);
    
    this.queryResults = [];
    if(query.value !== ""){
      if(this.type == "username"){
        this.dataService.searchUsersByUsername(query.value.toLowerCase()).then((snap)=>{
          snap.forEach((childSnap)=>{
            console.log('search result:',childSnap.val());
            if(childSnap.key !== this.dataService.uid){
              if(this.dataService.user.blocked !== undefined){
                
                if(!(childSnap.key in this.dataService.user.blocked)){
                  this.queryResults.push(childSnap);
                  console.log(childSnap.val());
                }
              }
              else{
                this.queryResults.push(childSnap);
                console.log(childSnap.val());
              }
            }
            })
            if(this.queryResults.length == 0){ 
              this.emptyResult = true;
            }
            else{
              this.emptyResult = false;
            }
            
          })
      }
      else{
        this.dataService.searchUsersByName(this.query).then((snap)=>{
          snap.forEach((childSnap)=>{
            if(childSnap.key !== this.dataService.uid){
              if(this.dataService.user.blocked !== undefined){
                
                if(!(childSnap.key in this.dataService.user.blocked)){
                  this.queryResults.push(childSnap);
                  console.log(childSnap.val());
                }
              }
              else{
                this.queryResults.push(childSnap);
                console.log(childSnap.val());
              }
            }
            })
            if(this.queryResults.length == 0){
              this.emptyResult = true;
            }
            else{
              this.emptyResult = false;
            }
            
        })
      }
    }
    
  }

  goToProfile(user:any,userKey:string){
    let json = {
      user:user,
      userKey:userKey
    }
    this.navCtrl.push(ProfilePage,{user:json,search:true})
  }

  onCancel(){
    this.query = null;
    this.queryResults = [];
  }

}
