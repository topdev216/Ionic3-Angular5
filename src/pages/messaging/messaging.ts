import { Component,ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, PopoverController, AlertController, ViewController, App, ToastController, LoadingController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { PopoverComponent } from '../../components/popover/popover';
import { DataService } from '../../providers/services/dataService';
import { PickGamePage } from '../pick-game/pick-game';
import { NativeKeyboard, NativeKeyboardOptions } from '@ionic-native/native-keyboard';
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
  receiverKey:string;
  tabBar : any;
  activeChatroom:any;
  friends:any [] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public popoverCtrl:PopoverController, public zone: NgZone,public alertCtrl: AlertController
      , public dataService: DataService
      , public viewCtrl: ViewController
      , public appCtrl: App
      , public toastCtrl: ToastController
      , public loadingCtrl: LoadingController
      , public nativeKeyboard: NativeKeyboard) {
    this.tabBar = document.querySelector('.tabbar.show-tabbar');
    this.chatTitle = this.navParams.get('title');
    this.roomkey = this.navParams.get("key") as string;
    this.username = this.navParams.get("username") as string;
    this.isDirect = this.navParams.get("condition") as boolean;
    this.receiverKey = this.navParams.get("receiverKey") as string;
    this.data.type = 'message';
    this.data.username = this.username;
    this.zone=new NgZone({enableLongStackTrace: false});
      
    

    if(!this.isDirect){
    firebase.database().ref('chatrooms/'+this.roomkey).on('value', (snap) =>{
      this.activeChatroom = snap.val();
    });
    }
    else{
      this.dataService.updateChatOnDisconnect(this.roomkey);
      firebase.database().ref('directChats/'+this.roomkey).on('value', (snap) =>{
        this.activeChatroom = snap.val();
      });
    }

    this.dataService.liveFriendsList().on('value',(snap)=>{
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
              this.zone.run(()=>{
                this.content.scrollToBottom(300); 
              })
              }       
            }
        }, 1000);

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
                this.zone.run(()=>{
                  this.content.scrollToBottom(300); 
                })
              }       
            }
        }, 1000);

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
      if(this.data.message.trim() == ''){
        return
      }
      else{

        this.dataService.checkIfUserInsideChat(this.roomkey,this.receiverKey).then((condition)=>{
          if(condition){
            let newData = firebase.database().ref('directChats/'+this.roomkey+'/chats').push();
            newData.set({
              type:this.data.type,
              user:this.data.username,
              message:this.data.message,
              sendDate:Date(),
              read:true
            });
            this.data.message = '';
          }
          else{
            let newData = firebase.database().ref('directChats/'+this.roomkey+'/chats').push();
            
            let message = this.data.message;
            newData.set({
              type:this.data.type,
              user:this.data.username,
              message:this.data.message,
              sendDate:Date(),
              read:false
            });

            this.data.message = '';
            
            this.dataService.notifyNewDirectMessage(this.roomkey,message).subscribe((data)=>{
              console.log(data);
            },(err) =>{
              console.log(err);
            })
          }
        })

       
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
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    });
    loader.present();
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

              
                this.navCtrl.push(PickGamePage,{games:gameArray,username:data.name,isUser:false,pickedGames:[],chatKey:this.roomkey,isDirect:this.isDirect});
              
            })
          }
        }
      ],
      inputs:[]
    }

    this.fillRadioInputs(options,loader);
  }

  fillRadioInputs(options:any,loader:any){
    
    return this.dataService.fetchChatroomParticipants(this.roomkey,this.isDirect).then((snap)=>{
      let reads = [];
      snap.forEach((participant)=>{
        let promise = this.dataService.checkIfBlocked(participant.key).then((res)=>{
          if(participant.val().username !== this.dataService.username && !(res.exist)){
            console.log('participant key:',participant.key);
            console.log('participant username:',participant.val().username);
            return participant;
          }
          else{
            return null;
          }
        },err =>{
          console.log('promise rejected');
          return err;
        });
        reads.push(promise);
      });
      return Promise.all(reads).then((values)=>{
        console.log(values);
        values.map((participant)=>{
          if(participant !== null && participant.key !== undefined){
            console.log('returned values:',participant.val());
            options.inputs.push({name:'options',value:{key:participant.key,name:participant.val().username},label:participant.val().username,type:'radio'})
          } 
        })
        let alert = this.alertCtrl.create(options);
        loader.dismiss();
        alert.present();
      });
    
    });
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

  onSubmit(){

  }

  ionViewWillEnter(){
    this.tabBar.style.display = 'none';
    if(this.isDirect){
      this.dataService.markUserInsideChat(this.roomkey);
      this.dataService.markReadDirectMessages(this.roomkey);
    }
    // this.offStatus = false;
  }

  ionViewWillLeave(){
    this.tabBar.style.display = 'flex';
    if(this.isDirect){
      this.dataService.markUserOutsideChat(this.roomkey);
    }
    // this.offStatus = true;
  }


}
