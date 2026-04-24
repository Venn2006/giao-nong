"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, RefreshCw, Headset, 
  Layers, User, ClipboardList, CheckCircle2, Truck, XCircle, Wallet, Info, Navigation, Package, Car
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function BossDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const sub = supabase.channel('boss_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    if(window.confirm('Boss xác nhận Hủy đơn này?')) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    }
  };

  const vnTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"});
  const todayObj = new Date(vnTime);
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));
  
  const totalOrders = todayOrders.length;
  const completedOrders = todayOrders.filter(o => o.status === 'completed').length;
  const cancelledOrders = todayOrders.filter(o => o.status === 'cancelled').length;
  const inProgressOrders = totalOrders - completedOrders - cancelledOrders;

  const completedToday = todayOrders.filter(o => o.status === 'completed');
  let totalShippingRevenue = 0;
  let totalFoodCost = 0;
  let totalSystemRevenue = 0;

  completedToday.forEach(o => {
    const fee = o.shipping_fee || 10000;
    totalShippingRevenue += fee;
    totalFoodCost += (o.total_amount - fee);
    totalSystemRevenue += o.total_amount;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 max-w-4xl mx-auto shadow-2xl border-x border-gray-200">
      <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-30 flex justify-between items-center backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-200"><Headset size={24} className="text-white" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">GIAO NÓNG <span className="text-orange-600">HUB</span></h1>
            <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Quyền Quản Trị Hệ Thống</p></div>
          </div>
        </div>
        <button onClick={fetchOrders} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-2xl transition-all active:scale-95 border border-gray-200">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl text-white">
           <div className="flex justify-between items-start mb-6">
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng doanh thu hôm nay</p><h2 className="text-3xl font-black text-orange-400">{totalSystemRevenue.toLocaleString('vi-VN')}đ</h2></div>
              <Wallet size={32} className="text-slate-700" />
           </div>
           <div className="grid grid-cols-4 gap-2 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
              <div className="text-center p-2"><ClipboardList size={16} className="mx-auto text-blue-400 mb-1"/><p className="text-[9px] font-bold text-slate-400 uppercase">Tổng đơn</p><p className="text-xl font-black text-white">{totalOrders}</p></div>
              <div className="text-center p-2 bg-slate-700/50 rounded-xl"><Truck size={16} className="mx-auto text-orange-400 mb-1"/><p className="text-[9px] font-bold text-slate-400 uppercase">Đang chạy</p><p className="text-xl font-black text-orange-400">{inProgressOrders}</p></div>
              <div className="text-center p-2"><CheckCircle2 size={16} className="mx-auto text-green-400 mb-1"/><p className="text-[9px] font-bold text-slate-400 uppercase">Hoàn tất</p><p className="text-xl font-black text-green-400">{completedOrders}</p></div>
              <div className="text-center p-2"><XCircle size={16} className="mx-auto text-red-400 mb-1"/><p className="text-[9px] font-bold text-slate-400 uppercase">Đã hủy</p><p className="text-xl font-black text-red-400">{cancelledOrders}</p></div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Lợi nhuận Ship</p><h3 className="text-2xl font-black text-gray-900">{totalShippingRevenue.toLocaleString('vi-VN')}đ</h3></div>
          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Tiền vốn Quán</p><h3 className="text-2xl font-black text-gray-900">{totalFoodCost.toLocaleString('vi-VN')}đ</h3></div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2"><Layers className="text-gray-400" /> BẢNG GIÁM SÁT ĐƠN HÀNG</h2>
           </div>
           
           <div className="divide-y divide-gray-100">
              {orders.map((order) => {
                const isPackage = order.items_summary?.includes('[GIAO HÀNG]');
                const isRide = order.items_summary?.includes('[ĐẶT XE]');

                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow space-y-4">
                        
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-gray-900">{order.order_code}</span>
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 ${
                            order.status === 'pending' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                            order.status === 'tx1_picking' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            order.status === 'at_midpoint' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                            order.status === 'tx2_delivering' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                            order.status === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                            'bg-green-50 text-green-800 border-green-200'
                          }`}>
                            {order.status === 'pending' && '🔴 ĐỢI TÀI XẾ NHẬN ĐƠN'}
                            {order.status === 'tx1_picking' && (isPackage ? '📦 ĐANG GOM KIỆN HÀNG' : '🛵 ĐANG MUA TẠI QUÁN')}
                            {order.status === 'at_midpoint' && '📍 HAI TÀI XẾ ĐANG CHẠY GẶP NHAU'}
                            {order.status === 'tx2_delivering' && (isPackage ? '🚚 ĐANG CHỞ KIỆN HÀNG' : isRide ? '🚖 ĐANG CHỞ KHÁCH' : '🛵 ĐANG ĐI GIAO ĐỒ ĂN')}
                            {order.status === 'cancelled' && '❌ ĐÃ HỦY'}
                            {order.status === 'completed' && '✅ ĐÃ HOÀN TẤT'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><User size={14} className="text-gray-400" /> {order.customer_name}</div>
                          <div className="flex items-center gap-2 text-xs font-bold text-orange-600"><Phone size={14} /> {order.customer_phone}</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-800 font-bold leading-relaxed whitespace-pre-line">
                          {order.items_summary}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-100 p-3 rounded-xl border border-gray-200">
                             <MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5" /> 
                             <span className="whitespace-pre-line">{order.delivery_address}</span>
                          </div>
                          {order.shipping_note && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex items-start gap-2 shadow-sm">
                               <Info size={16} className="text-yellow-600 flex-shrink-0" />
                               <p className="text-[11px] font-black text-yellow-900 uppercase leading-relaxed">{order.shipping_note}</p>
                            </div>
                          )}
                          
                          {order.gps_location && (
                            <a href={`http://googleusercontent.com/maps.google.com/maps?daddr=${order.gps_location}&travelmode=motorcycle`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 w-full py-3 rounded-xl transition-all active:scale-95 mt-2 border border-blue-200">
                              <Navigation size={16} />
                              <span className="font-bold text-xs uppercase">Xem Bản Đồ (GPS)</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="md:w-64 flex flex-col justify-between items-end border-l border-gray-100 pl-4">
                        <div className="text-right w-full">
                          <p className="text-3xl font-black text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                          <p className="text-[10px] font-black mt-2 px-3 py-1 rounded-lg uppercase tracking-wider inline-block text-white shadow-sm bg-gray-800">
                            {order.payment_method === 'bank' ? '🏦 KHÁCH ĐÃ CK' : 
                             order.payment_method === 'cash_sender' ? '💵 THU NGƯỜI GỬI' : 
                             order.payment_method === 'cash_receiver' ? '💵 THU NGƯỜI NHẬN' : '💵 THU TIỀN MẶT'}
                          </p>
                        </div>

                        <div className="w-full mt-8 space-y-3">
                          {['pending', 'tx1_picking', 'at_midpoint'].includes(order.status) && (
                            <button onClick={() => updateStatus(order.id, 'cancelled')} className="w-full mt-3 text-[11px] text-red-500 font-bold uppercase tracking-wider hover:underline text-center block border border-red-100 py-3 rounded-lg bg-red-50 active:scale-95">Hủy bỏ đơn hàng này</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      </div>
    </div>
  );
}