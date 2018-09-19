import { Component, NgZone } from '@angular/core';
import { NavController, Events, PopoverController } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login';
import { LoadingPage } from '../../pages/loading/loading';
import { DataService } from '../../providers/services/dataService';
import * as firebase from 'firebase/app';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public authState:boolean = null;
  private username :string = "adasdasda";
  private loading:boolean;
  private unreadNotifications:number;
  constructor(public navCtrl: NavController
  , public dataService: DataService
  , public events: Events
  , public zone: NgZone
  , public popoverCtrl: PopoverController) {



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
            if(!child.val().data.read){
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

  ionViewWillEnter(){
    // this.loading = true;
    // this.events.subscribe('user logged',(data) => {
    //   if(data.condition){
    //     this.authState = true;
    //     this.loading = false;
    //   }
    //   else{
    //     this.authState = false;
    //     this.loading = false;
    //   }
    // })
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
}
