import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { makeEnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'
import {provideFirestore, getFirestore} from '@angular/fire/firestore'
import{provideAuth,getAuth} from '@angular/fire/auth'
import { firebaseConfig } from 'src/environments/firebaseConfig';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    makeEnvironmentProviders([
      provideFirebaseApp(()=>initializeApp(firebaseConfig)),
      provideFirestore(()=>getFirestore()),
      provideAuth(()=>getAuth()),
    ])
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
