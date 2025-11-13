import { Component } from '@angular/core';

interface IonTabs{
  nombre: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  elementos: IonTabs []=[
    {nombre:'Inicio',ruta: '/inicio', icono: 'home'},
    {nombre:'Logros',ruta: '/logros', icono: 'trophy'},
    {nombre:'Comunidad',ruta: '/comunidad', icono: 'people'},  
  ];
  constructor() {}
}
