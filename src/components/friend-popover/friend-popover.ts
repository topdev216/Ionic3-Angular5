import { Component } from '@angular/core';
import { DataService } from '../../providers/services/dataService';
import { LoadingController, Events, NavParams, ViewController, AlertController } from 'ionic-angular';

/**
 * Generated class for the FriendPopoverComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'friend-popover',
  templateUrl: 'friend-popover.html'
})
export class FriendPopoverComponent {

  text: string;
  friendUid:string;
  user:any;
  type:string;

  constructor(public events: Events, public navParams: NavParams,public viewCtrl: ViewController,public dataService: DataService
    , public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
    console.log('Hello FriendPopoverComponent Component');  
    this.text = 'Hello World';
    this.friendUid = this.navParams.get('friend');
    this.user = this.navParams.get('user');
    this.type = this.navParams.get('list');
  }

  startTrade(){
    this.events.publish('create trade',{user:this.user,friendUid:this.friendUid});
    this.viewCtrl.dismiss();
  }

  viewProfile(){
    this.events.publish('view profile',{user:this.user,friendUid:this.friendUid});
    this.viewCtrl.dismiss();
  }

  sendMessage(){
    this.events.publish('send message',{friendUid:this.friendUid,user:this.user});
    this.viewCtrl.dismiss();
  }

  blockUser(){
    let alert = this.alertCtrl.create({
      title:'Confirm',
      message:'Do you want to block this user?',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:() =>{
            
          }
        },
        {
          text:'Accept',
          handler:()=>{
            let loader = this.loadingCtrl.create({
              content:'Please wait...',
              spinner:'crescent'
            })
            loader.present();
            let obj ={
              userKey:this.friendUid
            };
            this.dataService.removeFriend(obj).then(()=>{
              this.dataService.blockUser(this.friendUid,this.user.username).then(()=>{
                this.dataService.fetchUserFromDatabase(this.dataService.uid).then((snap)=>{
                  this.dataService.user = snap.val();
                  console.log('User has been blocked.');
                  loader.dismiss();
                })
                
              });
            });
            
          }
        }
      ]
    })

    this.viewCtrl.dismiss();
    alert.present();
  }

  unblockUser(){
    let alert = this.alertCtrl.create({
      title:'Confirm',
      message:'Do you want to unblock this user?',
      buttons:[
        {
          text:'Cancel',
          role:'cancel',
          handler:() =>{
            
          }
        },
        {
          text:'Accept',
          handler:()=>{
            let loader = this.loadingCtrl.create({
              content:'Please wait...',
              spinner:'crescent'
            })
            loader.present();
            let obj ={
              userKey:this.friendUid,
              username:this.user.username
            };
            this.dataService.addFriend(obj).then(()=>{
              this.dataService.unblockUser(this.friendUid,this.user.username).then(()=>{
                this.dataService.fetchUserFromDatabase(this.dataService.uid).then((snap)=>{
                  this.dataService.user = snap.val();
                  console.log('User has been unblocked.');
                  loader.dismiss();
                });
              });
            });
            
          }
        }
      ]
    })

    this.viewCtrl.dismiss();
    alert.present();
  }

  deleteFriend(){
    this.viewCtrl.dismiss();
    let loader = this.loadingCtrl.create({
      content:'Please wait...',
      spinner:'crescent'
    })
    loader.present();
    
    let obj = {
      userKey: this.friendUid
    }

    
    this.dataService.removeFriend(obj).then(()=>{
      loader.dismiss();
    })
    .catch((err)=>{
      loader.dismiss();
    });
  }

}
