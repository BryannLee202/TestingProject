import React from 'react';
import { FaHandshake } from 'react-icons/fa';

export default function PartnerBrands() {
  const brands = [
    { name: 'NXB Trẻ', desc: 'Nhà xuất bản uy tín hàng đầu' },
    { name: 'Nhã Nam', desc: 'Bởi vì sách là thế giới' },
    { name: 'Kim Đồng', desc: 'Nhà xuất bản cho thiếu nhi' },
    { name: 'Alphabooks', desc: 'Sách quản trị, kinh tế, kỹ năng' },
    { name: 'Đông A', desc: 'Sách bách khoa toàn thư, mỹ thuật' },
    { name: 'Fahasa', desc: 'Hệ thống nhà sách toàn quốc' }
  ];

  const brandColors = [
    'from-blue-500 to-cyan-400',
    'from-green-500 to-emerald-400',
    'from-red-500 to-rose-400',
    'from-amber-500 to-orange-400',
    'from-purple-500 to-indigo-400',
    'from-teal-500 to-cyan-500'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaHandshake className="text-primary text-xl sm:text-2xl" /> Đối Tác Phát Hành
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {brands.map((brand, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-5 rounded-xl border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all text-center cursor-pointer group bg-gradient-to-br from-white to-gray-50/30"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${brandColors[index]} text-white font-black text-sm flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
              {brand.name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()}
            </div>
            <h4 className="font-bold text-sm text-gray-800 mt-4 group-hover:text-primary transition-colors">{brand.name}</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{brand.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
