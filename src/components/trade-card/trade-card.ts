import { Component, Input, OnInit, NgZone } from '@angular/core';
import { DataService } from '../../providers/services/dataService';
import * as moment from 'moment';

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
  timeInSeconds: number;
  timer: CountdownTimer;
  tradeKey:string;
  receiverUid:string;
  fromUid:string;
  showButtons:boolean = false;
  showWaitingMessage = false;
  waitingMessage:string = "Waiting for approval...";
  expired:boolean = false;
  text: string;
  games:any [] = [];

  constructor(public dataService: DataService,public ngZone: NgZone) {
    console.log('Hello TradeCardComponent Component asdasdas');
    this.text = 'Hello World';
  }

  ngOnInit() {
    this.tradeKey = this.message.tradeKey;
    this.receiverUid = this.message.toUid;
    this.fromUid = this.message.fromUid;
    if(this.receiverUid === this.dataService.uid){
      this.showButtons = true;
    }
    if(this.fromUid === this.dataService.uid){
      this.showWaitingMessage = true;
    }
    this.dataService.fetchTrade(this.tradeKey).then((snap)=>{
      if(snap.val() !== null){

        let games = snap.val().items;
        let now = (new Date).getTime();
        let timePassed = now - snap.val().creationTime;
        let minutesPassed = Math.floor(timePassed / 60000);

        let secondsPassed = Math.floor(timePassed / 1000);

        console.log('NOW',now);
        for(let i = 0; i < games.length ; i++){
          console.log('game',games[i]);
          this.games.push(games[i].game);
        }

        if(minutesPassed < 3){
          this.timeInSeconds = 180 - secondsPassed;
          this.initTimer();
        }
        else{
          this.timeInSeconds = 0;
          this.ngZone.run(()=>{
            this.waitingMessage = "Trade expired";
          })
          this.showButtons = false;
          this.expired = true;
        }
      }
    })
    console.log('Passed down',this.message);
  }

  hasFinished() {
    return this.timer.hasFinished;
  }

  initTimer() {
    if (!this.timeInSeconds) { 
      this.timeInSeconds = 0; 
    }

    this.timer = <CountdownTimer>{
      seconds: this.timeInSeconds,
      runTimer: false,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: this.timeInSeconds,
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
      }
    }, 1000);
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
