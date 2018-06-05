import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
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
import { UsernameValidator } from '../providers/services/usernameValidator';
import { ChatPage } from '../pages/chat/chat';
import { ErrorCardComponent } from '../components/error-card/error-card';


const firebaseConfig = {
  apiKey: "AIzaSyDioOfikgv6FjUXsC3kzWByLuJoKrh3OAY",
  authDomain: "tradeupgames-dd.firebaseapp.com",
  databaseURL: "https://tradeupgames-dd.firebaseio.com",
  projectId: "tradeupgames-dd",
  storageBucket: "tradeupgames-dd.appspot.com",
  messagingSenderId: "22178731920"
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
    ErrorCardComponent
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
    BrowserModule,
    HttpModule,
    HttpClientModule,
    AngularFireAuthModule,
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
    ErrorCardComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataService,
    HttpClient,
    UrlEnvironment,
    UsernameValidator
  ]
})
export class AppModule {}
