import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import * as firebase from 'firebase/app';

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
  chatTitle : string;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.chatTitle = this.navParams.get('title');
    this.roomkey = this.navParams.get("key") as string;
    this.username = this.navParams.get("username") as string;
    this.data.type = 'message';
    this.data.username = this.username;


    firebase.database().ref('chatrooms/'+this.roomkey+'/chats').on('value', snapshot => {
      this.chats = [];
      snapshot.forEach((childSnap)=>{
        let chat = childSnap.val();
        chat.key = childSnap.key;
        this.chats.push(chat);
      })
      // setTimeout(() => {
      //   if(this.offStatus === false) {
      //     this.content.scrollToBottom(300);
      //   }
      // }, 1000);
    });

  }

  private sendMessage() :void {
    let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
    newData.set({
      type:this.data.type,
      user:this.data.username,
      message:this.data.message,
      sendDate:Date()
    });
    this.data.message = '';
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
  
    this.navCtrl.pop();
  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad MessagingPage');
  }

}
