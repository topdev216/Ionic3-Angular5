import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { LoadingPage } from '../../pages/loading/loading';
import { MessagingPage } from '../../pages/messaging/messaging';

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



  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService) {

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
        this.user = user.val();
        this.dataService.username = user.val().username;
        this.dataService.getUserPublicRooms().then((snapshot)=>{
          
          snapshot.forEach((childSnapshot) =>{
            console.log('rooms:',childSnapshot.val());
            this.rooms.push(childSnapshot.val());
          })
          this.loading = false;

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

  ionViewWillLeave(){
    this.rooms = [];
  }

  private enterChat(chatTitle:string) :void{
    this.navCtrl.push(MessagingPage,{title:chatTitle});
  }

}
