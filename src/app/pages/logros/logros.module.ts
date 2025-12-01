import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LogrosPageRoutingModule } from './logros-routing.module';

import { LogrosPage } from './logros.page';
import { SharedModule } from 'src/app/componentes/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogrosPageRoutingModule,
    SharedModule
  ],
  declarations: [LogrosPage]
})
export class LogrosPageModule {}
