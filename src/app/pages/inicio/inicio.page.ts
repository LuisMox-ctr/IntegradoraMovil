import { Component, OnInit } from '@angular/core';
import { DetalleComponent } from 'src/app/componentes/detalle/detalle.component';
import { ModalController } from '@ionic/angular';
import { DetalleHistoriaComponent } from 'src/app/componentes/detalle-historia/detalle-historia.component';
import { GameLauncherService } from 'src/app/services/launcher/game-launcher';


interface Personaje {
  id: string;
  nombre: string;
  rol: string;
  motivacion: string;
  estilo: string;
  icono: string;
  img: string;
}

@Component({
  standalone: false,
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  personajes: Personaje[] = [
    {
      id: 'kenig',
      nombre: 'KENIG GALINDO',
      rol: 'El Protagonista',
      motivacion: 'Descubrir qué pasó con su raza',
      estilo: 'Acción / Investigación',
      icono: 'search-outline',
      img: '../../../assets/img/avatares/avatar4.jpg'
    },
    {
      id: 'juan',
      nombre: 'JUAN CENA',
      rol: 'El Luchador',
      motivacion: 'Encontrar los secretos del desastre',
      estilo: 'Fuerza / Decisiones Rápidas',
      icono: 'fitness-outline',
      img: '../../../assets/img/avatares/avatar5.jpg'
    },
    {
      id: 'siggy',
      nombre: 'SIGGY',
      rol: 'El Prisionero Fugado',
      motivacion: 'Escapar de su pasado oscuro',
      estilo: 'Supervivencia / Agresividad',
      icono: 'alert-circle-outline',
      img: '../../../assets/img/avatares/avatar6.jpg'
    },
    {
      id: 'mox',
      nombre: 'MOX',
      rol: 'El Simpson',
      motivacion: 'Salvar a todos los sobrevivientes',
      estilo: 'Tanque / Sacrificio',
      icono: 'medical-outline',
      img: '../../../assets/img/personajes/mox.jpeg'
    }
  ];

  constructor(
    private modalCtrl:ModalController,
    private gameLauncher: GameLauncherService
  ) { }

  async comenzarAventura(){
    await this.gameLauncher.launchAdventure();
  }
  async verDetalle(id:string){
    const modal= await this.modalCtrl.create({
      component:DetalleComponent,
      componentProps:{id}
    });
    modal.present();
  }

  async verHistoria(){
    const modal= await this.modalCtrl.create({
      component:DetalleHistoriaComponent,
    });
    modal.present();
  }

  ngOnInit() {
  }

}
