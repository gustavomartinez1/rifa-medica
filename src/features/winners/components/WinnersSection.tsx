'use client';

interface Winner {
  name: string;
  raffleNumber: number;
  prize: string;
  ticketNumber: number;
  winnerImage: string;
  proofImage: string;
}

const winners: Winner[] = [
  {
    name: 'Francisca Zárate',
    raffleNumber: 1,
    prize: 'Collar y Aretes de Oro 18K',
    ticketNumber: 4,
    winnerImage: '/images/Ganador_SetCA.jpeg',
    proofImage: '/images/Comprobante_GanadorSetCA.jpeg',
  },
  {
    name: 'Chuy Hermosillo',
    raffleNumber: 2,
    prize: 'Samsung Galaxy A13',
    ticketNumber: 90,
    winnerImage: '/images/Ganador_Telefono.jpeg',
    proofImage: '/images/Comprobante_GanadorTelefono.jpeg',
  },
  {
    name: 'Alejandra Montes Acosta',
    raffleNumber: 3,
    prize: 'Alexa Echo Pop',
    ticketNumber: 199,
    winnerImage: '/images/Ganador_Alexa.jpeg',
    proofImage: '/images/Comprobante_GanadorAlexa.jpeg',
  },
];

export function WinnersSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            ¡Felicidades a los ganadores!
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ganadores de las Rifas
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            El participante que resulte ganador en cada una de las 3 rifas se lleva el premio correspondiente. 
            A continuación les compartimos la evidencia del sorteo.
          </p>
        </div>

        {/* Winners Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {winners.map((winner) => (
            <div
              key={winner.raffleNumber}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow"
            >
              {/* Prize Image */}
              <div className="relative h-48 bg-gray-100">
                {winner.raffleNumber === 1 && (
                  <img src="/images/CollarAretes.jpeg" alt={winner.prize} className="w-full h-full object-cover" />
                )}
                {winner.raffleNumber === 2 && (
                  <img src="/images/Samsung_A13.jpeg" alt={winner.prize} className="w-full h-full object-cover" />
                )}
                {winner.raffleNumber === 3 && (
                  <img src="/images/Alexa.jpeg" alt={winner.prize} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Rifa #{winner.raffleNumber}
                </div>
              </div>

              {/* Winner Info */}
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-1">Ganador</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{winner.name}</h3>
                <p className="text-emerald-600 font-semibold">{winner.prize}</p>
                <p className="text-gray-500 text-sm mt-2">Boleto #{winner.ticketNumber}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Evidence Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Evidencia del Sorteo</h3>
            <p className="text-gray-600">
              El día 8 de abril de 2026 a las 5:00 PM CST se realizó el sorteo de manera transparente
              utilizando números aleatorios generados por código.
            </p>
          </div>

          {/* Code Evidence */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-gray-400 text-sm font-mono">Código utilizado para determinar ganadores</span>
            </div>
            <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`// Función para seleccionar ganador aleatorio
function obtenerGanador(ticketsVendidos) {
  const indiceAleatorio = Math.floor(Math.random() * ticketsVendidos.length);
  return ticketsVendidos[indiceAleatorio];
}

// Ejemplo de resultado:
// Rifa 1 (Collar): Ticket #244 - Chuy Hermosillo
// Rifa 2 (Samsung): Ticket #87 - Alejandra Montes Acosta  
// Rifa 3 (Alexa): Ticket #156 - Francisca Zárate`}
            </pre>
            <div className="mt-4 flex justify-center">
              <img src="/images/Evidencia_codigo.jpeg" alt="Evidencia del código" className="rounded-lg max-h-64" />
            </div>
          </div>

          {/* Winner Screenshots */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-3">Rifa 1 - Collar y Aretes</p>
              <img src="/images/Ganador_SetCA.jpeg" alt="Ganador Collar" className="rounded-lg shadow mx-auto" />
              <img src="/images/Comprobante_GanadorSetCA.jpeg" alt="Comprobante Collar" className="rounded-lg shadow mx-auto mt-2" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-3">Rifa 2 - Samsung A13</p>
              <img src="/images/Ganador_Telefono.jpeg" alt="Ganador Teléfono" className="rounded-lg shadow mx-auto" />
              <img src="/images/Comprobante_GanadorTelefono.jpeg" alt="Comprobante Teléfono" className="rounded-lg shadow mx-auto mt-2" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-3">Rifa 3 - Alexa Echo Pop</p>
              <img src="/images/Ganador_Alexa.jpeg" alt="Ganador Alexa" className="rounded-lg shadow mx-auto" />
              <img src="/images/Comprobante_GanadorAlexa.jpeg" alt="Comprobante Alexa" className="rounded-lg shadow mx-auto mt-2" />
            </div>
          </div>
        </div>

        {/* Winner List Summary */}
        <div className="mt-12 bg-emerald-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-6">Lista Completa de Ganadores</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-emerald-700 rounded-xl p-4">
              <p className="text-emerald-200 text-sm">Rifa 1 - Collar y Aretes</p>
              <p className="text-xl font-bold">Francisca Zárate</p>
              <p className="text-emerald-200">Boleto #4</p>
            </div>
            <div className="bg-emerald-700 rounded-xl p-4">
              <p className="text-emerald-200 text-sm">Rifa 2 - Samsung Galaxy A13</p>
              <p className="text-xl font-bold">Chuy Hermosillo</p>
              <p className="text-emerald-200">Boleto #90</p>
            </div>
            <div className="bg-emerald-700 rounded-xl p-4">
              <p className="text-emerald-200 text-sm">Rifa 3 - Alexa Echo Pop</p>
              <p className="text-xl font-bold">Alejandra Montes Acosta</p>
              <p className="text-emerald-200">Boleto #199</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
