import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { ProfilePage } from '../profile/profile';

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


  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {

    this.type = "username";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DiscoverPage');
  }

  segmentChange(){
    this.queryResults = [];
  }

  userChange(query:any){

    
    
    this.query = query.value;
    this.query = this.query.replace(/[^-\s]+/g, function(word) {
      return word.replace(/^./, function(first) {
        return first.toUpperCase();
      });
    });
    console.log(this.query);
    
    this.queryResults = [];
    if(query.value !== ""){
      if(this.type == "username"){
        this.dataService.searchUsersByUsername(query.value).then((snap)=>{
          snap.forEach((childSnap)=>{
            this.queryResults.push(childSnap);
            console.log(childSnap.val());
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
            this.queryResults.push(childSnap);
            console.log(childSnap.val());
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

  goToProfile(user:any){
    this.navCtrl.push(ProfilePage,{user:user,search:true})
  }

  onCancel(){
    this.query = null;
    this.queryResults = [];
  }

}
