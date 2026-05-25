import React from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Giỏ hàng của bạn</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <img src="https://cdn-icons-png.flaticon.com/512/102/102661.png" className="w-32 h-32 mx-auto mb-6 opacity-20" alt="Empty Cart" />
        <p className="text-gray-500 mb-6">Giỏ hàng chưa có sản phẩm nào</p>
        <Link to="/" className="inline-block bg-primary hover:bg-primary-light text-white font-medium py-3 px-8 rounded-lg transition-colors">
          MUA SẮM NGAY
        </Link>
      </div>
    </div>
  );
}
