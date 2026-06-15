import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaRegBell, FaInfoCircle, FaTag, FaShoppingBag, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications`);
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROMO':
        return <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0"><FaTag className="text-lg" /></div>;
      case 'ORDER':
        return <div className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center shrink-0"><FaShoppingBag className="text-lg" /></div>;
      case 'SYSTEM':
      default:
        return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0"><FaInfoCircle className="text-lg" /></div>;
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      Swal.fire({
        icon: 'success',
        title: 'Đã đánh dấu tất cả thông báo đã đọc',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <FaRegBell className="text-primary" /> Thông Báo Của Tôi
          </h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
            >
              <FaCheckDouble /> Đọc tất cả
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[300px] border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaRegBell className="text-4xl" />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-1">Không có thông báo mới</h2>
            <p className="text-gray-400 text-sm text-center">Chúng tôi sẽ gửi thông báo cho bạn khi có cập nhật mới.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`flex gap-4 p-5 items-start hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-purple-50/10' : ''}`}
              >
                {/* Red dot for unread */}
                {!notif.isRead && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
                
                {getNotificationIcon(notif.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-750 font-medium'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
