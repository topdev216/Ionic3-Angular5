import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams,PopoverController, Events, AlertController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { LoadingPage } from '../../pages/loading/loading';
import { MessagingPage } from '../../pages/messaging/messaging';
import { PopoverComponent } from '../../components/popover/popover';
import * as firebase from 'firebase/app';
import { INTERNAL_BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser/src/browser';


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
  private directChats:any [] = [];
  private username:string;
  private toUsername:any [] = [];



  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService
  , public popoverCtrl: PopoverController
  , public events: Events
  , public alertCtrl: AlertController
  , public toastCtrl: ToastController) {

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

      firebase.database().ref('/directChats/').orderByChild('participants/'+this.dataService.uid+'/username').equalTo(this.username).on('value', snapshot =>{
        this.directChats = [];
        snapshot.forEach((childSnap)=>{
          console.log('direct',childSnap.val());
          let direct = childSnap.val();
          direct.key = childSnap.key;
          this.directChats.push(direct);
        })
      })



    })

    this.events.subscribe('room leave', (data)=>{

      this.dataService.leavePublicRoom(data).then(()=>{
        this.dataService.checkEmptyRoom(data).then((snapshot)=>{
          if(!snapshot.hasChild("participants")){
            console.log('EMPTY ROOM');
            this.dataService.deleteEmptyRoom(data).then(()=>{
              console.log('empty room deleted!');
            })
          }
          else{
            console.log('not empty room');
          }
        })
        console.log('user left!');
      })
    })

    

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  ionViewWillEnter(){

    

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
        })
        this.showError = false;
      }
    })
    .catch((err)=>{
      this.loading = false;
      this.dataService.errorDismissed(false);
      this.showError = true;
      console.log('something ocurred...');
      this.error= err.message;

    })
  }

  private enterChat(chat:any,isDirect:boolean) :void{
    if(chat.type == "public"){
      this.dataService.joinPublicRoom(chat.key,this.user.username,isDirect).then(()=>{
        this.navCtrl.push(MessagingPage,{title:chat.name,key:chat.key,username:this.user.username,condition:isDirect});
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
                return false;
            }
          }
        ]
      })
  
      alert.present();

    }
    else{
      this.dataService.createDirectChat(chat.username,chat.key).then(()=>{
        this.navCtrl.push(MessagingPage,{title:chat.username,key:chat.key,username:this.user.username,condition:isDirect});
      })
    }
  }

  private presentPopover(myEvent,chatKey:string): void {
    let popover = this.popoverCtrl.create(PopoverComponent, {chatKey: chatKey});
    popover.present({
      ev: myEvent
    });
  }

}