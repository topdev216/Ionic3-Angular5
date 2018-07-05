import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, PopoverController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { PopoverComponent } from '../../components/popover/popover';

/**
 * Generated class for the MessagingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-messaging',
  templateUrl: 'messaging.html',
})
export class MessagingPage {

  @ViewChild(Content) content: Content;

  data = { type:'', username:'', message:'' };
  chats = [];
  roomkey:string;
  username:string;
  offStatus:boolean = false;
  isDirect:boolean;
  chatTitle : string;
  tabBar : any;
  constructor(public navCtrl: NavController, public navParams: NavParams,public popoverCtrl:PopoverController) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
    this.chatTitle = this.navParams.get('title');
    this.roomkey = this.navParams.get("key") as string;
    this.username = this.navParams.get("username") as string;
    this.isDirect = this.navParams.get("condition") as boolean;
    this.data.type = 'message';
    this.data.username = this.username;


    if(!this.isDirect){
      firebase.database().ref('chatrooms/'+this.roomkey+'/chats').on('value', snapshot => {
        this.chats = [];
        snapshot.forEach((childSnap)=>{
          let chat = childSnap.val();
          chat.key = childSnap.key;
          this.chats.push(chat);
        })
        
        setTimeout(() => {
            if(this.offStatus === false){
              if(this.content._scroll){
              this.content.scrollToBottom(300); 
              }       
            }
        }, 100);

      });
    }
    else{

      firebase.database().ref('directChats/'+this.roomkey+'/chats').on('value', snapshot => {
        this.chats = [];
        snapshot.forEach((childSnap)=>{
          let chat = childSnap.val();
          chat.key = childSnap.key;
          this.chats.push(chat);
        })
        
        setTimeout(() => {
            if(this.offStatus === false){
              if(this.content._scroll){
              this.content.scrollToBottom(300); 
              }       
            }
        }, 100);

      });
    }



    

  }

  private sendMessage() :void {

    if(!this.isDirect){
      let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
      newData.set({
        type:this.data.type,
        user:this.data.username,
        message:this.data.message,
        sendDate:Date()
      });
      this.data.message = '';
    }
    else{
      let newData = firebase.database().ref('directChats/'+this.roomkey+'/chats').push();
      newData.set({
        type:this.data.type,
        user:this.data.username,
        message:this.data.message,
        sendDate:Date()
      });
      this.data.message = '';
    }
  }

  private exitChat() :void {
    let exitData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    exitData.set({
      type:'exit',
      user:this.username,
      message:this.username+' has exited this room.',
      sendDate:Date()
    });
  
    this.offStatus = true;

    this.navCtrl.popToRoot();
  }

  private presentPopover(myEvent): void {
    let popover;
    if(this.isDirect){
      popover = this.popoverCtrl.create(PopoverComponent, {message: true});
    }
    else{
      popover = this.popoverCtrl.create(PopoverComponent, {message: true,chatroom:true,chatroomName:this.chatTitle,chatKey:this.roomkey});
    }
    popover.present({
      ev: myEvent
    });
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad MessagingPage');
  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';

  }


}
