import { Component, Input, OnInit, NgZone, ViewChild, HostListener } from '@angular/core';
import { DataService } from '../../providers/services/dataService';
import * as moment from 'moment';
import { TradeDetailsPage } from '../../pages/trade-details/trade-details';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import * as firebase from 'firebase';
import { Slides } from 'ionic-angular';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { GameInformationPage } from '../../pages/game-information/game-information';


/**
 * Generated class for the TradeCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

export interface CountdownTimer {
  seconds: number;
  secondsRemaining: number;
  runTimer: boolean;
  hasStarted: boolean;
  hasFinished: boolean;
  displayTime: string;
  tradeKey:string;
}


@Component({
  selector: 'trade-card',
  templateUrl: 'trade-card.html'
})
export class TradeCardComponent implements OnInit {

  @Input() public message: any;
  @Input() public chatKey: string;
  @Input() public isDirect:boolean;
  @ViewChild('offeringSlides') offeringSlides: Slides;
  @ViewChild('receivingSlides') receivingSlides: Slides;


  timeInSeconds: number;
  timer: CountdownTimer;
  tradeKey:string;
  messageKey:string;
  receiverUid:string;
  fromUid:string;
  showButtons:boolean = false;
  showWaitingMessage = false;
  waitingMessage:string = null;
  expired:boolean = false;
  accepted:boolean = false;
  text: string;
  games:any [] = [];
  proposerUsername:string;
  isProposer:boolean = false;
  isReceiver:boolean = false;
  receiverUsername:string;
  isNotTradeInvolved:boolean = false;
  offeringGames: any [] = [];
  receivingGames: any[] = [];
  innerWidth:number;


  constructor(public dataService: DataService,public ngZone: NgZone, public navCtrl: NavController,public loadingCtrl: LoadingController
    , public toastCtrl: ToastController) {
    console.log('Hello TradeCardComponent Component asdasdas');
    this.text = 'Hello World';
  }

  ionViewWillEnter(){
    
  }

  nextOffering() {
    this.offeringSlides.slideNext();
  }

  prevOffering() {
    this.offeringSlides.slidePrev();
  }

  nextReceiving() {
    this.receivingSlides.slideNext();
  }

  prevReceiving() {
    this.receivingSlides.slidePrev();
  }


  ngOnInit() {

    this.tradeKey = this.message.tradeKey;
    this.messageKey = this.message.messageKey;
    this.receiverUid = this.message.toUid;
    this.fromUid = this.message.fromUid;

    this.dataService.getLiveTradeStatus(this.message.tradeKey).on('value',(snap) =>{
      console.log('live trade:',snap.val());
      if(snap.val() !== null){
        if(snap.val().proposer === this.dataService.uid){
          this.isProposer = true;
        }
        else if(snap.val().receiver === this.dataService.uid){
          this.isReceiver = true;
        }
        else{
          this.isNotTradeInvolved = true;
        }
        if(snap.val().status === 'accepted'){
          if(this.timer !== undefined){
            console.log('timer not undefined');
            this.accepted = true;
            this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
            this.showWaitingMessage = true;
            this.showButtons = false;
            this.timer.hasFinished = true;

          }
          else{
            console.log('timer undefined!');
            this.accepted = true;
            this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
            this.showWaitingMessage = true;
            this.showButtons = false;
          }
        }
        else if(snap.val().status === 'expired'){
          if(this.timer !== undefined){
            console.log('timer not undefined');
            this.waitingMessage = "Trade expired";
            this.expired = true;
            this.showWaitingMessage = true;

            let now = new Date().getTime();
    
            let timePassed = now - snap.val().creationTime;
            
            let minutesPassed = timePassed / 60000;


            console.log('expired minutes passed:',minutesPassed);
            
           
            if(minutesPassed <= 4 && minutesPassed >=3){
              this.showWaitingMessage = true;
              this.showButtons = false;
              this.showButtons = false;
              this.timer.hasFinished = true;
            }
            else{
              this.dataService.declineTradeOffer(this.tradeKey).then(()=>{
                this.dataService.removeTradeMessage(this.tradeKey,this.isDirect,this.chatKey,this.messageKey).then(()=>{
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
          else{
            console.log('timer undefined!');
            this.expired = true;
            this.waitingMessage = "Trade expired";
            let now = new Date().getTime();
    
            let timePassed = now - snap.val().creationTime;
            
            let minutesPassed = timePassed / 60000;


            console.log('expired minutes passed:',minutesPassed);
            
           
            if(minutesPassed <= 4 && minutesPassed >=3){
              this.showWaitingMessage = true;
              this.showButtons = false;
            }
            else{
              if(this.message.tradeKey !== null || this.message.tradeKey !== undefined){
                this.dataService.declineTradeOffer(this.message.tradeKey).then(()=>{
                  this.dataService.removeTradeMessage(this.message.tradeKey,this.isDirect,this.chatKey,this.messageKey).then(()=>{
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
          }
        }
      }
    });

    this.dataService.fetchUserFromDatabase(this.fromUid).then((snap)=>{
      this.proposerUsername = snap.val().username
    })
    .catch((err) => {
      this.dataService.logError(err);
    })

    this.dataService.fetchUserFromDatabase(this.receiverUid).then((snap)=>{
      this.receiverUsername = snap.val().username
    })
    .catch((err) => {
      this.dataService.logError(err);
    })

    

    

    this.dataService.fetchTrade(this.tradeKey).then((snap)=>{
      if(snap.val() !== null){

        let games = snap.val().items;

          if(this.receiverUid === this.dataService.uid){
            this.showButtons = true;
            for(let i = 0 ; i < games.length; i++){
              if(games[i].type === 'offering'){
                this.receivingGames.push(games[i])
              }
              else{
                this.offeringGames.push(games[i]);
              }
            }
          }
          else if(this.fromUid === this.dataService.uid){
            this.isProposer = true;
            this.showWaitingMessage = true;
            for(let i = 0 ; i < games.length; i++){
              if(games[i].type === 'offering'){
                this.offeringGames.push(games[i])
              }
              else{
                this.receivingGames.push(games[i]);
              }
            }
        }

        else{
          this.isNotTradeInvolved = true;
          for(let i = 0 ; i < games.length; i++){
            if(games[i].type === 'offering'){
              this.offeringGames.push(games[i])
            }
            else{
              this.receivingGames.push(games[i]);
            }
          }
        }

        if(snap.val().status === 'accepted'){
          let games = snap.val().items;
          for(let i = 0; i < games.length ; i++){
            this.games.push(games[i]);
          }
          this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
          this.showWaitingMessage = true;
          this.showButtons = false;
          this.accepted = true;
          this.initTimer(0);
        }
        else if(snap.val().status === 'declined'){
          this.waitingMessage = "Trade has been declined! Please try another trade";
          this.showWaitingMessage = true;
          this.showButtons = false;
        }

        else if(snap.val().status === 'expired'){
          let games = snap.val().items;
          for(let i = 0; i < games.length ; i++){
            this.games.push(games[i]);
          }
          this.waitingMessage = "Trade expired";
          this.showWaitingMessage = true;
          this.showButtons = false;
          this.expired = true;
        }
        else{

          let now = new Date().getTime();
          let test = moment().utc().valueOf();
  
          let timePassed = now - snap.val().creationTime;
          
          let minutesPassed = timePassed / 60000;
          let secondsPassed = timePassed / 1000;
          console.log('creationTime:',snap.val().creationTime);
          console.log('now:',test);
          console.log('secondsPassed:',secondsPassed)
          console.log('minutesPassed:',minutesPassed);
          let remainingSeconds = 180 - secondsPassed;
  
          for(let i = 0; i < games.length ; i++){
            this.games.push(games[i]);
          }
  
          if(minutesPassed <= 3){
            // this.timeInSeconds = 180 - secondsPassed;
            this.initTimer(remainingSeconds);
          }
          else if(minutesPassed <= 4 && minutesPassed >=3){
            this.showWaitingMessage = true;
            this.showButtons = false;
          }
          else{
            this.timeInSeconds = 0;
            this.showButtons = false;
            this.showWaitingMessage = true;    
            if(snap.val().status === 'pending'){
              this.dataService.updateTradeStatus(this.tradeKey,'expired').then(()=>{
                console.log('trade expired!');
              })
              .catch((err) => {
                this.dataService.logError(err);
              })
            }

          }
        }

        
      }
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
    console.log('Passed down',this.message);
  }

  hasFinished() {
    return this.timer.hasFinished;
  }

  viewDetails(){
    this.navCtrl.push(TradeDetailsPage,{tradeKey:this.tradeKey,chatKey:this.chatKey,messageKey:this.messageKey})
  }

  initTimer(remainingSeconds:number) {
    if (!this.timeInSeconds) { 
      this.timeInSeconds = 0; 
    }

    this.timer = <CountdownTimer>{
      seconds: 180,
      runTimer: false,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: remainingSeconds,
      tradeKey:this.tradeKey
    };

    this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
    this.startTimer();
  }

  startTimer() {
    this.timer.hasStarted = true;
    this.timer.runTimer = true;
    this.timerTick();
  }

  pauseTimer() {
    this.timer.runTimer = false;
  }

  resumeTimer() {
    this.startTimer();
  }

  viewGame(id:string){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    })

    loader.present();

    this.dataService.getGame(id).subscribe((data)=>{

      console.log('server data:',data);
      this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
        loader.dismiss();
      })
      .catch((err) => {
        loader.dismiss();
        this.dataService.logError(err);
      })
    },(err)=>{
      console.log('server error:',err);
      loader.dismiss();
    })
  }

  timerTick() {
    setTimeout(() => {
      if (!this.timer.runTimer) { return; }
      this.timer.secondsRemaining--;
      this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
      if (this.timer.secondsRemaining > 0) {
        this.timerTick();
      } else {
        this.timer.hasFinished = true;
        this.ngZone.run(()=>{
          

          this.dataService.checkTradeStatus(this.tradeKey).then((snap) =>{
            if(snap.val() !== null){
              if(snap.val().status !== 'accepted'){
                this.dataService.updateTradeStatus(this.tradeKey,'expired').then(()=>{
                  this.expired = true;
                  this.waitingMessage = "Trade expired";  
                  this.showButtons = false;
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

  acceptTrade(){
    
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });

    loader.present();
    
    this.dataService.acceptTradeOffer(this.tradeKey).then(()=>{
      this.dataService.blockInventory(this.tradeKey,false).then(()=>{
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',this.tradeKey,this.chatKey).subscribe((data:any)=>{
          console.log(data);
  
          loader.dismiss();
          let toast = this.toastCtrl.create({
            message:'The trade proposer has been notified!',
            duration:2000
          });
          toast.present();
          this.ngZone.run(() =>{
            this.accepted = true;
            this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
            this.showWaitingMessage = true;
            this.showButtons = false;
            this.timer.secondsRemaining = 0;
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

  declineTrade(){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });

    loader.present();
    
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',this.tradeKey,this.chatKey).subscribe((data:any)=>{
          console.log(data);
          this.dataService.unblockInventory(this.tradeKey).then(()=>{
            this.dataService.declineTradeOffer(this.tradeKey).then(()=>{
              console.log('trade declined and removed');
              this.dataService.removeTradeMessage(this.tradeKey,this.isDirect,this.chatKey,this.messageKey).then(()=>{
                let toast = this.toastCtrl.create({
                  message:'Trade has been declined, the proposer has been notified!',
                  duration:2000
                });
                loader.dismiss();
                toast.present();
                console.log('trade card message removed');
            })
            .catch((err) => {
              this.dataService.logError(err);
            })
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
    })
          
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


}
