import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { DataService } from '../../providers/services/dataService';
import * as StackTrace from 'stacktrace-js';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {

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
    if(name === 'all'){
      this.navCtrl.getPrevious().data.platform = null;
      this.navCtrl.pop()
    }
    else{
      this.navCtrl.getPrevious().data.platform = name;
      this.navCtrl.pop()
    }
    
  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

}
