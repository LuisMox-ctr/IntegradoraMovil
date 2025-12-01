import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComunidadPageRoutingModule } from './comunidad-routing.module';

import { ComunidadPage } from './comunidad.page';
import { SharedModule } from 'src/app/componentes/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComunidadPageRoutingModule,
    SharedModule
  ],
  declarations: [ComunidadPage]
})
export class ComunidadPageModule {}
