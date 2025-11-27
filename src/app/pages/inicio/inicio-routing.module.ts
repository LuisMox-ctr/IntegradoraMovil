import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';

import { InicioPage } from './inicio.page';

const routes: Routes = [
  {
    path: '',
    component: InicioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,
    DetalleComponent
  ],
  declarations:[DetalleComponent],
})
export class InicioPageRoutingModule {}
