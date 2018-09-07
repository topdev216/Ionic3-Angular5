import { Component,ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, PopoverController, AlertController, ViewController, App, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { PopoverComponent } from '../../components/popover/popover';
import { DataService } from '../../providers/services/dataService';
import { PickGamePage } from '../pick-game/pick-game';

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
  chats:any[] = [];
  roomkey:string;
  username:string;
  offStatus:boolean = false;
  isDirect:boolean;
  chatTitle : string;
  tabBar : any;
  activeChatroom:any;
  friends:any [] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public popoverCtrl:PopoverController, public zone: NgZone,public alertCtrl: AlertController
      , public dataService: DataService
      , public viewCtrl: ViewController
      , public appCtrl: App
      , public toastCtrl: ToastController) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
    this.chatTitle = this.navParams.get('title');
    this.roomkey = this.navParams.get("key") as string;
    this.username = this.navParams.get("username") as string;
    this.isDirect = this.navParams.get("condition") as boolean;
    this.data.type = 'message';
    this.data.username = this.username;
    this.zone=new NgZone({enableLongStackTrace: false});


    firebase.database().ref('chatrooms/'+this.roomkey).once('value').then((snap) =>{
      this.activeChatroom = snap.val();
    })

    this.dataService.getFriendsList().then((snap)=>{
      snap.forEach((friend) =>{
        this.friends.push(friend.val());
        console.log(friend.val());
      })
    })

    if(!this.isDirect){
      firebase.database().ref('chatrooms/'+this.roomkey+'/chats').on('value', snapshot => {
        this.chats = [];
        snapshot.forEach((childSnap)=>{
          let chat = childSnap.val();
          chat.key = childSnap.key;
          this.zone.run(()=>{
            this.chats.push(chat);
          })
          console.log(chat);
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
          this.zone.run(()=>{
            this.chats.push(chat);
          })
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
      if(this.data.message.trim() == ''){
        return 
      }
      else{
        let newData = firebase.database().ref('chatrooms/'+this.roomkey+'/chats').push();
        newData.set({
          type:this.data.type,
          user:this.data.username,
          message:this.data.message,
          sendDate:Date()
        });
        this.data.message = '';
      }
    }
    else{
      if(this.data.message == ''){
        return
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

  private createTrade(){
    let options = {
      title:'Members',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:()=>{
            console.log('cancel clicked');
          }
        },
        {
          text:'Ok',
          handler:data =>{
            console.log(data);
            this.dataService.fetchUserOfferGames(data.key).then((snap)=>{
              let gameArray = [];
              snap.forEach((game)=>{
                gameArray.push(game.val());
              })

              
                this.navCtrl.push(PickGamePage,{games:gameArray,username:data.name,isUser:false,pickedGames:[],chatKey:this.roomkey});
              
            })
          }
        }
      ],
      inputs:[]
    }

    for(let key in this.activeChatroom.participants){
      console.log(this.activeChatroom.participants[key]);
      console.log(this.dataService.username);
      if(this.activeChatroom.participants[key].username !== this.dataService.username){
        options.inputs.push({name:'options',value:{key:key,name:this.activeChatroom.participants[key].username},label:this.activeChatroom.participants[key].username,type:'radio'})
      }
    }

    let alert = this.alertCtrl.create(options);
    alert.present();
  }

  inviteChatroom(){
    let options = {
      title: 'Friends List',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: data => {
            this.dataService.fetchUserKey(data).then((snapshot)=>{
              var key = Object.keys(snapshot.val())[0];
              this.dataService.inviteChatroom(data,key,this.chatTitle,this.roomkey).subscribe( (data) => {
                console.log(data);
              })
            })
            let toast = this.toastCtrl.create({
              message:'Invitation has been sent successfully',
              duration: 3000,
              position:'top',
              cssClass:"toast-success",
              showCloseButton: true,
              closeButtonText: 'Close',
            })
            toast.present();
            console.log(data);
          }
        }
      ],
      inputs:[]
    };


    for(let i = 0; i < this.friends.length ; i++){
      options.inputs.push({name:'options',value:this.friends[i].username,label:this.friends[i].username,type:'radio'})
    }

    let alert = this.alertCtrl.create(options);
    alert.present();

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
