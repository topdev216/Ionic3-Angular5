import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { LoginPage } from '../../pages/login/login';
import { ProfilePage } from '../../pages/profile/profile';
import { ChatPage } from '../../pages/chat/chat';
import { DiscoverPage } from '../discover/discover';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = '';
  tab3Root = ChatPage;
  tab4Root = DiscoverPage;
  tab5Root = ProfilePage;
  public enabled:boolean = false;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events) {
    this.events.subscribe('user logged',(data) => {
      this.enabled = data.condition;
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
