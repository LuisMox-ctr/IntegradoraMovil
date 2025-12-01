import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioPageRoutingModule } from './inicio-routing.module';

import { InicioPage } from './inicio.page';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';
import { SharedModule } from 'src/app/componentes/shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioPageRoutingModule,
    SharedModule
    
  ],
  declarations: [InicioPage]
})
export class InicioPageModule {}
