import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-historia',
  templateUrl: './detalle-historia.component.html',
  styleUrls: ['./detalle-historia.component.scss'],
  standalone: false,
})
export class DetalleHistoriaComponent  implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {

  }
  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}
