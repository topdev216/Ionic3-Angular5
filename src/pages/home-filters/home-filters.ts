import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { DataService } from '../../providers/services/dataService';
import * as StackTrace from 'stacktrace-js';

/**
 * Generated class for the HomeFiltersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home-filters',
  templateUrl: 'home-filters.html',
})
export class HomeFiltersPage {

  filter:string = "partner";

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {
    this.filter = this.navParams.get('filter') || "partner";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomeFiltersPage');
  }

  select(){
    console.log('selected value',this.filter);
    this.navCtrl.pop();
  }

  ionViewWillLeave(){
    this.navCtrl.getPrevious().data.filter = this.filter;
  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }
}
