import { Component } from '@angular/core';
import { ViewController, Events, NavParams, AlertController, ToastController, ModalController, NavController, App } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { PickGamePage } from '../../pages/pick-game/pick-game';
/**
 * Generated class for the PopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})
export class PopoverComponent {

  text: string;
  chatKey:string;
  userID:string;
  username:string;
  message:boolean = false;
  chatroom:boolean=false;
  friends:any [] = [];
  chatrooms:any [] = [];
  activeRoom:any;
  chatroomName:string;
  gameArray:any [] = [];

  constructor(public viewCtrl: ViewController
    , public dataService: DataService
    , public events: Events
    , public navParams: NavParams
    , public alertCtrl: AlertController
    , public toastCtrl: ToastController
    , public modalCtrl: ModalController
    , public navCtrl: NavController
    , public appCtrl: App) {

      this.chatKey = this.navParams.get('chatKey');
      this.userID = this.navParams.get('userId');
      this.username = this.navParams.get('username');
      this.message = this.navParams.get('message');
      this.chatroom = this.navParams.get('chatroom');
      this.chatroomName = this.navParams.get('chatroomName');
      console.log('Hello PopoverComponent Component');

      this.dataService.getFriendsList().then((snap)=>{
        snap.forEach((friend) =>{
          this.friends.push(friend.val());
          console.log(friend.val());
        })
      })

      this.dataService.getUserPublicRooms().then((snap) =>{
        snap.forEach((room) =>{
          this.chatrooms.push({room:room.val(),key:room.key});
        })
      })

      this.dataService.fetchRoom(this.chatKey).then((snap)=>{
        this.activeRoom = snap.val();
      })
    
  }

  leaveChatroom(): void {
    this.events.publish('room leave',this.chatKey);
    this.close();
  }

  textUser():void{
    this.events.publish('user text',this.username);
    // this.close();
  }

  createTrade():void{
    this.close();
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
              snap.forEach((game)=>{
                this.gameArray.push(game.val());
              })

              this.viewCtrl.dismiss().then(() => {
                this.appCtrl.getRootNav().push(PickGamePage,{games:this.gameArray,username:data.name,isUser:false,pickedGames:[],chatKey:this.chatKey});
              });
              // this.navCtrl.push(PickGamePage,{games:this.gameArray,username:data.name,isUser:false});

            })
          }
        }
      ],
      inputs:[]
    }

    for(let key in this.activeRoom.participants){
      console.log(this.activeRoom.participants[key]);
      console.log(this.dataService.username);
      if(this.activeRoom.participants[key].username !== this.dataService.username){
        options.inputs.push({name:'options',value:{key:key,name:this.activeRoom.participants[key].username},label:this.activeRoom.participants[key].username,type:'radio'})
      }
    }

    let alert = this.alertCtrl.create(options);
    alert.present();
    }

  inviteChatroom():void{
    // this.events.publish('invite room',this.username);
    this.close();
    let options = {
      title:'Chatrooms List',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler: () =>{
            console.log('Cancel clicked');
          }
        },
        {
          text:'Ok',
          handler: data =>{
            console.log(data);
            this.dataService.fetchUserKey(this.username).then((snapshot)=>{
              var key = Object.keys(snapshot.val())[0];
              this.dataService.inviteChatroom(this.username,key,data.name,data.key).subscribe((res)=>{
                console.log(res);
                let toast = this.toastCtrl.create({
                  message:'Invitation has been sent successfully',
                  duration: 3000,
                  position:'top',
                  cssClass:"toast-success",
                  showCloseButton: true,
                  closeButtonText: 'Close',
                })
                toast.present();
              })
            })
          }
          
        }
      ],
      inputs:[]
    }

    for(let i = 0; i < this.chatrooms.length ; i++){
      options.inputs.push({name:'options',value:{key:this.chatrooms[i].key,name:this.chatrooms[i].room.name},label:this.chatrooms[i].room.name,type:'radio'})
    }

    let alert = this.alertCtrl.create(options);
    alert.present();



  }

  inviteFriend():void{
    this.close();
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
              this.dataService.inviteChatroom(data,key,this.chatroomName,this.chatKey).subscribe( (data) => {
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

  close() {
    this.viewCtrl.dismiss();
  }

}
