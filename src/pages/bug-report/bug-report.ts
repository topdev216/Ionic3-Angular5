import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Form, LoadingController, ToastController } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/services/dataService';
import { duration } from 'moment';

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
  bugForm: FormGroup;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService, public loadingCtrl: LoadingController
    , public toastCtrl: ToastController) {

    this.bugForm = new FormGroup({
      'page': new FormControl(this.page,
        [Validators.required]),
      'previousPage': new FormControl(this.previousPage),
      'description': new FormControl(this.description,[Validators.required,Validators.minLength(10)])
    })

    this.selectOptions = {
      title: 'Page',
      subTitle: 'Select page',
    }
    this.pages = [
      'Home',
      'Chat',
      'Discovery',
      'Profile',
      'Address Form',
      'Notifications',
      'Add Videogame',
      'Games List',
      'Messaging',
      'Pick Game (Trades)',
      'Select Platform',
      'Confirm Trade',
      'Trade Details',
      'Friends List',
      'Membership Plans',
      'Credit Card Form',
      'Shipping Address Form',
      'Confirm Payment',
      'Login',
      'Register'
    ]
  }
  
  submit(form:any){
    if(this.description === null){
      return
    }
    else{
      console.log(form.value);
      let loader = this.loadingCtrl.create({
        spinner:'crescent',
        content:'Please wait...'
      })

      let toast = this.toastCtrl.create({
        message:'Your bug has been reported',
        duration:2000
      });

      loader.present();
      this.dataService.saveBug(form.value).then(()=>{
        loader.dismiss().then(()=>{
          this.navCtrl.pop()
          .then(()=>{
            toast.present();
          })
        })
      })
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BugReportPage');
  }

}
