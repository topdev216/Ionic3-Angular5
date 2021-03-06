import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, ComponentRef } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, Tabs } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { DataService } from '../providers/services/dataService';
import { TabsPage } from '../pages/tabs/tabs';
import { SignupPage } from '../pages/signup/signup';
import { ProfilePage } from '../pages/profile/profile';
import { AddVideogamePage } from '../pages/add-videogame/add-videogame';
import { AddressModalPage } from '../pages/address-modal/address-modal';
import { UrlEnvironment } from '../providers/services/urlEnvironment';
import { SelectSearchableModule } from 'ionic-select-searchable';
import { AddUsernamePage } from '../pages/add-username/add-username';
import { LoadingPage } from '../pages/loading/loading';
import { UsernameValidator } from '../validators/username';
import { ChatPage } from '../pages/chat/chat';
import { ErrorCardComponent } from '../components/error-card/error-card';
import { MenuComponent } from '../components/menu/menu';
import { MessagingPage } from '../pages/messaging/messaging';
import { PopoverComponent } from '../components/popover/popover';
import { DiscoverPage } from '../pages/discover/discover';
import { GamelistPage } from '../pages/gamelist/gamelist';
import { PaymentModalPage } from '../pages/payment-modal/payment-modal';
import { CreditFormPage } from '../pages/credit-form/credit-form';
import { ConfirmPaymentPage } from '../pages/confirm-payment/confirm-payment';
import { FCM } from '@ionic-native/fcm';
import { PickGamePage } from '../pages/pick-game/pick-game';
import { ConfirmTradePage } from '../pages/confirm-trade/confirm-trade';
import { TradeCardComponent } from '../components/trade-card/trade-card';
import { PopoverHeaderComponent } from '../components/popover-header/popover-header';
import { ActionPopoverComponent } from '../components/action-popover/action-popover';
import { NotificationPage } from '../pages/notification/notification';
import { AccordionComponent } from '../components/accordion/accordion';
import {TimeAgoPipe} from 'time-ago-pipe';
import { PlatformSelectionPage } from '../pages/platform-selection/platform-selection';
import { NotificationPopoverComponent } from '../components/notification-popover/notification-popover';
import { TradeDetailsPage } from '../pages/trade-details/trade-details';
import { GooglePlus } from '@ionic-native/google-plus';
import { TradeHistoryPage } from '../pages/trade-history/trade-history';
import { ShippingAddressFormPage } from '../pages/shipping-address-form/shipping-address-form';
import { FriendListPage } from '../pages/friend-list/friend-list';
import { FriendPopoverComponent } from '../components/friend-popover/friend-popover';
import { GameTypePipe } from '../pipes/game-type/game-type';
import { HomeFiltersPage } from '../pages/home-filters/home-filters';
import { BugReportPage } from '../pages/bug-report/bug-report';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeKeyboard } from '@ionic-native/native-keyboard';
import { BackButtonProvider } from '../providers/backbutton/backbutton';
import { JoinPipe } from '../pipes/join/join';
import { PartnerResultsPage } from '../pages/partner-results/partner-results';
import { PartnerPopoverComponent } from '../components/partner-popover/partner-popover';
import { GameInformationPage } from '../pages/game-information/game-information';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { IonicStepperModule } from 'ionic-stepper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonTextAvatar } from 'ionic-text-avatar';
import { Screenshot } from '@ionic-native/screenshot';
import { LogsPage } from '../pages/logs/logs';


const firebaseConfig = {
  apiKey: "AIzaSyA9RMaRNiybHZvMLsQcGB0aFR8bE7TYdcI",
  authDomain: "tug-project-39442.firebaseapp.com",
  databaseURL: "https://tug-project-39442.firebaseio.com",
  projectId: "tug-project-39442",
  storageBucket: "tug-project-39442.appspot.com",
  messagingSenderId: "487644774277"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    TabsPage,
    SignupPage,
    ProfilePage,
    AddVideogamePage,
    AddressModalPage,
    AddUsernamePage,
    LoadingPage,
    ChatPage,
    ErrorCardComponent,
    MenuComponent,
    MessagingPage,
    PopoverComponent,
    DiscoverPage,
    GamelistPage,
    PaymentModalPage,
    CreditFormPage,
    ConfirmPaymentPage,
    PickGamePage,
    ConfirmTradePage,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    NotificationPage,
    AccordionComponent,
    TimeAgoPipe,
    PlatformSelectionPage,
    NotificationPopoverComponent,
    TradeDetailsPage,
    TradeHistoryPage,
    ShippingAddressFormPage,
    FriendListPage,
    FriendPopoverComponent,
    GameTypePipe,
    HomeFiltersPage,
    BugReportPage,
    JoinPipe,
    PartnerResultsPage,
    PartnerPopoverComponent,
    GameInformationPage,
    IonTextAvatar,
    LogsPage
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    BrowserModule,
    HttpModule,
    HttpClientModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    IonicStepperModule,
    SelectSearchableModule,
    IonicModule.forRoot(MyApp,{
      tabsPlacement: 'bottom',
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    TabsPage,
    SignupPage,
    ProfilePage,
    AddVideogamePage,
    AddressModalPage,
    AddUsernamePage,
    LoadingPage,
    ChatPage,
    ErrorCardComponent,
    MenuComponent,
    MessagingPage,
    PopoverComponent,
    DiscoverPage,
    GamelistPage,
    PaymentModalPage,
    CreditFormPage,
    ConfirmPaymentPage,
    PickGamePage,
    ConfirmTradePage,
    TradeCardComponent,
    PopoverHeaderComponent,
    ActionPopoverComponent,
    NotificationPage,
    AccordionComponent,
    PlatformSelectionPage,
    NotificationPopoverComponent,
    TradeDetailsPage,
    TradeHistoryPage,
    ShippingAddressFormPage,
    FriendListPage,
    FriendPopoverComponent,
    HomeFiltersPage,
    BugReportPage,
    PartnerResultsPage,
    PartnerPopoverComponent,
    GameInformationPage,
    LogsPage
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataService,
    HttpClient,
    UrlEnvironment,
    UsernameValidator,
    FCM,
    GooglePlus,
    Keyboard,
    BackButtonProvider,
    NativeKeyboard,
    PhotoViewer,
    YoutubeVideoPlayer,
    Screenshot
  ]
})
export class AppModule {}
