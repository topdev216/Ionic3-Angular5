import { Component, ErrorHandler, Injectable, Injector } from '@angular/core';
import { IonicPage, NavController, NavParams, Form, LoadingController, ToastController } from 'ionic-angular';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import * as StackTrace from 'stacktrace-js';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { LogsPage } from '../logs/logs';

/**
 * Generated class for the BugReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bug-report',
  templateUrl: 'bug-report.html',
})
export class BugReportPage {

  pages: any [] = [];
  page:string = "Home";
  log:string = null;
  previousPage:string = null;
  selectOptions:any;
  description:string = null;
  image:string;
  stacktrace:string;
  type:string;
  bugForm = this.formBuilder.group({
    description: ['',Validators.compose([Validators.required,Validators.minLength(10)])]
  });
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService, public loadingCtrl: LoadingController
    , public toastCtrl: ToastController
    , public formBuilder: FormBuilder) {
    this.image = this.navParams.get('screenshot') as string;
    this.stacktrace = this.navParams.get('stacktrace') as string;
  }
  
  submit(form:any){
    if(this.description === null){
      return
    }
    else{
      console.log(form.value);
      this.dataService.showLoading('Sending report...');
      console.log('image to send:',this.image);
      if(this.dataService.platform.is('cordova')){
        this.type = 'mobile';
      }
      else{
        this.type = 'core'
      }
      this.dataService.saveBug(form.value,this.stacktrace,this.image,this.type).then(()=>{
        this.dataService.hideLoading().then(()=>{
          this.navCtrl.pop()
          .then(()=>{
            this.dataService.showToast('Your bug has been reported');
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    }
  }

  private showPopover(myEvent):void{
    this.dataService.showPopover(PopoverHeaderComponent,myEvent);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BugReportPage');
  }

  viewLogs(){
    this.navCtrl.push(LogsPage);
  }

}
