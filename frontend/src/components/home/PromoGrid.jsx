import React from 'react';

export default function PromoGrid() {
  const promos = [
    { id: 1, src: 'https://cdn0.fahasa.com/media/magentothem/banner7/KhuyenMai_310x210.jpg' },
    { id: 2, src: 'https://cdn0.fahasa.com/media/magentothem/banner7/Trang-Do-choi-Slide_840x320.jpg' },
    { id: 3, src: 'https://cdn0.fahasa.com/media/magentothem/banner7/VPP_310x210.jpg' },
    { id: 4, src: 'https://cdn0.fahasa.com/media/magentothem/banner7/ForeignBooks_310x210.jpg' },
  ];

  return (
    <section className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {promos.map((promo) => (
          <div key={promo.id} className="relative group overflow-hidden rounded-xl shadow-sm border border-gray-100 cursor-pointer">
            <img 
              src={promo.src} 
              alt="Promo" 
              className="w-full h-auto aspect-[3/2] object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="bg-white text-primary font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                MUA NGAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
