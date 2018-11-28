import { Component, NgZone, Input, OnInit, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { NavController, Events, PopoverController, Card, NavParams, InfiniteScroll, ToastController, ModalController, LoadingController, Keyboard} from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { DataService } from '../../providers/services/dataService';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { HomeFiltersPage } from '../home-filters/home-filters';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';
import * as moment from 'moment';
import { GameInformationPage } from '../game-information/game-information';
import { TradeDetailsPage } from '../trade-details/trade-details';
import { IonicStepperComponent } from 'ionic-stepper';
import * as StackTrace from 'stacktrace-js';


export interface CountdownTimer {
  seconds: number;
  secondsRemaining: number;
  runTimer: boolean;
  hasStarted: boolean;
  hasFinished: boolean;
  displayTime: string;
  tradeKey:string;
  message:string;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  @Input('card') card:Card
  @Input('infiniteScroll') infiniteScroll: InfiniteScroll;
  @ViewChildren(IonicStepperComponent) steppers: QueryList<IonicStepperComponent>;
  public authState:boolean = null;
  private username :string = "adasdasda";
  private loading:boolean;
  private timerArray: CountdownTimer [] = [];
  private timeInSeconds:number;
  private unreadNotifications:number;
  private initialLoad:boolean = false;
  private lastKey:string = "";
  private trades_count :number;
  private finished:boolean = false;
  private showGamecard: boolean = false;
  private searchPlaceholder: string = "Search Game";
  private filter:string = "game";
  private query:string = "";
  private trades:any[] = [];
  private games:any [] = [];
  private tabBar:any;
  private temporalTrades:any[] = [];
  private interestedGames:any[] = [];
  private interestedConsoles:any[] = [];
  private interestedAccessories:any [] = [];
  constructor(public navCtrl: NavController
  , public dataService: DataService
  , public events: Events
  , public zone: NgZone
  , public navParams: NavParams
  , public popoverCtrl: PopoverController
  , public backbuttonService: BackButtonProvider
  , public toastCtrl: ToastController
  , public modalCtrl: ModalController
  , public loadingCtrl: LoadingController
  , public cdref: ChangeDetectorRef) {

    document.addEventListener("keydown", (event:any)=>{
      let key = event.key;
      if(key === 'Backspace'){
        if(event.target.value.trim().length === 1){
          this.games = [];
          if(this.trades.length === 0){
          this.showGamecard = false;
          this.lastKey = "";
          this.loadTrades(this.infiniteScroll);
          }
        }
      }
    });
    
    this.tabBar = document.querySelector('.tabbar.show-tabbar');


    this.zone=new NgZone({enableLongStackTrace: false});

    this.dataService.liveTradesService();

    this.dataService.liveTradesCount();


    window.addEventListener('keyboardDidShow', ()=>{
      this.tabBar.style.display = 'none';
    });

    window.addEventListener('keyboardDidHide', ()=>{
      this.tabBar.style.display = 'flex';
    });

    this.dataService.tradeCountChange.subscribe((value)=>{
      this.trades_count = value;
    })

    this.dataService.tradesChange.subscribe((value)=>{

        value.sort((a,b) => a.trade.creationTime - b.trade.creationTime);

        console.log('trade new value:',value);  
        console.log('trade new value length',value.length);
        console.log('trade new value current length:',this.temporalTrades.length)
        if(value.length > this.temporalTrades.length){
          if(this.initialLoad){
            console.log('pushing new value:',value)
            console.log('pushing new trade:',value[value.length-1]);
              this.zone.run(()=>{
                this.checkForBetterOffer();
                this.trades.unshift(value[value.length-1]);
                let timer = <CountdownTimer>{
                  seconds: 180,
                  runTimer: false,
                  hasStarted: false,
                  hasFinished: false,
                  secondsRemaining: 180,
                  tradeKey:value[value.length-1].key
                };
                this.timerArray.unshift(timer);
                this.initTimer(180,value[value.length-1].key,0);
                this.temporalTrades = value;
              });
            
          }
          else{
            this.initialLoad = true;
            this.trades.forEach((trade,index)=>{
              if(trade.trade.status === 'accepted'){
                this.zone.run(()=>{
                  this.timerArray[index].hasFinished = true;
                  this.timerArray[index].message = 'Trade Accepted';
                })
              }
              else if(trade.trade.status === 'expired'){
                this.zone.run(()=>{
                  this.trades.splice(index,1);
                  this.timerArray.splice(index,1);
                })
              }
            })
            this.temporalTrades = value;
          }
        }
        else if(value.length < this.temporalTrades.length){
          this.initialLoad = true;

            let newTradeKeys = [];
            value.forEach((trade)=>{
              newTradeKeys.push(trade.key);
            })
  
            this.trades.forEach((trade,index)=>{
              if(!newTradeKeys.includes(trade.key)){
                this.trades.splice(index,1);
                this.timerArray.splice(index,1);
              }
            })
            this.temporalTrades = value;
        }
        else{
          this.initialLoad = true;
          let expiredKey = "";
          let acceptedKey = "";
          value.forEach((trade)=>{
            if(trade.trade.status === "expired"){
              expiredKey = trade.key;
            }
            if(trade.trade.status === "accepted"){
              acceptedKey = trade.key;
            }
          });

          this.trades.forEach((trade,index)=>{
            if(trade.key === expiredKey){
              this.zone.run(()=>{
                this.trades.splice(index,1);
              })
            }
            if(trade.key === acceptedKey){
              this.zone.run(()=>{
                this.timerArray[index].hasFinished = true;
                this.timerArray[index].message = "Trade Accepted";
              })
            }
          })
          this.temporalTrades = value;
        }
      
      console.log('trade service:',this.trades);
    });

    this.loading = true;

   

    this.events.subscribe('user logged2',(data) => {
      if(data.condition){
        this.username = data.username;
        console.log('returned user!',data.username);

        this.dataService.fetchUserInterestedGames(this.dataService.uid).then((snap)=>{
          snap.forEach((game)=>{
            this.interestedGames.push(game.val())
          });
          console.log('interested games:',this.interestedGames);
          this.trades.forEach((trade,index)=>{
            trade.trade.items.forEach((item)=>{
              if(item.hasOwnProperty('game')){
                this.interestedGames.forEach((game)=>{
                  if( (game.title).toLowerCase() === item.game.title && game.platformId === item.game.platformId) {
                    this.trades[index].showOfferButton = true;
                  }
                })
              }
            })
          })
        })
        .catch((err) => {
          this.dataService.logError(err);
        })

        this.dataService.getInterestedConsoles(this.dataService.uid).then((snap)=>{
          snap.forEach((game)=>{
            this.interestedConsoles.push(game.val())
          });
          console.log('interested consoles:',this.interestedConsoles);
          this.trades.forEach((trade,index)=>{
            trade.trade.items.forEach((item)=>{
              if(item.hasOwnProperty('console')){
                this.interestedConsoles.forEach((myConsole)=>{
                  if( myConsole.platformId === item.console.platformId) {
                    this.trades[index].showOfferButton = true;
                  }
                })
              }
            })
          })
        })
        .catch((err) => {
          this.dataService.logError(err);
        })

        this.dataService.getInterestedAccessories(this.dataService.uid).then((snap)=>{
          snap.forEach((game)=>{
            this.interestedAccessories.push(game.val())
          });
          console.log('interested accessories:',this.interestedAccessories);
          this.trades.forEach((trade,index)=>{
            trade.trade.items.forEach((item)=>{
              if(item.hasOwnProperty('accessorie')){
                this.interestedAccessories.forEach((myAccessorie)=>{
                  if( myAccessorie.itemId === item.key) {
                    this.trades[index].showOfferButton = true;
                  }
                })
              }
            })
          })
        })
        .catch((err) => {
          this.dataService.logError(err);
        })

        


        this.dataService.getNotifications().on('value',(snap)=>{

      
          console.log('new value!');

    
          let count = 0;
    
          snap.forEach((child) =>{      
            if(!child.val().data.read || child.val().data.read === 'false'){
              count++;
            }
          })
    
          console.log('unread notifications:',this.unreadNotifications);

          this.zone.run( () => {
            this.authState = true;
            this.loading = false;
            this.unreadNotifications = count; 
          })
          
        })
      
       
      }
      else{
        this.dataService.fetchUserInterestedGames(this.dataService.uid).then((snap)=>{
          snap.forEach((game)=>{
            this.interestedGames.push(game.val())
          });

          this.zone.run( () => {
            this.authState = false;
            this.loading = false;
          })
          console.log('interested games:',this.interestedGames);
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
      }
    })
    
  }

  ngOnInit(){
    this.loadTrades();
  }

  offerBetterTrade(trade: any){
    console.log('trade key:',trade.key);
    this.navCtrl.push(TradeDetailsPage,{tradeKey:trade.key})
  }

  checkForBetterOffer(){
    this.trades.forEach((trade,index)=>{
        trade.trade.items.forEach((item)=>{
          if(item.hasOwnProperty('game')){
            this.interestedGames.forEach((game)=>{
              if( (game.title).toLowerCase() === item.game.title && game.platformId === item.game.platformId) {
                this.trades[index].showOfferButton = true;
              }
            })
          }
          else if(item.hasOwnProperty('console')){
            this.interestedConsoles.forEach((myConsole)=>{
              if( myConsole.platformId === item.console.platformId) {
                this.trades[index].showOfferButton = true;
              }
            })
          }
          else{
            this.interestedAccessories.forEach((myAccessorie)=>{
              if( myAccessorie.itemId === item.key) {
                this.trades[index].showOfferButton = true;
              }
            })
          }
        })
    })
  }

  goToFilters(){
    this.navCtrl.push(HomeFiltersPage,{filter:this.filter});
  }

  initTimer(remainingSeconds:number,tradeKey:string,timerIndex: number) {
    if (!this.timeInSeconds) { 
      this.timeInSeconds = 0; 
    }

    this.timerArray[timerIndex] = <CountdownTimer>{
      seconds: 180,
      runTimer: false,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: remainingSeconds,
      tradeKey:tradeKey
    };

    this.timerArray[timerIndex].displayTime = this.getSecondsAsDigitalClock(this.timerArray[timerIndex].secondsRemaining);
    this.startTimer(tradeKey,timerIndex);
  }

  startTimer(tradeKey:string,timerIndex:number) {
    this.timerArray[timerIndex].hasStarted = true;
    this.timerArray[timerIndex].runTimer = true;
    this.timerTick(tradeKey,timerIndex);
  }

  timerTick(tradeKey:string,timerIndex: number) {
    setTimeout(() => {
      if (!this.timerArray[timerIndex].runTimer) { return; }
      this.timerArray[timerIndex].secondsRemaining--;
      this.timerArray[timerIndex].displayTime = this.getSecondsAsDigitalClock(this.timerArray[timerIndex].secondsRemaining);
      if (this.timerArray[timerIndex].secondsRemaining > 0) {
        this.timerTick(tradeKey,timerIndex);
      } else {
        this.timerArray[timerIndex].hasFinished = true;
          

          this.dataService.checkTradeStatus(tradeKey).then((snap) =>{
            if(snap.val() !== null){
              if(snap.val().status !== 'accepted'){
                this.dataService.updateTradeStatus(tradeKey,'expired').then(()=>{
                  this.zone.run(()=>{
                    this.timerArray[timerIndex].hasFinished = true;
                    this.timerArray.splice(timerIndex,1);
                    this.trades.splice(timerIndex,1);
                  });
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

  searchGame(event:any){
    
      this.loading = true;
      // this.trades = [];
      // this.lastKey = "";
      this.dataService.searchGamesAPI(this.query,null).subscribe((data:any)=>{
        this.games = data;
        for(let i = 0; i < data.length ; i++){
          let date = moment(this.games[i].first_release_date).format("MMM Do YYYY");
          this.games[i].first_release_date = date;
        }

        this.showGamecard = true;
        this.loading = false;
        console.log(this.games);
      },(err)=>{
          this.loading = false;
          let toast = this.toastCtrl.create({
            message:'An error has occurred, please try again',
            duration:2000
          });
    
          toast.present();
          
          console.log('An error has ocurred.');
      })
    
  }

  doSearch(event:any){
    
    console.log('query event:',event);
    console.log('query:',this.query);
    this.showGamecard = false;
    if(this.query && this.query.trim() != ''){
      if(this.filter === 'platform'){

        const temporal = this.trades;

        let parsedData = [];
        for(let i = 0 ; i < temporal.length ; i++){
          for(let j = 0 ; j < temporal[i].trade.items.length; j++){
              if(temporal[i].trade.items[j].game.platform.indexOf(this.query.toLowerCase()) > -1){
                parsedData.push(temporal[i]);
                break;
              }
          }
        }
        

       this.trades = parsedData;
       

        console.log('parsed data',parsedData);
     
      }
      else if(this.filter === 'game'){
        const temporal = this.trades;

        let parsedData = [];
     
        for(let i = 0 ; i < temporal.length ; i++){
          
          for(let j = 0 ; j < temporal[i].trade.items.length; j++){
            if(temporal[i].trade.items[j].hasOwnProperty('game')){
              if(temporal[i].trade.items[j].game.title.indexOf(this.query.toLowerCase()) > -1){
                parsedData.push(temporal[i]);
                break;
              }
            }
          }
        }

       this.trades = parsedData;
       

        console.log('parsed data',parsedData);
      }
      else if(this.filter === 'username'){
        const temporal = this.trades;
        let readsProposer = [];
        let readsReceiver = [];
        for(let i = 0 ; i < temporal.length ; i++){
          let proposer = temporal[i].trade.proposer;
          let promise = this.dataService.fetchUserFromDatabase(proposer).then((snap)=>{
            return snap.val().username.toLowerCase();
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
          readsProposer.push(promise);
        }

        for(let j = 0 ; j < temporal.length ; j++){
          let receiver = temporal[j].trade.receiver;
          let promise = this.dataService.fetchUserFromDatabase(receiver).then((snap)=>{
            return snap.val().username.toLowerCase();
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
          readsReceiver.push(promise);
        }

        Promise.all(readsProposer).then((values)=>{
          for(let i = 0 ; i < temporal.length ; i++){
            temporal[i].trade.proposerUsername = values[i];
          }

          Promise.all(readsReceiver).then((res)=>{
            for(let j = 0 ; j < temporal.length ; j++){
              temporal[j].trade.receiverUsername = res[j];
            }        
            console.log('promise values',res);

            let parsedData = [];
            for(let k = 0 ; k < temporal.length ; k++){
              if( (temporal[k].trade.proposerUsername.indexOf(this.query.toLowerCase()) > -1) || (temporal[k].trade.receiverUsername.indexOf(this.query.toLowerCase()) > -1) ){
                parsedData.push(temporal[k]);
              }
            }

            this.trades = parsedData;

            console.log('parsed data',parsedData);
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
  
          console.log('promise values',values);
        })
        .catch((err) => {
          this.dataService.logError(err);
        })

        console.log('temporal trades',temporal);
      }
    }
    else{
      // this.infiniteScroll.enable(true);
    }
    
  }

  viewGame(id:string){
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();
    this.dataService.getGame(id).subscribe((data)=>{

      console.log('server data:',data);
      this.navCtrl.push(GameInformationPage,{data:data[0]}).then(()=>{
        loader.dismiss();
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    },(err)=>{
      console.log('server error:',err);
      loader.dismiss();
    })
  }

  loadTrades(infiniteScroll? : InfiniteScroll ){
    if(this.finished){
      this.showGamecard = false;
      if(infiniteScroll){
      infiniteScroll.enable(false);
      }
      return
    }
    else{
    
    console.log('selected filter:',this.filter);
    this.dataService.liveTrades(this.lastKey).subscribe((data)=>{
      this.showGamecard = false;
      const currentTrades = this.trades;
      console.log('current trades:',currentTrades);
      const newTrades = [];
      data.forEach((trade)=>{
            newTrades.push(trade);
      });

      if(currentTrades.length < newTrades.length){

      }
      else{
        newTrades.shift();
      }

      console.log('new trades:',newTrades);


      if(newTrades.length > 0){

          this.trades = currentTrades.concat(newTrades);
          this.trades.forEach((trade,index)=>{

            let now = moment().unix() * 1000;
            let timePassed = now - trade.trade.creationTime;
            let secondsPassed = timePassed / 1000;
            let remainingSeconds = 180 - secondsPassed;

            console.log('remaining seconds scroll:',remainingSeconds);

            this.timerArray[index] = <CountdownTimer>{
              seconds: 180,
              runTimer: false,
              hasStarted: false,
              hasFinished: false,
              secondsRemaining: remainingSeconds,
              tradeKey:trade.key
            };

            if(remainingSeconds > 0){
              this.initTimer(remainingSeconds,trade.key,index);
            }
            else{
              this.timerArray[index].hasFinished = true;
              if(trade.trade.status === 'accepted'){
                this.timerArray[index].message = 'Trade Accepted';
              }
              else if(trade.trade.status === 'expired'){
                this.trades.splice(index,1);
              }
            }
          });
          // if(this.trades.length > this.temporalTrades.length){
          //   this.temporalTrades = this.trades;
          // }
      }

      if(newTrades[newTrades.length-1] === undefined){
        this.finished = true;
      }
      else{
        this.lastKey = newTrades[newTrades.length-1].key;
      }
      
      this.checkForBetterOffer();

      if(infiniteScroll){
        infiniteScroll.complete();
      }
      console.log('loaded trades',this.trades);
      console.log('loaded trades:',data.length);
    })
    }
    
  }


  ionViewWillLeave(){
    this.dataService.previousTab = 'HomePage';
  }

  ionViewWillEnter(){

    this.dataService.activeTab = 'HomePage';
    console.log(this.dataService.activeTab);

    this.filter = this.navParams.get('filter') || 'game';
    this.finished = false;
    if(this.filter !== null){
      if(this.filter === 'partner'){
        this.searchPlaceholder = "Search Game";
      }
      else if(this.filter === 'game'){
        this.searchPlaceholder = "Search Game";
      }
      else if(this.filter === 'platform'){
        this.searchPlaceholder = "Search Platform";
      }
      else if(this.filter === 'username'){
        this.searchPlaceholder = "Search Username";
      }
      else{
        this.searchPlaceholder = "Search Email";
      }
    }
    console.log('selected filter:',this.filter);
  }

  ionViewDidLoad(){
    this.username = this.dataService.username;
    this.stepperService();
  }

  ngAfterContentChecked(){
    this.cdref.detectChanges();
  }

  checkStepStates(){
    this.steppers.toArray().forEach((item,index)=>{
      console.log('step status:',this.trades[index].trade.status);
      if(this.trades[index].trade.status === 'accepted'){
        item.setStep(1);
      }
      else if(this.trades[index].trade.status === 'pending'){
        item.setStep(0);
      }
      else if(this.trades[index].trade.status === 'admin-accepted'){
        item.setStep(2);
      }
      else if(this.trades[index].trade.status === 'admin-shipped'){
        item.setStep(3);
      }
      else if(this.trades[index].trade.status === 'admin-completed'){
        item.setStep(4);
      }
      else{
        this.trades.splice(index,1);
      }
    });
  }

  stepperService(){
    this.steppers.changes.subscribe((list)=>{
     console.log('stepper:',list);
     this.checkStepStates();
    });
  }
  

  private goToLogin() :void{
    this.navCtrl.push(LoginPage);
  }

  showPopover(myEvent):void{
    // let popover = this.popoverCtrl.create(PopoverHeaderComponent);
    // popover.present({
    //   ev:myEvent
    // });
    StackTrace.get().then((trace) => {       const stackString = trace[0].toString();       this.dataService.showPopover(PopoverHeaderComponent,myEvent,stackString);     })     .catch((err) => {       this.dataService.logError(err);       this.dataService.showToast('Error sending stacktrace...');     })
  }

  private goToProfile() :void{
    this.navCtrl.parent.select(4);
  }

  private logout(): void{
    this.dataService.signOut().then(()=>{
  
    })
    .catch((err) => {
      this.dataService.logError(err);
    })
  }

  private goToNotifications() :void{
    this.events.publish('notification page');
  }
}
