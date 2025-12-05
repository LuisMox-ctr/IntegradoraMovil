import { Component, OnInit } from '@angular/core';
import { ComunidadService } from 'src/app/services/comunidad/comunidad';
import { Usuario, Actividad, Evento } from 'src/app/interfaces/interfaces';
import { GameLauncherService } from 'src/app/services/launcher/game-launcher';

@Component({
  selector: 'app-comunidad',
  templateUrl: './comunidad.page.html',
  styleUrls: ['./comunidad.page.scss'],
  standalone: false
})
export class ComunidadPage implements OnInit {
  
  vistaActual: 'ranking' | 'actividad' | 'eventos' = 'ranking';

  ranking: Usuario[] = [];
  actividadReciente: Actividad[] = [];
  eventos: Evento[] = [];

  constructor(
    private comunidadService: ComunidadService,
    private gameLauncher: GameLauncherService
  ) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar ranking con logros expandidos
    this.comunidadService.getRanking().subscribe({
      next: (usuarios) => {
        this.ranking = usuarios;
        console.log("Ranking cargado con logros:", usuarios);
        
        // Ver logros de cada usuario
        usuarios.forEach(u => {
          console.log(`${u.nombre} tiene ${(u as any).logrosExpandidos?.length || 0} logros:`, 
                      (u as any).logrosExpandidos);
        });
      },
      error: (error) => {
        console.error('Error al cargar ranking:', error);
      }
    });

    // Cargar actividad
    this.comunidadService.getActividad().subscribe({
      next: (actividades) => {
        this.actividadReciente = actividades;
        console.log("Actividad cargada:", actividades);
      },
      error: (error) => {
        console.error('Error al cargar actividad:', error);
      }
    });

    // Cargar eventos
    this.comunidadService.getEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos;
        console.log("Eventos cargados:", eventos);
      },
      error: (error) => {
        console.error('Error al cargar eventos:', error);
      }
    });
  }

  cambiarVista(vista: 'ranking' | 'actividad' | 'eventos') {
    this.vistaActual = vista;
  }

  getIconoActividad(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'logro': 'trophy',
      'nivel': 'arrow-up-circle',
      'evento': 'calendar',
      'social': 'people'
    };
    return iconos[tipo] || 'information-circle';
  }

  // Obtener logros de un usuario
  getLogrosUsuario(usuario: any): any[] {
    return usuario.logrosExpandidos || [];
  }

  // Contar logros reales
  contarLogrosReales(usuario: any): number {
    return usuario.logrosExpandidos?.length || 0;
  }
  
  getLogroIcono(actividad: Actividad): string {
    return (actividad.logro as any)?.icono || '';
  }

  getLogroTitulo(actividad: Actividad): string {
    return (actividad.logro as any)?.titulo || 'Logro';
  }

  tieneLogro(actividad: Actividad): boolean {
    return !!actividad.logro;
  }

  // Helpers para jugador
  getNombreJugador(actividad: any): string {
    // Si jugador es string, retornarlo directamente
    if (typeof actividad.jugador === 'string') {
      return actividad.jugador;
    }
    
    // Si tiene jugadorExpandido, usar su nombre
    if (actividad.jugadorExpandido) {
      return actividad.jugadorExpandido.nombre || 'Usuario';
    }
    
    return 'Usuario';
  }

  getAvatarJugador(actividad: any): string {
    // Si tiene avatar directo
    if (actividad.avatar && typeof actividad.avatar === 'string') {
      return actividad.avatar;
    }
    
    // Si tiene jugadorExpandido
    if (actividad.jugadorExpandido) {
      return actividad.jugadorExpandido.foto || 
             actividad.jugadorExpandido.avatar || 
             'assets/default-avatar.png';
    }
    
    return 'assets/default-avatar.png';
  }

  // UNIRSE AL EVENTO - CON VALIDACIÓN
  async unirseEvento(evento: Evento) {
    // Validar que el evento tenga ID
    if (!evento || !evento.id) {
      console.error('Evento sin ID válido:', evento);
      return;
    }

    console.log('Uniéndose al evento:', evento.nombre);
    
    try {
      await this.gameLauncher.joinEvent(evento.id);
    } catch (error) {
      console.error('Error al unirse al evento:', error);
    }
  }

  // Verificar si el juego está instalado
  async verificarJuego() {
    const installed = await this.gameLauncher.isGameInstalled();
    console.log('¿Juego instalado?', installed);
    return installed;
  }

  // Probar desbloqueo de logro
  async probarDesbloqueo() {
    const resultado = await this.comunidadService.desbloquearLogro(
      '2uNP9JjG40jJrgy3iraz',  // ID del usuario
      'wsE5ACux4A1JzoVRpU5c'   // ID del logro
    );
    
    alert(resultado.mensaje);
  }
}