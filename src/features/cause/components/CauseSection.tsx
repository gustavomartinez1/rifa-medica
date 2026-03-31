'use client';

interface CauseSectionProps {
  imageSrc?: string;
}

export function CauseSection({ imageSrc = '/images/Felix_Martrinez.jpeg' }: CauseSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sobre la Causa
          </h2>
          <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={imageSrc}
                alt="Felix Octavio Martinez Hernandez"
                className="w-full h-full object-cover"
              />
              {/* Decorative frame */}
              <div className="absolute inset-0 ring-4 ring-emerald-500/20 rounded-2xl pointer-events-none" />
            </div>
            {/* Badge */}
            <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg">
              <p className="text-lg font-bold">Necesita tu ayuda</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Felix Octavio Martinez Hernandez
            </h3>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Se están llevando a cabo estas 3 rifas con el fin de recaudación fondos para 
              la operación y estudios de Felix Octavio Martinez Hernandez.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Tu participación hace una diferencia real en la vida de Felix y su familia. 
              Gracias por apoyar esta causa.
            </p>

            {/* Impact stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">3</p>
                <p className="text-sm text-gray-600">Rifas disponibles</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">750</p>
                <p className="text-sm text-gray-600">Boletos totales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}