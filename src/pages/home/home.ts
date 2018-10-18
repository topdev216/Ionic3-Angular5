import { Component, NgZone, Input, OnInit } from '@angular/core';
import { NavController, Events, PopoverController, Card, NavParams, InfiniteScroll } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { LoadingPage } from '../../pages/loading/loading';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';
import { NotificationPage } from '../notification/notification';
import { HomeFiltersPage } from '../home-filters/home-filters';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  @Input('card') card:Card
  // @Input('infiniteScroll') infiniteScroll: InfiniteScroll;
  public authState:boolean = null;
  private username :string = "adasdasda";
  private loading:boolean;
  private unreadNotifications:number;
  private initialLoad:boolean = false;
  private lastKey:string = "";
  private trades_count :number;
  private finished:boolean = false;
  private showGamecard: boolean = false;
  private searchPlaceholder: string = "Search Game";
  private filter:string = "";
  private query:string = "";
  private trades:any[] = [];
  private games:any [] = [];
  private temporalTrades:any[] = [];
  private showingTrades:any[] = [];
  constructor(public navCtrl: NavController
  , public dataService: DataService
  , public events: Events
  , public zone: NgZone
  , public navParams: NavParams
  , public popoverCtrl: PopoverController) {

    this.zone=new NgZone({enableLongStackTrace: false});

    this.dataService.liveTradesService();

    this.dataService.liveTradesCount();

    this.dataService.tradeCountChange.subscribe((value)=>{
      this.trades_count = value;
    })

    this.dataService.tradesChange.subscribe((value)=>{

        value.sort((a,b) => b.creationTime - a.creationTime);

        console.log('trade new value:',value);
        console.log('trade new value length',value.length);
        console.log('trade new value current length:',this.trades.length)
        if(value.length > this.trades.length){
          if(this.initialLoad){
            console.log('pushing new value:',value)
            this.zone.run(()=>{
              this.trades.unshift(value[value.length-1]);
              this.temporalTrades = this.trades;
            });
          }
          else{
            this.initialLoad = true;
          }
        }
        else{
            this.initialLoad = true;
            // this.trades = value;
          //  this.trades.map((trade,index)=>{
          //    if(!value.includes(trade)){
          //     this.zone.run(()=>{
          //       this.trades.splice(index,1);
          //     });
          //    }
          //  })
          // this.zone.run(()=>{
          //   this.trades.shift();
          // })
        }
      
      console.log('trade service:',this.trades);
    });

    this.loading = true;

   

    this.events.subscribe('user logged2',(data) => {
      if(data.condition){
        this.username = data.username;
        console.log('returned user!',data.username);


        this.dataService.getNotifications().on('value',(snap)=>{

      
          console.log('new value!');
    
          let count = 0;
    
          snap.forEach((child) =>{      
            console.log('each child',child.val());
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
        this.zone.run( () => {
          this.authState = false;
          this.loading = false;
        })
        
      }
    })
    
  }

  ngOnInit(){
    this.loadTrades();
  }

  goToFilters(){
    this.navCtrl.push(HomeFiltersPage,{filter:this.filter});
  }

  doSearch(event:any){
        
    console.log('query event:',event.target.value);
    console.log('query:',this.query);
  
    this.trades = this.temporalTrades;
    if(this.query && this.query.trim() != ''){
      // this.infiniteScroll.enable(false);
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
      else if(this.filter === 'partner'){
        this.showGamecard = true;
        this.dataService.searchTradePartners(this.query).subscribe((data)=>{
          console.log(data);
          this.games = data;
        })
      }
      else if(this.filter === 'game'){
        const temporal = this.trades;

        let parsedData = [];
     
        for(let i = 0 ; i < temporal.length ; i++){
          
          for(let j = 0 ; j < temporal[i].trade.items.length; j++){
              if(temporal[i].trade.items[j].game.title.indexOf(this.query.toLowerCase()) > -1){
                parsedData.push(temporal[i]);
                break;
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
          readsProposer.push(promise);
        }

        for(let j = 0 ; j < temporal.length ; j++){
          let receiver = temporal[j].trade.receiver;
          let promise = this.dataService.fetchUserFromDatabase(receiver).then((snap)=>{
            return snap.val().username.toLowerCase();
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
  
          console.log('promise values',values);
        })

        console.log('temporal trades',temporal);
      }
    }
    else{
      // this.infiniteScroll.enable(true);
    }
  }

  loadTrades(infiniteScroll? : InfiniteScroll ){
 
    if(this.finished){
      infiniteScroll.complete();
      infiniteScroll.enable(false);
      return
    }
    else{

    this.dataService.liveTrades(this.lastKey).subscribe((data)=>{

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

      this.zone.run(()=>{
        this.trades = currentTrades.concat(newTrades);
        if(this.trades.length > this.temporalTrades.length){
          this.temporalTrades = this.trades;
        }
      })

      


      if(newTrades[newTrades.length-1] === undefined){
        this.finished = true;
      }
      else{
        this.lastKey = newTrades[newTrades.length-1].key;
      }
      

      if(infiniteScroll){
        infiniteScroll.complete();
      }
      console.log('loaded trades',this.trades);
      console.log('loaded trades:',data.length);
    })
    }
  }

  ionViewWillEnter(){

    this.filter = this.navParams.get('filter') || null;
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
  }

  

  private goToLogin() :void{
    this.navCtrl.push(LoginPage);
  }

  showPopover(myEvent):void{
    let popover = this.popoverCtrl.create(PopoverHeaderComponent);
    popover.present({
      ev:myEvent
    });
  }

  private goToProfile() :void{
    this.navCtrl.parent.select(4);
  }

  private logout(): void{
    this.dataService.signOut().then(()=>{
      
    });
  }

  private goToNotifications() :void{
    this.navCtrl.push(NotificationPage);
  }
}
