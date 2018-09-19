import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PlatformSelectionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-platform-selection',
  templateUrl: 'platform-selection.html',
})
export class PlatformSelectionPage {

  oldPlatforms: any[] = [];
  currentPlatforms: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    let platforms = this.navParams.get('platforms');

    for(let i = 0 ; i < platforms.length ; i++){
      if(platforms[i].old){
        this.oldPlatforms.push(platforms[i]);
      }
      else{
        this.currentPlatforms.push(platforms[i]);
      }
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlatformSelectionPage');
  }

  select(name:string){
    this.navCtrl.getPrevious().data.platform = name;
    this.navCtrl.pop()
  }

}
