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
  
  const [activeRoute, setActiveRoute] = useState("Tất cả");
  const routes = ["Tất cả", "Cà Mau (Nội ô)", "Chà Là", "Đầm Dơi", "Cái Nước"];

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
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

  // FIX MÚI GIỜ CHUẨN VIỆT NAM ĐỂ TÀI XẾ THẤY ĐƠN
  const vnTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"});
  const todayObj = new Date(vnTime);
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  let todayOrders = orders.filter(o => 
    o.created_at.startsWith(todayStr) && 
    ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering', 'completed', 'cancelled'].includes(o.status)
  );

  // LOGIC LỌC TUYẾN HUYỆN
  if (activeRoute !== "Tất cả") {
    todayOrders = todayOrders.filter(o => {
      const address = (o.delivery_address || "").toLowerCase();
      if (activeRoute === "Cà Mau (Nội ô)") return address.includes("cà mau") || address.includes("ca mau") || address.includes("phường");
      if (activeRoute === "Chà Là") return address.includes("chà là") || address.includes("cha la");
      if (activeRoute === "Đầm Dơi") return address.includes("đầm dơi") || address.includes("dam doi");
      if (activeRoute === "Cái Nước") return address.includes("cái nước") || address.includes("cai nuoc");
      return true;
    });
  }

  const totalOrders = todayOrders.length;
  const completedOrders = todayOrders.filter(o => o.status === 'completed');
  const completedCount = completedOrders.length;
  const cancelledCount = todayOrders.filter(o => o.status === 'cancelled').length;
  const inProgressCount = totalOrders - completedCount - cancelledCount;

  const cashToSubmit = completedOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);
  const bankToBoss = completedOrders.filter(o => o.payment_method === 'bank').reduce((sum, o) => sum + o.total_amount, 0);
  const totalRevenue = cashToSubmit + bankToBoss;

  const activeOrders = todayOrders.filter(o => ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering'].includes(o.status));

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      <header className="bg-blue-600 p-5 sticky top-0 z-30 shadow-md rounded-b-[2rem]">
        <div className="flex justify-between items-center text-white mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">APP TÀI XẾ</h1>
            <p className="text-sm font-medium text-blue-100 mt-1">Đang có {inProgressCount} đơn trên tuyến này</p>
          </div>
          <button onClick={fetchOrders} className="bg-white/20 p-3 rounded-xl active:scale-95 border border-white/30">
            <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {routes.map(route => (
            <button key={route} onClick={() => setActiveRoute(route)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-black border-2 transition-colors ${
                activeRoute === route ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-blue-700/50 text-blue-100 border-blue-400/30'
              }`}
            >{route}</button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-5 -mt-2">
        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex justify-between items-center text-center">
           <div className="w-1/4"><ClipboardList size={20} className="mx-auto text-blue-500 mb-1"/><p className="text-[10px] font-bold text-gray-500 uppercase">Tổng</p><p className="text-xl font-black text-gray-800">{totalOrders}</p></div>
           <div className="w-1/4 border-l border-gray-100"><Truck size={20} className="mx-auto text-orange-500 mb-1"/><p className="text-[10px] font-bold text-gray-500 uppercase">Đang giao</p><p className="text-xl font-black text-orange-600">{inProgressCount}</p></div>
           <div className="w-1/4 border-l border-gray-100"><CheckCircle2 size={20} className="mx-auto text-green-500 mb-1"/><p className="text-[10px] font-bold text-gray-500 uppercase">Đã giao</p><p className="text-xl font-black text-green-600">{completedCount}</p></div>
           <div className="w-1/4 border-l border-gray-100"><XCircle size={20} className="mx-auto text-red-500 mb-1"/><p className="text-[10px] font-bold text-gray-500 uppercase">Hủy</p><p className="text-xl font-black text-red-600">{cancelledCount}</p></div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
           <h2 className="text-sm font-black text-blue-700 flex items-center gap-2 mb-4 uppercase tracking-wider"><ClipboardList size={18}/> Chốt Ca {activeRoute !== 'Tất cả' ? `(${activeRoute})` : ''}</h2>
           <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200"><p className="text-[11px] font-black text-gray-600 uppercase flex items-center gap-1 mb-2"><Banknote size={14} className="text-orange-500"/> Tiền mặt nộp</p><p className="text-xl font-black text-orange-700">{cashToSubmit.toLocaleString('vi-VN')}đ</p></div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200"><p className="text-[11px] font-black text-gray-600 uppercase flex items-center gap-1 mb-2"><QrCode size={14} className="text-green-500"/> Đã chuyển khoản</p><p className="text-xl font-black text-green-700">{bankToBoss.toLocaleString('vi-VN')}đ</p></div>
           </div>
           <div className="bg-gray-900 p-4 rounded-xl flex justify-between items-center text-white shadow-md">
              <p className="text-xs font-black uppercase tracking-wider">Tổng Doanh Thu</p>
              <p className="text-2xl font-black text-yellow-400">{totalRevenue.toLocaleString('vi-VN')}đ</p>
           </div>
        </div>

        <div className="space-y-5">
          {activeOrders.length === 0 ? (
             <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-4">
                <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
                <p className="font-black text-gray-800">Tuyệt vời, tuyến này đang sạch đơn!</p>
             </div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2rem] p-5 shadow-md border-2 border-gray-100">
                <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
                   <span className="text-2xl font-black text-gray-900">{order.order_code}</span>
                   <span className={`px-3 py-1.5 rounded-lg text-xs font-black border-2 uppercase ${
                      order.status === 'pending' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 
                      order.status === 'tx1_picking' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      order.status === 'at_midpoint' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      'bg-orange-50 text-orange-700 border-orange-200'
                   }`}>
                     {order.status === 'pending' ? '🔴 BẤM NHẬN ĐƠN ĐI' : 
                      order.status === 'tx1_picking' ? '🛵 MUA Ở CÀ MAU' : 
                      order.status === 'at_midpoint' ? '📍 HÀNG ĐANG Ở TRẠM' : '🛵 ĐANG GIAO KHÁCH'}
                   </span>
                </div>
                
                <div className="space-y-3 mb-5">
                   <div className="flex items-center gap-2 text-base font-black text-blue-900 ml-1"><User size={20} className="text-blue-500" /> KH: {order.customer_name}</div>
                   <a href={`tel:${order.customer_phone}`} className="flex justify-between items-center bg-blue-50 text-blue-800 p-4 rounded-2xl text-base font-black border-2 border-blue-100 active:bg-blue-100 transition-colors">
                      <div className="flex items-center gap-2"><Phone size={20} className="text-blue-600"/> {order.customer_phone}</div>
                      <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg">BẤM GỌI KHÁCH</span>
                   </a>
                   <div className="flex items-start gap-2 bg-red-50 text-red-900 p-4 rounded-2xl text-sm font-bold border-2 border-red-100">
                      <MapPin size={20} className="text-red-500 mt-0.5 flex-shrink-0" /> <span className="leading-relaxed">{order.delivery_address}</span>
                   </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-2xl border-2 border-gray-200 mb-5">
                   <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-300 pb-2">Món cần mua:</p>
                   <p className="text-base font-black text-gray-900 leading-relaxed">{order.items_summary}</p>
                   {order.shipping_note && <p className="text-sm font-black text-orange-700 mt-3 bg-orange-100 p-3 rounded-xl border border-orange-200">Lưu ý: {order.shipping_note}</p>}
                </div>

                <div className="bg-gray-800 p-5 rounded-2xl flex justify-between items-center text-white mb-5 shadow-lg border-2 border-gray-700">
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cần thu Khách</p>
                      <p className="text-4xl font-black text-yellow-400">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                   </div>
                   <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-inner ${order.payment_method === 'bank' ? 'bg-green-500 text-white' : 'bg-white text-gray-900'}`}>
                     {order.payment_method === 'bank' ? '🏦 KHÁCH ĐÃ CK' : '💵 THU TIỀN MẶT'}
                   </span>
                </div>

                <div className="space-y-3 mt-2">
                   {order.gps_location && (
                      <a href={`http://googleusercontent.com/maps.google.com/maps?daddr=${order.gps_location}&travelmode=motorcycle`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-gray-100 text-blue-700 font-black w-full py-4 rounded-xl active:scale-95 text-sm uppercase border-2 border-gray-200 transition-colors hover:bg-gray-200">
                        <Navigation size={20} className="fill-blue-700" /> Bản đồ chỉ đường (Maps)
                      </a>
                   )}

                   {/* NÚT BẤM DÀNH CHO TÀI XẾ TỰ XỬ LÝ VỚI NHAU */}
                   {order.status === 'pending' && <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg flex justify-center gap-2"><Truck size={20}/> [TX CÀ MAU] NHẬN ĐI MUA</button>}
                   {order.status === 'tx1_picking' && <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg flex justify-center gap-2 border-[4px] border-blue-400"><MapPin size={20}/> [TX CÀ MAU] ĐÃ BỎ HÀNG XUỐNG TRẠM</button>}
                   
                   {order.status === 'at_midpoint' && <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg flex justify-center gap-2"><Truck size={20}/> [TX HUYỆN] ĐÃ LẤY HÀNG ĐI GIAO</button>}
                   {order.status === 'tx2_delivering' && <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg flex justify-center gap-2 border-[4px] border-green-400"><CheckCircle2 size={20}/> [TX HUYỆN] GIAO THÀNH CÔNG</button>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}