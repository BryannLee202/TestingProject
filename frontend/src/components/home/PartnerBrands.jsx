import React from 'react';
import { FaHandshake } from 'react-icons/fa';
import logoTre from '../../assets/publishers/logo_tre.jpg';
import logoNhaNam from '../../assets/publishers/logo_nhanam.jpeg';
import logoKimDong from '../../assets/publishers/logo_kimdong.png';
import logoAlpha from '../../assets/publishers/logo_alpha.png';
import logoDongA from '../../assets/publishers/logo_donga.jpg';
import logoFahasa from '../../assets/publishers/logo_fahasa.webp';

export default function PartnerBrands() {
  const brands = [
    { name: 'NXB Trẻ', desc: 'Nhà xuất bản uy tín hàng đầu', image: logoTre },
    { name: 'Nhã Nam', desc: 'Bởi vì sách là thế giới', image: logoNhaNam },
    { name: 'Kim Đồng', desc: 'Nhà xuất bản cho thiếu nhi', image: logoKimDong },
    { name: 'Alphabooks', desc: 'Sách quản trị, kinh tế, kỹ năng', image: logoAlpha },
    { name: 'Đông A', desc: 'Sách bách khoa toàn thư, mỹ thuật', image: logoDongA },
    { name: 'Fahasa', desc: 'Hệ thống nhà sách toàn quốc', image: logoFahasa }
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
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain p-1" />
            </div>
            <h4 className="font-bold text-sm text-gray-800 mt-4 group-hover:text-primary transition-colors">{brand.name}</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{brand.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
