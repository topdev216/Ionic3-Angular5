import { Component, NgZone, ViewChild, QueryList, ElementRef, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';
import { IonicStepperComponent } from 'ionic-stepper';
import { GameInformationPage } from '../game-information/game-information';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import * as StackTrace from 'stacktrace-js';


export interface CountdownTimer {
  seconds: number;
  secondsRemaining: number;
  runTimer: boolean;
  hasStarted: boolean;
  hasFinished: boolean;
  displayTime: string;
  showMessage: boolean;
  message: string;
  tradeKey:string;
}
/**
 * Generated class for the TradeHistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-trade-history',
  templateUrl: 'trade-history.html',
})
export class TradeHistoryPage {
  
  @ViewChildren(IonicStepperComponent) steppers: QueryList<IonicStepperComponent>;
  type:string="proposed";
  proposedTrades: any[] = [];
  receivedTrades: any[] = [];
  loading = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService
    , public backbuttonService: BackButtonProvider
    , public loadingCtrl: LoadingController
    , public zone: NgZone
    , public cdref: ChangeDetectorRef
    , public toastCtrl: ToastController) {

      this.dataService.liveProposedTrades();
      this.dataService.liveReceivedTrades();
      
      this.dataService.proposedTradesChange.subscribe((data)=>{
  
        this.proposedTrades = [];
        console.log('proposed trades:',data);
  
        data.forEach((trade)=>{
          let timer = {} as CountdownTimer;
              
              let now = new Date().getTime();
              let creationTime = trade.trade.creationTime;
              let timePassed = now - creationTime;
              let minutesPassed = timePassed / 60000;
              let secondsPassed = timePassed / 1000;
  
              if(minutesPassed <= 3 && trade.trade.status !== 'accepted'){
                timer.hasFinished = false;
                timer.secondsRemaining = 180 - secondsPassed;
                timer.seconds = 180;
                timer.runTimer = false;
                timer.hasStarted = false;
                timer.showMessage = false;
                timer.displayTime = this.getSecondsAsDigitalClock(timer.secondsRemaining);
                timer.tradeKey = trade.key
                timer.hasStarted = true;
                timer.runTimer = true;
                this.timerTick(timer);
  
                let obj = {
                  trade: trade.trade,
                  timer: timer
                };
                
                this.proposedTrades.push(obj);
              }
              else{
                timer.hasFinished = true;
                timer.showMessage = true;
                timer.message = 'Timer already expired';
                let obj = {
                  trade: trade.trade,
                  timer:timer
                };
                this.proposedTrades.push(obj);
              }
        })
        if(this.steppers !== undefined){
          this.iterateProposedTrades();
        }
        this.proposedTrades.reverse();
  
      })
  
      this.dataService.receivedTradesChange.subscribe((data)=>{
        this.receivedTrades = [];
        console.log('received trades:',data)
        data.forEach((trade)=>{
          let timer = {} as CountdownTimer;
              
              let now = new Date().getTime();
              let creationTime = trade.trade.creationTime;
              let timePassed = now - creationTime;
              let minutesPassed = timePassed / 60000;
              let secondsPassed = timePassed / 1000;
  
              if(minutesPassed <= 3){
                timer.hasFinished = false;
                timer.secondsRemaining = 180 - secondsPassed;
                timer.seconds = 180;
                timer.runTimer = false;
                timer.hasStarted = false;
                timer.showMessage = false;
                timer.displayTime = this.getSecondsAsDigitalClock(timer.secondsRemaining);
                timer.tradeKey = trade.key
                timer.hasStarted = true;
                timer.runTimer = true;
                this.timerTick(timer);
  
                let obj = {
                  trade: trade.trade,
                  timer: timer
                };
                
                this.receivedTrades.push(obj);
              }
              else{
                timer.hasFinished = true;
                timer.showMessage = true;
                timer.message = 'Timer already expired';
                let obj = {
                  trade: trade.trade,
                  timer:timer
                };
                this.receivedTrades.push(obj);
              }
        })
        if(this.steppers !== undefined){
          this.iterateReceivedTrades();
        }
        this.receivedTrades.reverse();
      })

  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TradeHistoryPage');
    this.stepperService();
  }

  ngAfterContentChecked(){
    this.cdref.detectChanges();
  }

  private showPopover(myEvent):void{
  StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  iterateProposedTrades(){
    this.steppers.toArray().forEach((step,index)=>{
      if(this.proposedTrades[index] !== undefined){
        if(this.proposedTrades[index].trade.status === 'accepted'){
            step.setStep(1);
        }
        else if(this.proposedTrades[index].trade.status === 'pending'){
          step.setStep(0);
        }
        else if(this.proposedTrades[index].trade.status === 'admin-accepted'){
          step.setStep(2);
        }
        else if(this.proposedTrades[index].trade.status === 'admin-shipped'){
          step.setStep(3);
        }
        else if(this.proposedTrades[index].trade.status === 'admin-completed'){
          step.setStep(4);
        }
        else{
          this.proposedTrades.splice(index,1);
        }
      }
    });
  }

  iterateReceivedTrades(){
    this.steppers.toArray().forEach((step,index)=>{
      if(this.receivedTrades[index] !== undefined){
        if(this.receivedTrades[index].trade.status === 'accepted'){
            step.setStep(1);
        }
        else if(this.receivedTrades[index].trade.status === 'pending'){
          step.setStep(0);
        }
        else if(this.receivedTrades[index].trade.status === 'admin-accepted'){
          step.setStep(2);
        }
        else if(this.receivedTrades[index].trade.status === 'admin-shipped'){
          step.setStep(3);
        }
        else if(this.receivedTrades[index].trade.status === 'admin-completed'){
          step.setStep(4);
        }
        else{
          this.receivedTrades.splice(index,1);
        }
      }
    });
  }

  stepperService(){
    this.iterateProposedTrades();
    this.iterateReceivedTrades();
    this.steppers.changes.subscribe((list)=>{
      console.log('new trade');
      this.iterateProposedTrades();
      this.iterateReceivedTrades();
    });
  }

  ionViewDidEnter(){
  }

  ionViewWillEnter() {
    this.dataService.activeTab = 'TradeHistoryPage';
  }

  getSecondsAsDigitalClock(inputSeconds: number) {
    const secNum = parseInt(inputSeconds.toString(), 10); // don't forget the second param
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor((secNum - (hours * 3600)) / 60);
    const seconds = secNum - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';
    hoursString = (hours < 10) ? '0' + hours : hours.toString();
    minutesString = (minutes < 10) ? '0' + minutes : minutes.toString();
    secondsString = (seconds < 10) ? '0' + seconds : seconds.toString();
    return hoursString + ':' + minutesString + ':' + secondsString;
  }

  timerTick(timer) {
    setTimeout(() => {
      if (!timer.runTimer) { return; }
      timer.secondsRemaining--;
      timer.displayTime = this.getSecondsAsDigitalClock(timer.secondsRemaining);
      if (timer.secondsRemaining > 0) {
        this.timerTick(timer);
      } else {
        timer.hasFinished = true;
        this.zone.run(()=>{
          

          this.dataService.checkTradeStatus(timer.tradeKey).then((snap) =>{
            if(snap.val() !== null){
              if(snap.val().status !== 'accepted'){
                this.dataService.updateTradeStatus(timer.tradeKey,'expired').then(()=>{
                  timer.showMessage = true;
                  timer.message = 'Expired trade';
                })
                .catch((err) => {
                  this.dataService.logError(err);
                })  
              }
            }
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
                                                                                                                                                                                                                                                                                            
        })
      }
    }, 1000);
  }


  acceptTrade(trade:any){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });

    loader.present();
    
    this.dataService.acceptTradeOffer(trade.timer.tradeKey).then(()=>{
      this.dataService.blockInventory(trade.timer.tradeKkey,false).then(()=>{
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',trade.timer.tradeKey,trade.trade.chatKey).subscribe((data:any)=>{
          console.log(data);
  
          loader.dismiss();
          let toast = this.toastCtrl.create({
            message:'The trade proposer has been notified!',
            duration:2000
          });
          toast.present();
          this.zone.run(() =>{
            // trade.timer.secondsRemaining = 0;
            // trade.timer.hasFinished = true;
            this.receivedTrades.forEach((item,index)=>{
              if(item.timer.tradeKey === trade.timer.tradeKey){
                this.receivedTrades[index].timer.hasFinished = true;
              }
            })
          })
  
        },(err)=>{
          let toast = this.toastCtrl.create({
            message:'An error has occurred while notifying the user',
            duration:2000
          });
          loader.dismiss();
          toast.present();
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
  
  declineTrade(trade:any,isCancel:boolean){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });

    loader.present();


        if(!isCancel){
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',trade.timer.tradeKey,trade.trade.chatKey).subscribe((data:any)=>{
          console.log(data);
          this.dataService.unblockInventory(trade.timer.tradeKey).then(()=>{
            this.dataService.declineTradeOffer(trade.timer.tradeKey).then(()=>{
              console.log('trade declined and removed');
              let toast = this.toastCtrl.create({
                message:'Trade has been declined, the proposer has been notified!',
                duration:2000
              });
              loader.dismiss();
              toast.present();
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
       
      },(err) =>{
        this.dataService.logError(err);
        console.log(err);
        let toast = this.toastCtrl.create({
          message:'An error has occurred, while notifying the user.',
          duration:2000
        });
        loader.dismiss();
        toast.present();
      })
    })
    }
    else{
      this.dataService.unblockInventory(trade.timer.tradeKey).then(()=>{
        this.dataService.declineTradeOffer(trade.timer.tradeKey).then(()=>{
          console.log('trade declined and removed');
          let toast = this.toastCtrl.create({
            message:'Trade has been canceled!',
            duration:2000
          });
          loader.dismiss();
          toast.present();
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
   
  },(err) =>{
    console.log(err);
    this.dataService.logError(err);  
    let toast = this.toastCtrl.create({
      message:'An error has occurred, while notifying the user.',
      duration:2000
    });
    loader.dismiss();
    toast.present();
  })
    }
        
  }

  viewGame(gameKey:any){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();
    this.dataService.getGame(gameKey).subscribe((data)=>{

      console.log('server data:',data);
      this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
        loader.dismiss();
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    },(err)=>{
      this.dataService.logError(err);  
      console.log('server error:',err);
      loader.dismiss();
    })
  }

  ionViewWillLeave(){
    this.dataService.previousTab = 'TradeHistoryPage';
  }

}
