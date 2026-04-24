"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, RefreshCw, AlertCircle, Motorbike, Headset, 
  TrendingUp, Target, Layers, User, Navigation, ArrowRightLeft, Flag, Info,
  ClipboardList, CheckCircle2, Truck, XCircle, Wallet
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function BossDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const sub = supabase.channel('boss_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(today));
  
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
        
        {/* TỔNG QUAN TÀI CHÍNH */}
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

        {/* QUẢN LÝ ĐƠN HÀNG (NGÔN NGỮ ĐIỀU PHỐI) */}
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2"><Layers className="text-gray-400" /> BẢNG ĐIỀU PHỐI ĐƠN HÀNG</h2>
           </div>
           
           <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-grow space-y-4">
                      
                      {/* TRẠNG THÁI HIỂN THỊ DÀNH CHO BOSS */}
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-900">{order.order_code}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'pending' ? 'bg-red-100 text-red-700 animate-pulse border border-red-200' :
                          order.status === 'tx1_picking' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'at_midpoint' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'tx2_delivering' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'cancelled' ? 'bg-gray-200 text-gray-600' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status === 'pending' ? '🔴 CHỜ DUYỆT ĐƠN' : 
                           order.status === 'tx1_picking' ? '🛵 ĐANG MUA TẠI CÀ MAU' :
                           order.status === 'at_midpoint' ? '📍 ĐANG CHỜ TẠI TRẠM' :
                           order.status === 'tx2_delivering' ? '🛵 ĐANG GIAO CHO KHÁCH' : 
                           order.status === 'cancelled' ? '❌ ĐÃ HỦY' : '✅ HOÀN TẤT'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><User size={14} className="text-gray-400" /> {order.customer_name}</div>
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-600"><Phone size={14} /> {order.customer_phone}</div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-800 font-bold leading-relaxed">
                        {order.items_summary}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-100 p-3 rounded-xl border border-gray-200">
                           <MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5" /> 
                           <span>{order.delivery_address}</span>
                        </div>
                        {order.shipping_note && (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-2 shadow-sm">
                             <Info size={16} className="text-orange-600 flex-shrink-0" />
                             <p className="text-[11px] font-black text-orange-900 uppercase leading-relaxed">{order.shipping_note}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:w-64 flex flex-col justify-between items-end border-l border-gray-100 pl-4">
                      <div className="text-right w-full">
                        <p className="text-3xl font-black text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                        <p className="text-[10px] font-black mt-2 px-3 py-1 rounded-lg uppercase tracking-wider inline-block text-white shadow-sm border border-gray-800 bg-gray-800">
                          {order.payment_method === 'bank' ? '🏦 ĐÃ CHUYỂN KHOẢN' : '💵 THU TIỀN MẶT'}
                        </p>
                      </div>

                      {/* NÚT BẤM DÀNH CHO BOSS ĐIỀU PHỐI (CHỮ NGHĨA QUẢN TRỊ) */}
                      <div className="w-full mt-8 space-y-3">
                        {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2 shadow-md"><Motorbike size={18}/> DUYỆT - GIAO TX CÀ MAU</button>}
                        {order.status === 'tx1_picking' && <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-purple-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2 shadow-md"><MapPin size={18}/> XÁC NHẬN ĐẾN TRẠM</button>}
                        {order.status === 'at_midpoint' && <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2 shadow-md"><ArrowRightLeft size={18}/> ĐIỀU PHỐI TX TUYẾN HUYỆN</button>}
                        {order.status === 'tx2_delivering' && <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 flex items-center justify-center gap-2 shadow-md"><Flag size={18}/> CHỐT ĐƠN - ĐÃ GIAO XONG</button>}
                        
                        {/* CHỈ BOSS MỚI CÓ QUYỀN HỦY ĐƠN */}
                        {['pending', 'tx1_picking'].includes(order.status) && <button onClick={() => { if(window.confirm('Boss xác nhận Hủy đơn này?')) updateStatus(order.id, 'cancelled') }} className="w-full mt-3 text-[11px] text-red-500 font-bold uppercase tracking-wider hover:underline text-center block border border-red-100 py-2 rounded-lg bg-red-50">Hủy đơn hàng này</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}