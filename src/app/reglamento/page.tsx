import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  XCircle, 
  Clock, 
  Award, 
  Scale, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Reglamento Oficial - GVB WORLD CUP 2026',
  description: 'Conoce las reglas oficiales, sistema de puntuación, plazos de entrega y criterios de desempate del Prode GVB Copa Mundial 2026.',
};

export default function ReglamentoPage() {
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  return (
    <div className="min-h-screen bg-[#0B2545] text-white py-12">
      <div className={cn("mx-auto space-y-12", theme.layout.container)}>
        
        {/* HEADER & NAVIGATION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#13315C] pb-6">
          <div>
            <Link 
              href="/" 
              className={cn(
                "inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#B8860B] hover:text-white transition-colors mb-3",
                focusClasses
              )}
              id="back-to-home-link"
            >
              <ArrowLeft size={16} /> Volver al Inicio
            </Link>
            <h1 className={cn("text-5xl sm:text-6xl text-white", theme.typography.heading)} id="main-title">
              Reglamento del <span className="text-[#B8860B]">Prode</span>
            </h1>
            <p className="text-gray-400 mt-2 text-base max-w-2xl font-inter">
              Pautas oficiales de puntuación, plazos de entrega y resolución de desempates para el Prode GVB Copa Mundial 2026.
            </p>
          </div>
          <div className="bg-[#13315C] border-2 border-[#111111] p-4 shadow-[4px_4px_0px_0px_#B8860B] text-center w-full sm:w-auto flex flex-col items-center justify-center">
            <span className={cn("text-xs block text-gray-400 font-bold uppercase tracking-widest mb-1", theme.typography.body)}>Premio Total</span>
            <span className={cn("text-3xl text-white font-bold block mb-1", theme.typography.numbers)}>$60.000 ARS</span>
            <span className="text-[10px] text-gray-300 font-mono">1°: 60% ($36.000) | 2°: 25% ($15.000) | 3°: 15% ($9.000)</span>
          </div>
        </div>

        {/* SECTION 1: SISTEMA DE PUNTUACIÓN BASE */}
        <section className="space-y-6" id="seccion-puntuacion">
          <div className="flex items-center gap-3 border-b border-[#13315C] pb-3">
            <span className={cn("text-2xl text-[#B8860B]", theme.typography.numbers)}>01</span>
            <h2 className={cn("text-3xl uppercase tracking-wider text-white", theme.typography.heading)}>
              Sistema de Puntuación Base
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* EXACT SCORE */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#0B2545] border border-[#111111] text-[#B8860B]">
                    <Target size={24} />
                  </div>
                  <span className={cn("text-xl bg-[#B8860B] text-[#111111] px-2 py-0.5 font-bold", theme.typography.numbers)}>
                    +3 PTS
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Acierto Exacto</h3>
                <p className="text-gray-300 text-sm font-inter">
                  Se obtienen 3 puntos por acertar el marcador exacto del partido.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0B2545] text-xs font-mono text-gray-400 space-y-1 bg-[#0B2545] p-3 border border-[#111111]">
                <div className="text-gray-400 uppercase font-bold tracking-wider mb-1">Ejemplo:</div>
                <div>Pronóstico: <span className="text-[#B8860B] font-bold">2 - 1</span></div>
                <div>Resultado Real: <span className="text-green-400 font-bold">2 - 1</span></div>
                <div className="text-green-400 font-bold mt-1">→ SUMA 3 PUNTOS</div>
              </div>
            </div>

            {/* TENDENCIA */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#0B2545] border border-[#111111] text-[#B8860B]">
                    <TrendingUp size={24} />
                  </div>
                  <span className={cn("text-xl bg-blue-900 text-white border border-blue-700 px-2 py-0.5 font-bold", theme.typography.numbers)}>
                    +1 PTS
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Acierto de Tendencia</h3>
                <p className="text-gray-300 text-sm font-inter">
                  Se obtiene 1 punto por acertar el ganador o el empate, aunque no el resultado exacto.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0B2545] text-xs font-mono text-gray-400 space-y-3 bg-[#0B2545] p-3 border border-[#111111]">
                <div>
                  <div className="text-gray-400 uppercase font-bold tracking-wider mb-1">Ejemplo Victoria:</div>
                  <div>Pronóstico: <span className="text-[#B8860B] font-bold">3 - 0</span></div>
                  <div>Resultado: <span className="text-white">1 - 0</span></div>
                  <div className="text-[#B8860B] font-bold">→ SUMA 1 PUNTO</div>
                </div>
                <div className="border-t border-[#13315C] pt-2">
                  <div className="text-gray-400 uppercase font-bold tracking-wider mb-1">Ejemplo Empate:</div>
                  <div>Pronóstico: <span className="text-[#B8860B] font-bold">1 - 1</span></div>
                  <div>Resultado: <span className="text-white">2 - 2</span></div>
                  <div className="text-[#B8860B] font-bold">→ SUMA 1 PUNTO</div>
                </div>
              </div>
            </div>

            {/* ERROR */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#0B2545] border border-[#111111] text-[#B8860B]">
                    <XCircle size={24} />
                  </div>
                  <span className={cn("text-xl bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 font-bold", theme.typography.numbers)}>
                    0 PTS
                  </span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Error Total</h3>
                <p className="text-gray-300 text-sm font-inter">
                  No acertar ni el resultado exacto ni la tendencia del partido.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0B2545] text-xs font-mono text-gray-400 space-y-1 bg-[#0B2545] p-3 border border-[#111111]">
                <div className="text-gray-400 uppercase font-bold tracking-wider mb-1">Ejemplo:</div>
                <div>Pronóstico: <span className="text-[#B8860B] font-bold">2 - 0</span></div>
                <div>Resultado Real: <span className="text-red-400 font-bold">0 - 1</span></div>
                <div className="text-red-400 font-bold mt-1">→ 0 PUNTOS</div>
              </div>
            </div>

          </div>

          {/* DOUBLE SCORE BOX */}
          <div className="border-2 border-[#B8860B] bg-[#111111] p-6 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#B8860B] text-[#111111] p-1 uppercase text-xs font-bold tracking-widest">
                  BONIFICACIÓN ESPECIAL
                </span>
                <span className="text-xs text-gray-400 font-bold font-mono">FASE DE GRUPOS</span>
              </div>
              <h3 className={cn("text-2xl uppercase text-white", theme.typography.heading)}>
                Partidos con Puntaje Doble
              </h3>
              <p className="text-gray-300 text-sm font-inter">
                Los partidos donde juegue la selección de <strong>Argentina</strong> y los **clásicos o rivalidades definidas** de la fase de grupos otorgarán el doble de puntos.
              </p>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="bg-[#13315C] border border-[#B8860B] p-4 text-center flex-1 sm:flex-initial">
                <span className="text-xs block text-gray-400 uppercase font-bold tracking-widest">Acierto Exacto</span>
                <span className={cn("text-3xl text-[#B8860B] font-bold block", theme.typography.numbers)}>6 PTS</span>
              </div>
              <div className="bg-[#13315C] border border-[#B8860B] p-4 text-center flex-1 sm:flex-initial">
                <span className="text-xs block text-gray-400 uppercase font-bold tracking-widest">Tendencia</span>
                <span className={cn("text-3xl text-white font-bold block", theme.typography.numbers)}>2 PTS</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: REGLA DE LOS 120 MINUTOS */}
        <section className="space-y-6" id="seccion-120-minutos">
          <div className="flex items-center gap-3 border-b border-[#13315C] pb-3">
            <span className={cn("text-2xl text-[#B8860B]", theme.typography.numbers)}>02</span>
            <h2 className={cn("text-3xl uppercase tracking-wider text-white", theme.typography.heading)}>
              Regla de los 120 Minutos (Fase Eliminatoria)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#111111] bg-[#13315C] p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-sm bg-amber-950/40 p-2 border border-amber-900 inline-flex">
                <AlertCircle size={18} />
                <span>INCLUYE TIEMPO SUPLEMENTARIO (EXCLUYE PENALES)</span>
              </div>
              <p className="text-gray-200 text-base font-inter leading-relaxed">
                Para todos los partidos de eliminación directa (Octavos de Final, Cuartos de Final, Semifinales y Final), únicamente se tendrá en cuenta el **resultado al finalizar los 120 minutos de juego** (los 90 minutos reglamentarios más los 30 minutos de tiempo suplementario/prórroga si los hubiera), incluyendo el tiempo agregado por el árbitro.
              </p>
              <p className="text-gray-400 text-sm font-inter">
                No se considerarán, bajo ninguna circunstancia, los goles o resultados obtenidos en la definición por tiros desde el punto del penal.
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#0B2545] p-5 border border-[#111111] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#B8860B] border-b border-[#13315C] pb-2">
                CASOS DE ANÁLISIS PRÁCTICO
              </h4>
              <div className="space-y-4 font-mono text-xs text-gray-300">
                <div className="space-y-1 bg-[#13315C]/50 p-2.5 border border-[#13315C]">
                  <span className="font-bold text-[#B8860B] block mb-1">Caso A: Definición en Prórroga</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pronóstico:</span>
                    <span className="text-white font-bold">Equipo A 2 - 1 Equipo B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resultado 120':</span>
                    <span className="text-green-400 font-bold">2 - 1 (Tras Suplementario)</span>
                  </div>
                  <div className="text-green-400 font-bold mt-1 text-[10px]">
                    → EVALUACIÓN: Se computa 2-1 (Acierto Exacto: 3 pts)
                  </div>
                </div>

                <div className="space-y-1 bg-[#13315C]/50 p-2.5 border border-[#13315C]">
                  <span className="font-bold text-[#B8860B] block mb-1">Caso B: Definición por Penales</span>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pronóstico:</span>
                    <span className="text-white font-bold">Equipo A 2 - 1 Equipo B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resultado 120':</span>
                    <span className="text-white font-bold">1 - 1 (Fin de Prórroga)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tanda de Penales:</span>
                    <span className="text-gray-400">Equipo A gana en penales</span>
                  </div>
                  <div className="text-red-400 font-bold mt-1 text-[10px]">
                    → EVALUACIÓN: Se computa 1-1 (Error de Tendencia: 0 pts)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PRONÓSTICOS ESPECIALES */}
        <section className="space-y-6" id="seccion-bonus">
          <div className="flex items-center gap-3 border-b border-[#13315C] pb-3">
            <span className={cn("text-2xl text-[#B8860B]", theme.typography.numbers)}>03</span>
            <h2 className={cn("text-3xl uppercase tracking-wider text-white", theme.typography.heading)}>
              Pronósticos Especiales (Bonus)
            </h2>
          </div>

          <div className="bg-[#111111] p-6 border border-[#B8860B] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] mb-4 text-sm font-inter text-gray-300 flex items-start gap-3">
            <Clock size={20} className="text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <strong>Plazo Crítico de Carga:</strong> Estos pronósticos especiales deberán completarse obligatoriamente **antes del inicio del partido inaugural del Mundial** y se computarán y sumarán a la tabla final al finalizar todo el torneo.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CHAMPION */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#B8860B] text-[#111111] px-3 py-1 font-bold text-sm tracking-wider uppercase">
                CAMPEÓN
              </div>
              <div className="pt-6 space-y-4">
                <span className={cn("text-5xl text-[#B8860B] font-bold block", theme.typography.numbers)}>10 PTS</span>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Campeón del Mundo</h3>
                  <p className="text-gray-300 text-sm font-inter">
                    Acertar con precisión a la selección que levantará la Copa del Mundo al final del torneo.
                  </p>
                </div>
              </div>
            </div>

            {/* RUNNER UP */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gray-500 text-white px-3 py-1 font-bold text-sm tracking-wider uppercase">
                SUBCAMPEÓN
              </div>
              <div className="pt-6 space-y-4">
                <span className={cn("text-5xl text-gray-300 font-bold block", theme.typography.numbers)}>5 PTS</span>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Subcampeón del Mundo</h3>
                  <p className="text-gray-300 text-sm font-inter">
                    Acertar con precisión a la selección que finalice el torneo en el segundo puesto de la Copa.
                  </p>
                </div>
              </div>
            </div>

            {/* GOLDEN BOOT */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-700 text-white px-3 py-1 font-bold text-sm tracking-wider uppercase">
                GOLEADOR
              </div>
              <div className="pt-6 space-y-4">
                <span className={cn("text-5xl text-amber-500 font-bold block", theme.typography.numbers)}>5 PTS</span>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Máximo Goleador (Bota de Oro)</h3>
                  <p className="text-gray-300 text-sm font-inter">
                    Elegir al jugador que anote la mayor cantidad de goles durante todo el torneo de la Copa del Mundo.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#0B2545] text-xs font-inter text-gray-400">
                <strong>En caso de empate:</strong> los puntos se otorgarán a todos los participantes que hayan elegido a cualquiera de los jugadores empatados en el primer puesto goleador.
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: PLAZOS DE ENTREGA */}
        <section className="space-y-6" id="seccion-plazos">
          <div className="flex items-center gap-3 border-b border-[#13315C] pb-3">
            <span className={cn("text-2xl text-[#B8860B]", theme.typography.numbers)}>04</span>
            <h2 className={cn("text-3xl uppercase tracking-wider text-white", theme.typography.heading)}>
              Plazos de Entrega & Autocompletado
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* DEADLINE LIMIT */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-4">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Clock size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Cierre de Pronósticos</h3>
              </div>
              <p className="text-gray-300 text-sm font-inter leading-relaxed">
                Los pronósticos podrán cargarse y modificarse **hasta 10 minutos antes del comienzo de cada partido**. Una vez que venza ese plazo, las celdas correspondientes a dicho partido quedarán completamente bloqueadas por el administrador de la plataforma.
              </p>
              
              <div className="bg-[#0B2545] border border-[#111111] p-3 text-xs font-mono text-gray-400">
                <span className="font-bold block text-[#B8860B] uppercase tracking-wider mb-1">Ejemplo Práctico:</span>
                <div>Partido disputado: <span className="text-white">14 de junio a las 02:00 hs</span></div>
                <div>Límite de carga: <span className="text-green-400 font-bold">14 de junio a las 01:50 hs</span></div>
              </div>
            </div>

            {/* AUTOCOMPLETED */}
            <div className="border border-[#111111] bg-[#13315C] p-6 shadow-[4px_4px_0px_0px_#111111] space-y-4">
              <div className="flex items-center gap-2 text-[#B8860B]">
                <Zap size={24} />
                <h3 className="text-lg font-bold uppercase tracking-wider">Pronóstico No Completado</h3>
              </div>
              <p className="text-gray-300 text-sm font-inter leading-relaxed">
                Si un participante deja una casilla en blanco o no completa su pronóstico antes de la fecha y hora de cierre límite establecida, el sistema computará automáticamente un resultado de **0 - 0** para ese partido de forma predeterminada.
              </p>
              
              <div className="bg-amber-950/20 border border-amber-900 p-3 text-xs text-amber-200">
                <strong>Nota:</strong> Evita penalizaciones de puntuación asegurándote de guardar todas tus predicciones con suficiente antelación al inicio del partido.
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 5: CRITERIOS DE DESEMPATE */}
        <section className="space-y-6" id="seccion-desempate">
          <div className="flex items-center gap-3 border-b border-[#13315C] pb-3">
            <span className={cn("text-2xl text-[#B8860B]", theme.typography.numbers)}>05</span>
            <h2 className={cn("text-3xl uppercase tracking-wider text-white", theme.typography.heading)}>
              Criterios de Desempate
            </h2>
          </div>

          <div className="border border-[#111111] bg-[#13315C] p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] space-y-6">
            <p className="text-gray-200 text-sm sm:text-base font-inter">
              Si dos o más participantes finalizan el torneo empatados con la misma cantidad de puntos acumulados, el desempate de posiciones y la adjudicación del premio se resolverá de acuerdo al siguiente orden de prioridad:
            </p>

            <div className="space-y-4">
              
              <div className="flex gap-4 items-start bg-[#0B2545] p-4 border border-[#111111]">
                <div className="bg-[#B8860B] text-[#111111] font-mono font-bold text-lg h-8 w-8 flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                    Mayor Cantidad de Resultados Exactos
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Se comparará y tendrá prioridad el participante que haya acertado más marcadores exactos (3 puntos o 6 puntos en partidos especiales).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-[#0B2545] p-4 border border-[#111111]">
                <div className="bg-[#B8860B] text-[#111111] font-mono font-bold text-lg h-8 w-8 flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                    Acierto al Campeón del Mundo
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Tendrá prioridad el participante que haya seleccionado correctamente al Campeón del Mundo en los pronósticos especiales.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-[#0B2545] p-4 border border-[#111111]">
                <div className="bg-[#B8860B] text-[#111111] font-mono font-bold text-lg h-8 w-8 flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                    División del Premio
                  </h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Si persiste el empate absoluto tras aplicar los criterios anteriores, el premio final se dividirá en partes exactamente iguales entre todos los participantes involucrados.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
