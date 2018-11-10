import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Tab, App, Tabs } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';
import { LoginPage } from '../../pages/login/login';
import { ProfilePage } from '../../pages/profile/profile';
import { ChatPage } from '../../pages/chat/chat';
import { DiscoverPage } from '../discover/discover';
import { TradeHistoryPage } from '../trade-history/trade-history';
import { DataService } from '../../providers/services/dataService';
import { GamelistPage } from '../gamelist/gamelist';

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
  tab2Root = GamelistPage;
  tab3Root = ChatPage;
  tab4Root = DiscoverPage;
  tab5Root = ProfilePage;
  public enabled:boolean = false;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public events: Events, public dataService: DataService
    , public app: App) {

    this.events.subscribe('user logged',(data) => {
      this.enabled = data.condition;
    })


  }

  // changeTab(event:any){
  //   console.log('tab changed:',event);
  //   if(event.tabTitle === 'My List'){
  //     console.log('tab changed to list');
  //     this.tab2Params = {userKey:this.dataService.uid,condition:false};
  //   }
  // }

  list(){
    console.log('list selected');
    console.log('list UID:',this.dataService.uid);
    const tabsNav = this.app.getNavByIdOrName('myTabs') as Tabs;

    console.log('list tab:',tabsNav.getByIndex(1));
    tabsNav.getByIndex(1).rootParams = {userKey:this.dataService.uid,condition:false};
    // this.listTab.rootParams = {userKey:this.dataService.uid,condition:false};
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
