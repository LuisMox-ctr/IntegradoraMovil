import { Auth, getAuth,signInWithEmailAndPassword,signOut,provideAuth } from '@angular/fire/auth';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { makeEnvironmentProviders } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'
import {provideFirestore, getFirestore} from '@angular/fire/firestore'
import { firebaseConfig } from 'src/environments/firebaseConfig';
import { DetalleComponent } from './componentes/detalle/detalle.component';
import { DetalleHistoriaComponent } from './componentes/detalle-historia/detalle-historia.component';
@NgModule({
  declarations: [AppComponent,
    DetalleComponent,
    DetalleHistoriaComponent,
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule],
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
