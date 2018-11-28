import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, PopoverController, Events, ToastController, Loading } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { FriendPopoverComponent } from '../../components/friend-popover/friend-popover';
import { PickGamePage } from '../pick-game/pick-game';
import { ProfilePage } from '../profile/profile';
import { MessagingPage } from '../messaging/messaging';
import { FormControl } from '@angular/forms';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';

/**
 * Generated class for the FriendListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-friend-list',
  templateUrl: 'friend-list.html',
})
export class FriendListPage {

  friends:any [] = [];
  blocked:any [] = [];
  type:string = "friends";
  searchTerm:string="";
  searchControl: FormControl;
  searching:boolean = false;
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService, public loadingCtrl: LoadingController
    , public zone: NgZone
    , public popoverCtrl: PopoverController
    , public events: Events
    , public toastCtrl: ToastController) {

    this.searchControl = new FormControl();
    this.friends = this.dataService.friends;
    this.blocked = this.dataService.blocked;
    this.dataService.friendsChange.subscribe((value)=>{
      this.friends = value;
      console.log('friend list service:',this.friends);

    });
    this.dataService.blockedChange.subscribe((value)=>{
      this.blocked = value;
    })




  }

  private showPopoverHeader(myEvent):void{
    this.dataService.showPopover(PopoverHeaderComponent,myEvent);
  }
  
  ngOnInit(){
    this.searchControl = new FormControl();
    this.dataService.friendsChange.subscribe((value)=>{
      this.friends = value;
    });
    // this.friends = this.dataService.friends;
    // this.blocked = this.dataService.blocked;
  }
  

  ionViewWillEnter(){

    this.events.subscribe('create trade', (data) =>{
      let loader = this.loadingCtrl.create({
        content:'Please wait...',
        spinner:'crescent'
      });
      loader.present();
      this.dataService.checkIfBlocked(data.friendUid).then((res)=>{
        console.log('BLOCKED:',res.exist);
      if(!res.exist){
        this.dataService.fetchUserOfferGames(data.friendUid).then((snap)=>{
          let games = [];
          snap.forEach((game)=>{
            games.push(game.val());
          });
          this.dataService.fetchUserFromDatabase(data.friendUid).then((res)=>{
            this.dataService.createDirectChat(data.user.username,data.friendUid).then((chatKey)=>{
              loader.dismiss();
              this.navCtrl.push(PickGamePage,{games:games,username:res.val().username,isUser:false,pickedGames:[],chatKey:chatKey.key,isDirect:true});
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
      else{
        let toast = this.toastCtrl.create({
          message:'User is not available for trading right now, please try again later',
          duration:3000
        });
        loader.dismiss();
        toast.present();
      }

      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    });

    this.events.subscribe('search input', (data)=>{
      this.loading = this.loadingCtrl.create({
        content:'Please wait...',
        spinner:'crescent'
      });
      this.loading.present();
    });

    this.events.subscribe('search finish',(data)=>{
      this.loading.dismiss();
    });

    this.events.subscribe('view profile',(data)=>{
      this.navCtrl.push(ProfilePage,{
        search:true,
        user:{
          userKey:data.friendUid
        }
      });
    });

    this.events.subscribe('send message',(data)=>{
      this.dataService.createDirectChat(data.user.username,data.friendUid).then((chatKey)=>{
        console.log('returned chatkey:',chatKey);
        if(chatKey.error){
          let toast = this.toastCtrl.create({
            message:"It's not possible to message this user right now, please try again later",
            duration:3000
          });
          toast.present();
        }
        else{
        this.navCtrl.push(MessagingPage,{title:data.user.username,key:chatKey.key,username:this.dataService.username,condition:true,receiverKey:data.friendUid});
        }
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    });
  }

  ionViewWillLeave(){
    this.events.unsubscribe('create trade');
    this.events.unsubscribe('view profile');
    this.events.unsubscribe('send message');
    this.events.unsubscribe('search input');
    this.events.unsubscribe('search finish');
  }

  setFilteredItems() {
    this.friends = [];
    this.dataService.getFriendsList().then((snap)=>{
      let reads = [];
      snap.forEach((friend) =>{
       let promise = this.dataService.fetchUserKey(friend.val().username).then((user) =>{
          var key = Object.keys(user.val())[0];
          let obj = {
            friend:user.val()[key],
            key:key,
            online:user.val()[key].online
          };
          return obj
          // this.friends.push(obj);
        },err=>{
          this.dataService.logError(err);
        });
        reads.push(promise);
      });

      Promise.all(reads).then((values)=>{
        console.log('returned values:',values);
        values.map((friend) =>{
          this.friends.push(friend);
        })
        this.friends = this.filterItems(this.searchTerm);
      })
      .catch((err) => {
        this.dataService.logError(err);
      })

    })
    .catch((err) => {
      this.dataService.logError(err);
    })

  }

  filterItems(searchTerm){
    
    return this.friends.filter((item) => {
        return item.friend.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });    

  } 


  onSearchInput(){
    this.events.publish('search input');
  }


  showPopover(myEvent:any,friendUid:string,friend:any){
    
    let popover = this.popoverCtrl.create(FriendPopoverComponent,{friend:friendUid,user:friend,list:this.type});
    popover.present({
      ev: myEvent
    });
  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendListPage');
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
        this.events.publish('search finish');
        this.setFilteredItems();
    });


  }

}
