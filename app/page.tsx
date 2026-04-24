"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, Receipt, RefreshCw, AlertCircle, 
  Motorbike, Headset, Banknote, TrendingUp, 
  Store, PiggyBank, Target, BarChart3, Layers, 
  ShieldCheck, User, Navigation, ArrowRightLeft, Flag, Info 
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
  const completedToday = orders.filter(o => o.status === 'completed' && o.created_at.startsWith(today));
  
  let totalShippingRevenue = 0;
  let totalFoodCost = 0;

  completedToday.forEach(o => {
    const fee = o.shipping_fee || 10000;
    totalShippingRevenue += fee;
    totalFoodCost += (o.total_amount - fee);
  });

  const kpiTarget = 100;
  const currentProgress = completedToday.length;
  const isKpiMet = currentProgress >= kpiTarget;
  const kpiBonus = isKpiMet ? 100000 : 0;
  const codCash = completedToday.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 max-w-4xl mx-auto shadow-2xl border-x border-gray-200">
      
      <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-30 flex justify-between items-center backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-200">
            <Headset size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">GIAO NÓNG <span className="text-orange-600">HUB</span></h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hệ thống liên tuyến: Cà Mau - Bờ Đập - Huyện</p>
            </div>
          </div>
        </div>
        <button onClick={fetchOrders} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-2xl transition-all active:scale-95 border border-gray-200">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm">
             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Lợi nhuận Ship (Quỹ lương)</p>
             <h3 className="text-2xl font-black text-gray-900">{totalShippingRevenue.toLocaleString('vi-VN')}đ</h3>
             <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                <TrendingUp size={12}/> Thu 100% phí ship
             </div>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm">
             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tiền vốn trả Quán</p>
             <h3 className="text-2xl font-black text-gray-900">{totalFoodCost.toLocaleString('vi-VN')}đ</h3>
             <p className="mt-2 text-[10px] text-gray-400 font-medium">Bàn giao 100% giá món</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-[2rem] shadow-xl text-white">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tiền mặt Shipper nộp</p>
             <h3 className="text-2xl font-black text-orange-400">{codCash.toLocaleString('vi-VN')}đ</h3>
             <p className="mt-2 text-[10px] text-slate-500 italic">Đối soát chốt ca</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-gray-800 flex items-center gap-2"><Target className="text-red-500"/> KPI THƯỞNG NGÀY</h2>
              <span className="text-orange-600 font-black">{currentProgress}/{kpiTarget} đơn</span>
           </div>
           <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(currentProgress/kpiTarget)*100}%` }}></div>
           </div>
           {isKpiMet && <p className="text-[10px] text-green-600 font-bold mt-2 uppercase">🎉 Đã đạt mốc thưởng 100.000đ</p>}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <Layers className="text-gray-400" /> GIÁM SÁT VẬN HÀNH
              </h2>
           </div>
           
           <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-900">{order.order_code}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          order.status === 'pending' ? 'bg-red-100 text-red-600 animate-pulse' :
                          order.status === 'tx1_picking' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'at_midpoint' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'tx2_delivering' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {order.status === 'pending' ? '🔴 MỚI' : 
                           order.status === 'tx1_picking' ? '🛵 TX1: GOM HÀNG' :
                           order.status === 'at_midpoint' ? '📍 TẠI BỜ ĐẬP' :
                           order.status === 'tx2_delivering' ? '🛵 TX2: GIAO HUYỆN' : '✅ XONG'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                           <User size={14} className="text-gray-400" /> {order.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                           <Phone size={14} /> {order.customer_phone}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 font-medium">
                        <span className="text-[9px] font-black text-gray-400 uppercase block mb-1">Sản phẩm:</span>
                        {order.items_summary}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-xs font-bold text-gray-700 bg-gray-100 p-3 rounded-xl">
                           <MapPin size={16} className="text-gray-400 flex-shrink-0" /> 
                           <span>Địa chỉ: {order.delivery_address}</span>
                        </div>
                        
                        {order.shipping_note && (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-2 shadow-sm">
                             <Info size={16} className="text-orange-500 flex-shrink-0" />
                             <p className="text-[11px] font-black text-orange-800 uppercase leading-relaxed">
                               CHỈ ĐƯỜNG: {order.shipping_note}
                             </p>
                          </div>
                        )}

                        {/* LINK GOOGLE MAPS ĐÃ FIX CHUẨN */}
                        {order.gps_location && (
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.gps_location}&travelmode=motorcycle`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full py-4 rounded-2xl shadow-lg transition-all active:scale-95 mt-2"
                          >
                            <Navigation size={20} className="fill-white" />
                            <span className="font-black text-sm uppercase">Mở Google Maps dẫn đường</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="md:w-56 flex flex-col justify-between items-end border-l border-gray-100 pl-4">
                      <div className="text-right w-full">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng thu khách</p>
                        <p className="text-3xl font-black text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                        <p className="text-[10px] font-black mt-2 px-3 py-1 rounded bg-gray-100 inline-block text-gray-500 italic">
                          {order.payment_method === 'bank' ? '🏦 BANK / QR' : '💵 TIỀN MẶT'}
                        </p>
                      </div>

                      <div className="w-full mt-8 space-y-2">
                        {order.status === 'pending' && (
                          <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-xs active:scale-95 flex items-center justify-center gap-2">
                            <Motorbike size={16}/> TX1 GOM CÀ MAU
                          </button>
                        )}

                        {order.status === 'tx1_picking' && (
                          <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-purple-600 text-white font-black py-4 rounded-xl text-xs active:scale-95 flex items-center justify-center gap-2">
                            <MapPin size={16}/> ĐÃ TỚI BỜ ĐẬP
                          </button>
                        )}

                        {order.status === 'at_midpoint' && (
                          <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-500 text-white font-black py-4 rounded-xl text-xs active:scale-95 flex items-center justify-center gap-2">
                            <ArrowRightLeft size={16}/> GIAO TX2 (HUYỆN)
                          </button>
                        )}

                        {order.status === 'tx2_delivering' && (
                          <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-500 text-white font-black py-4 rounded-xl text-xs active:scale-95 flex items-center justify-center gap-2">
                            <Flag size={16}/> HOÀN THÀNH ĐƠN
                          </button>
                        )}

                        {['pending', 'tx1_picking'].includes(order.status) && (
                          <button onClick={() => { if(window.confirm('Hủy đơn?')) updateStatus(order.id, 'cancelled') }} className="w-full mt-2 text-[10px] text-gray-400 font-bold underline hover:text-red-500 text-center block">Hủy đơn hàng</button>
                        )}
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