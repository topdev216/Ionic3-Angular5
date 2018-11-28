import { Component } from '@angular/core';
import { ViewController, Events, Platform, NavController, App, Tabs, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { Screenshot } from '@ionic-native/screenshot';
import * as StackTrace from 'stacktrace-js';
import * as html2canvas from 'html2canvas';


/**
 * Generated class for the PopoverHeaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover-header',
  templateUrl: 'popover-header.html'
})
export class PopoverHeaderComponent {

  text: string;
  stacktrace:string;

  constructor(public viewCtrl: ViewController, public dataService: DataService 
    , private screenshot: Screenshot
    , private navCtrl: NavController
    , private events: Events
    , private app: App
    , private navParams: NavParams
    ) {
    console.log('Hello PopoverHeaderComponent Component');
    this.text = 'Hello World';
    this.stacktrace = this.navParams.get('stacktrace');
  }

  private logout(): void{
    this.dataService.showLoading('Logging out...');
    this.dataService.signOut().then(()=>{
      this.dataService.hideLoading();
      this.viewCtrl.dismiss().then(()=>{
        this.events.publish('log out');
        // console.log('nav views:',this.navCtrl.getViews());
        // if(this.navCtrl.getViews().length > 1){
        //   this.navCtrl.popToRoot().then(()=>{
        //     const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
        //     tabsNav.select(0);
        //   })
        // }
        // else{
        //   const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;
        //   tabsNav.select(0);
        // }
      })

    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  private sendFeedback() {
    this.viewCtrl.dismiss().then(()=>{
      this.dataService.showLoading('Please wait...');
      if(this.dataService.platform.is('cordova')){
        this.screenshot.URI().then((value) => {
            this.dataService.hideLoading();
            console.log('mobile image:',value);
            this.events.publish('report bug',{uri: value.URI,stackTrace: this.stacktrace});
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
      else{
        html2canvas(document.body).then( (canvas) => {
          let value = canvas.toDataURL('image/png');
       
            this.dataService.hideLoading();
            this.events.publish('report bug',{uri: value,stackTrace: this.stacktrace});
         
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    
  }

}
