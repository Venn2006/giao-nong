"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, RefreshCw, User, CheckCircle2, 
  ClipboardList, Truck, XCircle, Banknote, QrCode, Navigation
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ShipperApp() {
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
    const sub = supabase.channel('shipper_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  };

  // 1. TÍNH TOÁN DỮ LIỆU ĐẾM SỐ (YÊU CẦU MỚI)
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => 
    o.created_at.startsWith(today) && 
    ['tx1_picking', 'at_midpoint', 'tx2_delivering', 'completed', 'cancelled'].includes(o.status)
  );
  
  const totalOrders = todayOrders.length;
  const completedOrders = todayOrders.filter(o => o.status === 'completed');
  const completedCount = completedOrders.length;
  const cancelledCount = todayOrders.filter(o => o.status === 'cancelled').length;
  const inProgressCount = totalOrders - completedCount - cancelledCount;

  // 2. TÍNH TOÁN BÁO CÁO CHỐT CA (GIAO DIỆN CŨ CỦA MÀY)
  const cashToSubmit = completedOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);
  const bankToBoss = completedOrders.filter(o => o.payment_method === 'bank').reduce((sum, o) => sum + o.total_amount, 0);
  const totalRevenue = cashToSubmit + bankToBoss;

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER MÀU XANH THEO HÌNH MÀY CHỤP */}
      <header className="bg-blue-600 p-5 sticky top-0 z-30 shadow-md rounded-b-[2rem]">
        <div className="flex justify-between items-center text-white mb-2">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">APP TÀI XẾ</h1>
            <p className="text-xs font-medium text-blue-100 mt-0.5">Bạn có {inProgressCount} đơn cần giao</p>
          </div>
          <button onClick={fetchOrders} className="bg-white/20 p-2.5 rounded-xl active:scale-95 border border-white/30">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-4 -mt-2">
        
        {/* TÍNH NĂNG MỚI: BẢNG ĐẾM TIẾN ĐỘ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between items-center text-center">
           <div className="w-1/4">
              <ClipboardList size={18} className="mx-auto text-blue-500 mb-1"/>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Tổng</p>
              <p className="text-lg font-black text-gray-800">{totalOrders}</p>
           </div>
           <div className="w-1/4 border-l border-gray-100">
              <Truck size={18} className="mx-auto text-orange-500 mb-1"/>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Đang giao</p>
              <p className="text-lg font-black text-orange-600">{inProgressCount}</p>
           </div>
           <div className="w-1/4 border-l border-gray-100">
              <CheckCircle2 size={18} className="mx-auto text-green-500 mb-1"/>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Đã giao</p>
              <p className="text-lg font-black text-green-600">{completedCount}</p>
           </div>
           <div className="w-1/4 border-l border-gray-100">
              <XCircle size={18} className="mx-auto text-red-500 mb-1"/>
              <p className="text-[9px] font-bold text-gray-400 uppercase">Hủy</p>
              <p className="text-lg font-black text-red-600">{cancelledCount}</p>
           </div>
        </div>

        {/* TÍNH NĂNG CŨ: BÁO CÁO CHỐT CA */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
           <h2 className="text-xs font-black text-blue-700 flex items-center gap-2 mb-3 uppercase tracking-wider"><ClipboardList size={16}/> Báo Cáo Chốt Ca</h2>
           <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                 <p className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><Banknote size={12} className="text-orange-500"/> Tiền mặt (Cần nộp)</p>
                 <p className="text-lg font-black text-orange-700">{cashToSubmit.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                 <p className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1"><QrCode size={12} className="text-green-500"/> Đã CK (Boss nhận)</p>
                 <p className="text-lg font-black text-green-700">{bankToBoss.toLocaleString('vi-VN')}đ</p>
              </div>
           </div>
           <div className="bg-[#242c38] p-3 rounded-xl flex justify-between items-center text-white">
              <p className="text-xs font-bold uppercase">Tổng Doanh Thu ({completedCount} đơn)</p>
              <p className="text-lg font-black text-yellow-400">{totalRevenue.toLocaleString('vi-VN')}đ</p>
           </div>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG (CARD UI CHUẨN MÀY CHỤP) */}
        <div className="space-y-4">
          {todayOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              
              {/* Header Card */}
              <div className="flex justify-between items-center mb-4">
                 <span className="text-xl font-black text-gray-800">{order.order_code}</span>
                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                    order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-200' : 
                    order.status === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' : 
                    'bg-orange-50 text-orange-600 border-orange-200 animate-pulse'
                 }`}>
                   {order.status === 'completed' && <CheckCircle2 size={12}/>}
                   {order.status === 'completed' ? 'ĐÃ GIAO' : 
                    order.status === 'cancelled' ? 'ĐÃ HỦY' : 
                    order.status === 'tx1_picking' ? 'GOM CÀ MAU' : 
                    order.status === 'at_midpoint' ? 'TẠI BỜ ĐẬP' : 'ĐANG GIAO'}
                 </span>
              </div>
              
              {/* Thông tin khách hàng */}
              <div className="space-y-2 mb-4">
                 <div className="flex items-center gap-2 text-sm font-bold text-blue-900 ml-1">
                    <User size={16} className="text-blue-400" /> {order.customer_name}
                 </div>
                 
                 <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium border border-blue-100 active:scale-[0.98]">
                    <Phone size={16} className="text-blue-500"/> {order.customer_phone} <span className="text-[10px] text-gray-500 font-bold ml-1">(Bấm gọi ngay)</span>
                 </a>

                 <div className="flex items-start gap-2 bg-red-50 text-red-800 p-3 rounded-xl text-sm font-medium border border-red-100">
                    <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" /> 
                    <span>{order.delivery_address}</span>
                 </div>
              </div>

              {/* Chi tiết đơn */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                 <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Cần mua:</p>
                 <p className="text-sm font-bold text-gray-800 leading-relaxed">{order.items_summary}</p>
                 {order.shipping_note && <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">Lưu ý: {order.shipping_note}</p>}
              </div>

              {/* Thanh toán (Footer Card) */}
              <div className="bg-[#383f4b] p-4 rounded-2xl flex justify-between items-center text-white mb-4">
                 <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mb-0.5">Tiền thu khách</p>
                    <p className="text-2xl font-black text-yellow-400">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                 </div>
                 <span className={`px-2 py-1 rounded text-[9px] font-black border uppercase tracking-wider ${
                    order.payment_method === 'bank' ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-orange-900/50 text-orange-300 border-orange-700'
                 }`}>
                   {order.payment_method === 'bank' ? 'Đã CK / Mã QR' : 'Thu tiền mặt'}
                 </span>
              </div>

              {/* Nút hành động cho các đơn chưa giao xong */}
              {!['completed', 'cancelled'].includes(order.status) && (
                <div className="space-y-2">
                   {order.gps_location && (
                      <a href={`http://googleusercontent.com/maps.google.com/maps?daddr=${order.gps_location}&travelmode=motorcycle`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 font-black w-full py-3 rounded-xl active:scale-95 text-xs uppercase border border-blue-200">
                        <Navigation size={16} /> Mở bản đồ chỉ đường
                      </a>
                   )}
                   {order.status === 'tx1_picking' && <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-sm active:scale-95 shadow-md">BÀN GIAO TẠI BỜ ĐẬP</button>}
                   {order.status === 'at_midpoint' && <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-500 text-white font-black py-4 rounded-xl text-sm active:scale-95 shadow-md">NHẬN HÀNG ĐI GIAO</button>}
                   {order.status === 'tx2_delivering' && <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-500 text-white font-black py-4 rounded-xl text-sm active:scale-95 shadow-md">ĐÃ GIAO THÀNH CÔNG</button>}
                </div>
              )}

            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}