import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams,PopoverController, Events, AlertController, ToastController, Platform, LoadingController, Loading } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { LoadingPage } from '../../pages/loading/loading';
import { MessagingPage } from '../../pages/messaging/messaging';
import { PopoverComponent } from '../../components/popover/popover';
import * as firebase from 'firebase/app';
import { EN_TAB_PAGES } from '../../providers/backbutton/app.config';
import { BackButtonProvider } from '../../providers/backbutton/backbutton';
import { FriendPopoverComponent } from '../../components/friend-popover/friend-popover';
import { PickGamePage } from '../pick-game/pick-game';
import { ProfilePage } from '../profile/profile';
import { PopoverHeaderComponent } from '../../components/popover-header/popover-header';


/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  private loading:boolean;
  private showError:boolean = false;
  private error: string;
  private user: any;
  private rooms:any [] = [];
  private chatType:string = "chatroom";
  private directChats:any [] = [];
  private username:string;
  private toUsername:any [] = [];
  private friends: any [] = [];
  private loadingSpinner: Loading;



  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public popoverCtrl: PopoverController
  , public events: Events
  , public alertCtrl: AlertController
  , public toastCtrl: ToastController
  , public backbuttonService: BackButtonProvider
  , public platform: Platform
  , public loadingCtrl: LoadingController) {

    this.dataService.fetchUserFromDatabase(this.dataService.uid).then((snapshot)=>{
      console.log('USER BACK:',snapshot.val());
      this.username = snapshot.val().username;

      firebase.database().ref('/chatrooms/').orderByChild('participants/'+this.dataService.uid+'/username').equalTo(this.username).on('value', snapshot => {
        this.rooms = [];

        snapshot.forEach((childSnap)=>{
        let room = childSnap.val();
        room.key = childSnap.key;
        this.rooms.push(room);
        })


      });

      this.directChats = this.dataService.directChats;
      this.friends = this.dataService.friends;

      this.dataService.friendsChange.subscribe((value)=>{
        this.friends = value; 
        console.log('friend service:',this.friends); 
      });
      this.dataService.directChatChanges.subscribe((values)=>{
        this.directChats = values;
        values.forEach((item) => {
          console.log('username:',item.username);
          console.log('unread:',item.unread);
          this.friends.forEach((friend)=>{
            if(friend.friend.username === item.username){
              friend.unread = item.unread;
            }
          });
        });
      });

    })
    .catch((err) => {
      this.dataService.logError(err);
    })

    this.events.subscribe('room leave', (data)=>{

      this.dataService.leavePublicRoom(data).then(()=>{
        this.dataService.checkEmptyRoom(data).then((snapshot)=>{
          if(!snapshot.hasChild("participants")){
            console.log('EMPTY ROOM');
            this.dataService.deleteEmptyRoom(data).then(()=>{
              console.log('empty room deleted!');
            })
            .catch((err) => {
              this.dataService.logError(err);
            })
          }
          else{
            console.log('not empty room');
          }
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
        console.log('user left!');
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    })

    

  }

  showPopover(myEvent:any,friendUid:string,friend:any){
    
    let popover = this.popoverCtrl.create(FriendPopoverComponent,{friend:friendUid,user:friend,list:'friends'});
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  ionViewWillLeave(){
    this.dataService.previousTab = 'ChatPage';
    this.events.unsubscribe('create trade');
    this.events.unsubscribe('view profile');
    this.events.unsubscribe('send message');
    this.events.unsubscribe('search input');
    this.events.unsubscribe('search finish');
  }

  ionViewWillEnter(){

    this.dataService.activeTab = 'ChatPage';
    console.log(this.dataService.activeTab);

    this.loading = true;
    this.showError = false;
    this.dataService.fetchUserFromDatabase(this.dataService.uid).then((user)=>{
      if(user.val().username == null){
        console.log('cannot chat');
        this.loading = false;
        this.showError = false;
      }
      else{
        console.log('can chat');
        this.toUsername = [];
        this.user = user.val();
        this.dataService.username = user.val().username;
        this.dataService.getUserPublicRooms().then(()=>{
          this.dataService.getUserDirectChats().then((snap)=>{
            console.log(snap.val())
            snap.forEach((childSnap) =>{
              let uid = this.dataService.uid;
              console.log(childSnap.val().participants[uid].username);
              console.log(childSnap.child('participants').val());

              childSnap.child('participants').forEach((res)=>{
                if(this.username != res.val().username){
                  let user = {
                    username:res.val().username,
                    key:childSnap.key
                  }
                  this.toUsername.push(user);
                }
              })
                         
             
            })
            this.loading = false;
          })
          .catch((err) => {
            this.dataService.logError(err);
          })
        })
        .catch((err) => {
          this.dataService.logError(err);
        })
        this.showError = false;
      }
    })
    .catch((err)=>{
      this.dataService.logError(err);  
      this.loading = false;
      this.dataService.errorDismissed(false);
      this.showError = true;
      console.log('something ocurred...');
      this.error= err.message;

    })

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
          this.dataService.getOfferingConsoles(data.friendUid).then((snap2)=>{
            this.dataService.getOfferingAccessories(data.friendUid).then((snap3) =>{

            let games = [];
            let consoles = [];
            let accessories = [];
            snap.forEach((game)=>{
              games.push(game.val());
            });
            snap2.forEach((item)=> {
              consoles.push(item.val());
            })
            snap3.forEach((item)=>{
              accessories.push(item.val());
            })

            if(games.length < 1 && consoles.length < 1 && accessories.length < 1){
              //you don't have any items added
              let alert = this.alertCtrl.create({
                title:'Error',
                message:"You don't have any items added yet!",
              });

              alert.present();

              setTimeout(()=>{
                alert.dismiss();
              },2000);
              return;
            }
            this.dataService.fetchUserFromDatabase(data.friendUid).then((res)=>{
              this.dataService.createDirectChat(data.user.username,data.friendUid).then((chatKey)=>{
                loader.dismiss();
                this.navCtrl.push(PickGamePage,{games:games,consoles:consoles,accessories:accessories,username:res.val().username,isUser:false,pickedGames:[],chatKey:chatKey.key,isDirect:true});
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
      this.loadingSpinner = this.loadingCtrl.create({
        content:'Please wait...',
        spinner:'crescent'
      });
      this.loadingSpinner.present();
    });

    this.events.subscribe('search finish',(data)=>{
      this.loadingSpinner.dismiss();
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

  private showPopoverHeader(myEvent):void{
    this.dataService.showPopover(PopoverHeaderComponent,myEvent);
  }

  private enterChat(chat:any,isDirect:boolean) :void{
    if(chat.type == "public"){
      this.dataService.joinPublicRoom(chat.key,this.user.username,isDirect).then(()=>{
        this.navCtrl.push(MessagingPage,{title:chat.name,key:chat.key,username:this.user.username,condition:isDirect});
      })
      .catch((err) => {
        this.dataService.logError(err);
      })
    }
    else if(chat.type == "private"){
      let alert = this.alertCtrl.create({
        title: 'Join Private Chatroom',
        inputs: [
          {
            name: 'password',
            placeholder: 'Password',
            type:'password'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Join',
            handler: data => {

              
                
                this.dataService.joinPrivateRoom(chat.key,this.user.username,data.password)
                .then((data)=>{
                  if(data == undefined){
                  this.navCtrl.push(MessagingPage,{title:chat.name,key:chat.key,username:this.user.username,condition:isDirect});
                   alert.dismiss();
                  }
                  else{
                    alert.dismiss();
                  }
                })
                .catch((err) => {
                  this.dataService.logError(err);
                })
                return false;
            }
          }
        ]
      })
  
      alert.present();

    }
    else{
      this.dataService.fetchUserKey(chat.username).then((snapshot)=>{
        var key = Object.keys(snapshot.val())[0];
      this.dataService.createDirectChat(chat.username,key).then((chatKey)=>{
        this.navCtrl.push(MessagingPage,{title:chat.username,key:chatKey.key,username:this.dataService.username,condition:true,receiverKey:key});
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

  private presentPopover(myEvent,chatKey:string): void {
    let popover = this.popoverCtrl.create(PopoverComponent, {chatKey: chatKey});
    let doDismiss = () => popover.dismiss();
    let unregBackButton = this.platform.registerBackButtonAction(doDismiss, 5);
    popover.onDidDismiss(()=>unregBackButton);
    popover.present({
      ev: myEvent
    });
  }

}
