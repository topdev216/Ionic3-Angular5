import { Component, Input, OnInit, NgZone, ViewChild } from '@angular/core';
import { DataService } from '../../providers/services/dataService';
import * as moment from 'moment';
import { TradeDetailsPage } from '../../pages/trade-details/trade-details';
import { NavController } from 'ionic-angular';
import * as firebase from 'firebase';
import { Slides } from 'ionic-angular';


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
  text: string;
  games:any [] = [];
  proposerUsername:string;
  offeringGames: any [] = [];
  receivingGames: any[] = [];

  constructor(public dataService: DataService,public ngZone: NgZone, public navCtrl: NavController) {
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

    

    this.dataService.getLiveTradeStatus(this.message.tradeKey).on('value',(snap) =>{
      if(snap.val() !== null){
        if(snap.val().status === 'accepted'){
          if(this.timer !== undefined){
            console.log('timer not undefined');
            this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
            this.showWaitingMessage = true;
            this.showButtons = false;
            this.timer.hasFinished = true;
          }
          else{
            console.log('timer undefined!');
            this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
            this.showWaitingMessage = true;
            this.showButtons = false;
          }
        }
        else if(snap.val().status === 'expired'){
          if(this.timer !== undefined){
            console.log('timer not undefined');
            this.waitingMessage = "Trade expired";
            this.showWaitingMessage = true;
            this.showButtons = false;
            this.timer.hasFinished = true;
          }
          else{
            console.log('timer undefined!');
            this.waitingMessage = "Trade expired";
            this.showWaitingMessage = true;
            this.showButtons = false;
          }
        }
      }
    });

    this.tradeKey = this.message.tradeKey;
    this.messageKey = this.message.messageKey;
    this.receiverUid = this.message.toUid;
    this.fromUid = this.message.fromUid;

    this.dataService.fetchUserFromDatabase(this.fromUid).then((snap)=>{
      this.proposerUsername = snap.val().username
    });

    

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
          if(this.fromUid === this.dataService.uid){
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

        if(snap.val().status === 'accepted'){
          let games = snap.val().items;
          for(let i = 0; i < games.length ; i++){
            this.games.push(games[i].game);
          }
          this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
          this.showWaitingMessage = true;
          this.showButtons = false;
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
            this.games.push(games[i].game);
          }
          this.waitingMessage = "Trade expired";
          this.showWaitingMessage = true;
          this.showButtons = false;
        }
        else{

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
          if(this.fromUid === this.dataService.uid){
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

          
          
          let now = moment().utc().valueOf();
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
          else{
            this.timeInSeconds = 0;
            this.showButtons = false;
            this.showWaitingMessage = true;        
          }
        }

        
      }
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
                });     
              }
            }
          })
                                                                                                                                                                                                                                                                                            
        })
      }
    }, 1000);
  }

  acceptTrade(){
    
    this.dataService.acceptTradeOffer(this.tradeKey).then(()=>{
      this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'accept',this.tradeKey,this.chatKey).subscribe((data:any)=>{
        console.log(data);

        this.ngZone.run(() =>{
          this.waitingMessage = "Trade has been accepted! Our staff will now proceed to approve the trade";
          this.showWaitingMessage = true;
          this.showButtons = false;
          this.timer.secondsRemaining = 0;
        })

      })
      
    })

  }

  declineTrade(){
    
        this.dataService.sendTradeNotification(this.dataService.browserToken,this.dataService.phoneToken,this.dataService.username,'decline',this.tradeKey,this.chatKey).subscribe((data:any)=>{
          console.log(data);
          this.dataService.declineTradeOffer(this.tradeKey).then(()=>{
            console.log('trade declined and removed');
            this.dataService.removeTradeMessage(this.tradeKey,false,this.chatKey,this.messageKey).then(()=>{
              console.log('trade card message removed');
          })
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
