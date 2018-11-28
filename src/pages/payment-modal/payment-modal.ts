import { Component, ViewChild, HostListener } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,Slides, Slide } from 'ionic-angular';
import { CreditFormPage } from '../credit-form/credit-form';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { DataService } from '../../providers/services/dataService';
import * as StackTrace from 'stacktrace-js';


/**
 * Generated class for the PaymentModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment-modal',
  templateUrl: 'payment-modal.html',
})
export class PaymentModalPage {

  @ViewChild('slides') slides: Slides;
  @ViewChild('slideA') slideA: Slide;
  @ViewChild('slideB') slideB: Slide;
  @ViewChild('slideC') slideC: Slide;
  planA : boolean = false;
  innerWidth:number;
  tabBar:any;
 


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public viewCtrl: ViewController
  , public dataService: DataService) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.slides.update();
    if(this.innerWidth >600){
      this.slides.slidesPerView = 3;
      this.slides.loop = false;
    }
    else{
      this.slides.centeredSlides = true;
      this.slides.slidesPerView  = 1.2;
      this.slides.spaceBetween = 7;
    }
  }

  private showPopover(myEvent):void{
StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  ngOnInit(){
    this.innerWidth = window.innerWidth;
    this.slides.pager = true;
    if(this.innerWidth > 600){
      this.slides.slidesPerView = 3;
      this.slides.initialSlide = 1;
      this.slides.loop = false;
    }
    else{
      this.slides.initialSlide = 1;
      this.slides.centeredSlides = true;
      this.slides.slidesPerView  = 1.2;
      // this.slides.spaceBetween = 7;
    }
  }

  zoomSlide(){
    console.log('HELLO');
    let activeIndex = this.slides.getActiveIndex();
    let currentSlide = this.slides.getNativeElement();

    console.log('activeIndex:',activeIndex);
    console.log('Element ref:',this.slides.getElementRef());
    this.slides.update()
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentModalPage');
  }

  showCredit(plan:string){
    console.log(plan);
    this.navCtrl.push(CreditFormPage,{plan:plan});
  }

  dismiss(){
    this.viewCtrl.dismiss();
  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
  }

}
