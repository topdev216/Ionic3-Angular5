import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, PopoverController, Events, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { FriendPopoverComponent } from '../../components/friend-popover/friend-popover';
import { PickGamePage } from '../pick-game/pick-game';
import { ProfilePage } from '../profile/profile';
import { MessagingPage } from '../messaging/messaging';
import { FormControl } from '@angular/forms';

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

  constructor(public navCtrl: NavController, public navParams: NavParams,public dataService: DataService, public loadingCtrl: LoadingController
    , public zone: NgZone
    , public popoverCtrl: PopoverController
    , public events: Events
    , public toastCtrl: ToastController) {

      this.searchControl = new FormControl();


    // this.dataService.getFriendsList().then((snap) =>{
    //   this.friends = [];
    //   let count = 0;
    //   snap.forEach((friend)=>{
    //     this.dataService.fetchUserKey(friend.val().username).then((user) =>{
    //       var key = Object.keys(user.val())[0];
    //       console.log('saved key:',key);
    //       let obj = {
    //         friend:user.val()[key],
    //         key:key,
    //         online:user.val()[key].online
    //       };
    //       this.friends.push(obj);
    //       this.onlineFriendListener(key,count);
    //       count++;
    //     })
    //   });

    //   loader.dismiss();
    // });

    this.friendListener();
    this.blockedListener();

  }
  
  ngOnInit(){
    this.searchControl = new FormControl();
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
          });
        });
      }
      else{
        let toast = this.toastCtrl.create({
          message:'User is not available for trading right now, please try again later',
          duration:3000
        });
        loader.dismiss();
        toast.present();
      }

      });
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
        this.navCtrl.push(MessagingPage,{title:data.user.username,key:chatKey.key,username:this.dataService.username,condition:true});
        }
      })
    });
  }

  ionViewWillLeave(){
    this.events.unsubscribe('create trade');
    this.events.unsubscribe('view profile');
    this.events.unsubscribe('send message');
  }

  blockedListener(){
    this.dataService.liveBlockedList().on('value',(snap)=>{
      this.blocked = [];
      let count = 0;
      snap.forEach((friend) => {
        this.dataService.fetchUserKey(friend.val().username).then((user) =>{
          var key = Object.keys(user.val())[0];
          let obj = {
            friend:user.val()[key],
            key:key,
            online:user.val()[key].online
          };
          this.blocked.push(obj);
          this.onlineFriendListener(key,count);
          count++;
        });
      })
    })
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
          return err;
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

    })

  }

  filterItems(searchTerm){
    
    return this.friends.filter((item) => {
        return item.friend.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });    

  } 


  friendListener(){

    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();

    this.dataService.liveFriendsList().on('value',(snap)=>{
      this.friends = [];
      let count = 0;
      snap.forEach((friend)=>{
        this.dataService.fetchUserKey(friend.val().username).then((user) =>{
          var key = Object.keys(user.val())[0];
          let obj = {
            friend:user.val()[key],
            key:key,
            online:user.val()[key].online
          };
          this.friends.push(obj);
          this.onlineFriendListener(key,count);
          count++;
        });
      })
      loader.dismiss();
    })
  }

  onlineFriendListener(uid:string,position:number){
      this.dataService.getOnlineStatus(uid).on('value',(data) =>{
        this.zone.run(()=>{
          console.log('online status uid:',uid);
          console.log('online:',data.val())
          if(this.friends[position] !== undefined){
            this.friends[position].online = data.val();
          }
        })
      });

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
        this.setFilteredItems();

    });
  }

}
