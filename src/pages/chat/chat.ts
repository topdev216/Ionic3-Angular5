import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataService } from '../../providers/services/dataService';
import { LoadingPage } from '../../pages/loading/loading';

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


  constructor(public navCtrl: NavController, public navParams: NavParams
  , public dataService: DataService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  ionViewWillEnter(){
    this.loading = true;
    this.dataService.fetchUserFromDatabase(this.dataService.uid).then((user)=>{
      if(user.val().username == null){
        console.log('cannot chat');
        this.loading = false;
      }
      else{
        console.log('can chat');
        this.loading = false;
      }
    })
    .catch((err)=>{
      this.loading = false;
      this.dataService.errorDismissed(false);
      this.showError = true;
      this.error= err.message;

    })
  }

}
