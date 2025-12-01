import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { UserMenuComponent } from 'src/app/componentes/user-menu/user-menu.component';

@NgModule({
  declarations: [UserMenuComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [UserMenuComponent]  // 👈 EXPORTAR para usarlo en otros módulos
})
export class SharedModule { }