"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, RefreshCw, User, CheckCircle2, 
  ClipboardList, Truck, XCircle, Banknote, QrCode, 
  Navigation, Package, Car, AlertTriangle, ShoppingBag 
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) {
        setOrders(data);
      }
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
      
    return () => { 
      supabase.removeChannel(sub); 
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  };

  const vnTime = new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"});
  const todayObj = new Date(vnTime);
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  let todayOrders = orders.filter(o => 
    o.created_at.startsWith(todayStr) && 
    ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering', 'completed', 'cancelled'].includes(o.status)
  );

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

  const activeOrders = todayOrders.filter(o => ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering'].includes(o.status));

  const completedOrders = todayOrders.filter(o => o.status === 'completed');
  
  const cashToSubmit = completedOrders
    .filter(o => o.payment_method === 'cash' || o.payment_method === 'cash_sender' || o.payment_method === 'cash_receiver')
    .reduce((sum, o) => sum + o.total_amount, 0);
    
  const bankToBoss = completedOrders
    .filter(o => o.payment_method === 'bank')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      
      <header className="bg-blue-600 p-5 sticky top-0 z-30 shadow-md rounded-b-[2rem]">
        <div className="flex justify-between items-center text-white mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">APP TÀI XẾ</h1>
            <p className="text-sm font-medium text-blue-100 mt-1">Đang có {activeOrders.length} đơn trên tuyến này</p>
          </div>
          <button onClick={fetchOrders} className="bg-white/20 p-3 rounded-xl active:scale-95 border border-white/30">
            <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {routes.map(r => (
            <button 
              key={r} 
              onClick={() => setActiveRoute(r)} 
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-black border-2 transition-colors ${
                activeRoute === r ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-blue-700/50 text-blue-100 border-blue-400/30'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-5 -mt-2">
        
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
           <h2 className="text-sm font-black text-blue-700 flex items-center gap-2 mb-4 uppercase tracking-wider">
             <ClipboardList size={18}/> Chốt Ca {activeRoute !== 'Tất cả' ? `(${activeRoute})` : ''}
           </h2>
           
           <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <p className="text-[11px] font-black text-gray-600 uppercase flex items-center gap-1 mb-2">
                  <Banknote size={14} className="text-orange-500"/> Tiền mặt giữ
                </p>
                <p className="text-xl font-black text-orange-700">{cashToSubmit.toLocaleString('vi-VN')}đ</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <p className="text-[11px] font-black text-gray-600 uppercase flex items-center gap-1 mb-2">
                  <QrCode size={14} className="text-green-500"/> Khách CK (Boss)
                </p>
                <p className="text-xl font-black text-green-700">{bankToBoss.toLocaleString('vi-VN')}đ</p>
              </div>
           </div>
           
           <div className="bg-gray-900 p-4 rounded-xl flex justify-between items-center text-white shadow-md">
              <p className="text-xs font-black uppercase tracking-wider">Tổng Doanh Thu</p>
              <p className="text-2xl font-black text-yellow-400">{(cashToSubmit + bankToBoss).toLocaleString('vi-VN')}đ</p>
           </div>
        </div>

        <div className="space-y-5">
          {activeOrders.length === 0 ? (
             <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-4">
                <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
                <p className="font-black text-gray-800">Tuyệt vời, tuyến này đang sạch đơn!</p>
             </div>
          ) : (
            activeOrders.map((order) => {
              
              // TRÍ TUỆ NHÂN TẠO: NHẬN DIỆN ĐỦ 4 LOẠI ĐƠN HÀNG
              const summaryText = order.items_summary || "";
              const isPackage = summaryText.includes('GIAO HÀNG');
              const isRide = summaryText.includes('ĐẶT XE');
              const isErrand = summaryText.includes('MUA HỘ');
              const isFood = !isPackage && !isRide && !isErrand;

              return (
                <div key={order.id} className={`bg-white rounded-[2rem] p-5 shadow-md border-2 ${
                  isPackage ? 'border-blue-200' : 
                  isRide ? 'border-green-200' : 
                  isErrand ? 'border-purple-200' : 'border-gray-200'
                }`}>
                  
                  <div className="flex justify-between items-start mb-5 border-b border-gray-100 pb-4">
                     <div>
                       <span className="text-2xl font-black text-gray-900">{order.order_code}</span>
                       <p className={`text-[10px] font-black mt-1 uppercase flex items-center gap-1 ${
                         isPackage ? 'text-blue-600' : 
                         isRide ? 'text-green-600' : 
                         isErrand ? 'text-purple-600' : 'text-orange-600'
                       }`}>
                         {isPackage ? <Package size={12}/> : 
                          isRide ? <Car size={12}/> : 
                          isErrand ? <ShoppingBag size={12}/> : <MapPin size={12}/>}
                          
                         {isPackage ? 'KIỆN HÀNG LIÊN HUYỆN' : 
                          isRide ? 'GỌI XE ÔM/TAXI' : 
                          isErrand ? 'ĐƠN MUA HỘ ĐA NĂNG' : 'GIAO ĐỒ ĂN/NƯỚC NÓNG'}
                       </p>
                     </div>
                     
                     <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 uppercase text-center max-w-[130px] leading-tight ${
                        order.status === 'pending' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 
                        order.status === 'tx1_picking' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        order.status === 'at_midpoint' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        'bg-orange-50 text-orange-700 border-orange-200'
                     }`}>
                       {order.status === 'pending' && '🔴 ĐANG CHỜ TÀI XẾ'}
                       
                       {order.status === 'tx1_picking' && (
                         isPackage ? '📦 ĐANG GOM HÀNG LÊN XE' : 
                         isErrand ? '🛍️ ĐANG ĐI MUA HÀNG' : '🛵 ĐANG MUA TẠI QUÁN'
                       )}
                       
                       {order.status === 'at_midpoint' && '📍 HÀNG ĐANG NẰM Ở TRẠM'}
                       
                       {order.status === 'tx2_delivering' && (
                         isPackage ? '🚚 ĐANG CHẠY TRÊN TUYẾN' : 
                         isRide ? '🚖 ĐANG CHỞ KHÁCH' : '🛵 ĐANG GIAO ĐẾN KHÁCH'
                       )}
                     </span>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                     <div className="flex items-center gap-2 text-base font-black text-gray-900 ml-1">
                       <User size={20} className="text-gray-400" /> KH: {order.customer_name}
                     </div>
                     
                     <a href={`tel:${order.customer_phone}`} className="flex justify-between items-center bg-gray-50 text-gray-800 p-4 rounded-2xl text-base font-black border-2 border-gray-200 active:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <Phone size={20} className="text-blue-600"/> {order.customer_phone}
                        </div>
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg">GỌI NGAY</span>
                     </a>
                     
                     <div className="flex items-start gap-2 bg-gray-50 text-gray-900 p-4 rounded-2xl text-sm font-bold border-2 border-gray-200">
                        <MapPin size={20} className="text-red-500 mt-0.5 flex-shrink-0" /> 
                        <span className="leading-relaxed whitespace-pre-line">{order.delivery_address}</span>
                     </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-200 mb-5">
                     <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-2 border-b border-yellow-300 pb-2">Nội dung đơn:</p>
                     <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-line">{order.items_summary}</p>
                     {order.shipping_note && (
                       <p className="text-sm font-black text-red-600 mt-3 bg-white p-3 rounded-xl border border-red-200 shadow-sm">
                         Lưu ý: {order.shipping_note}
                       </p>
                     )}
                  </div>

                  <div className="bg-gray-900 p-5 rounded-2xl flex justify-between items-center text-white mb-5 shadow-lg border-2 border-gray-700">
                     <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cần thu tiền</p>
                        <p className="text-4xl font-black text-yellow-400">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                     </div>
                     <span className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-inner text-right ${
                       order.payment_method === 'bank' ? 'bg-green-600 text-white' : 'bg-white text-gray-900'
                     }`}>
                       {order.payment_method === 'bank' ? '🏦 KHÁCH ĐÃ CK' : 
                        order.payment_method === 'cash_sender' ? '💵 THU NGƯỜI GỬI' : 
                        order.payment_method === 'cash_receiver' ? '💵 THU NGƯỜI NHẬN' : '💵 THU TIỀN MẶT'}
                     </span>
                  </div>

                  <div className="space-y-3 mt-2">
                     
                     {order.gps_location && (
                        <a 
                          href={`http://googleusercontent.com/maps.google.com/maps?daddr=${order.gps_location}&travelmode=driving`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center gap-2 bg-gray-100 text-blue-700 font-black w-full py-4 rounded-xl active:scale-95 text-sm uppercase border-2 border-gray-300 transition-colors"
                        >
                          <Navigation size={20} className="fill-blue-700" /> Mở Google Maps
                        </a>
                     )}

                     {/* LUỒNG 1: ĐỒ ĂN (CHẠY TIẾP SỨC BỜ ĐẬP) */}
                     {isFood && (
                       <>
                         {order.status === 'pending' && (
                           <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                             <Truck className="inline mr-2" size={20}/> [TX CÀ MAU] NHẬN ĐI MUA ĐỒ
                           </button>
                         )}
                         
                         {order.status === 'tx1_picking' && (
                           <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-blue-400">
                             <MapPin className="inline mr-2" size={20}/> [TX CÀ MAU] XUẤT PHÁT ĐI BỜ ĐẬP
                           </button>
                         )}
                         
                         {order.status === 'at_midpoint' && (
                           <div className="space-y-2">
                             <p className="text-xs text-red-600 font-bold text-center flex items-center justify-center gap-1">
                               <AlertTriangle size={14}/> TX Cà Mau đang chạy xuống, ra lấy lẹ đi!
                             </p>
                             <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                               <Truck className="inline mr-2" size={20}/> [TX HUYỆN] ĐÃ NHẬN HÀNG, ĐI GIAO
                             </button>
                           </div>
                         )}
                         
                         {order.status === 'tx2_delivering' && (
                           <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                             <CheckCircle2 className="inline mr-2" size={20}/> [TX HUYỆN] GIAO KHÁCH THÀNH CÔNG
                           </button>
                         )}
                       </>
                     )}

                     {/* LUỒNG 2: GIAO HÀNG KIỆN (CHẠY GOM CHÀNH XE) */}
                     {isPackage && (
                       <>
                         {order.status === 'pending' && (
                           <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                             <Package className="inline mr-2" size={20}/> [TX TRẠM] GOM KIỆN HÀNG NÀY LÊN XE
                           </button>
                         )}
                         
                         {order.status === 'tx1_picking' && (
                           <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-orange-400">
                             <Truck className="inline mr-2" size={20}/> [TX TRẠM] XE XUẤT BẾN - ĐI GIAO HÀNG
                           </button>
                         )}
                         
                         {order.status === 'tx2_delivering' && (
                           <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                             <CheckCircle2 className="inline mr-2" size={20}/> [TX TRẠM] ĐÃ GIAO XONG KIỆN NÀY
                           </button>
                         )}
                       </>
                     )}

                     {/* LUỒNG 3: ĐẶT XE (ĐÓN VÀ CHỞ KHÁCH) */}
                     {isRide && (
                       <>
                         {order.status === 'pending' && (
                           <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                             <Car className="inline mr-2" size={20}/> [TÀI XẾ] NHẬN CUỐC, ĐẾN ĐÓN KHÁCH
                           </button>
                         )}
                         
                         {order.status === 'tx2_delivering' && (
                           <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                             <CheckCircle2 className="inline mr-2" size={20}/> [TÀI XẾ] HOÀN THÀNH CUỐC XE
                           </button>
                         )}
                       </>
                     )}

                     {/* LUỒNG 4: MUA HỘ ĐA NĂNG (MỚI BỔ SUNG) */}
                     {isErrand && (
                       <>
                         {order.status === 'pending' && (
                           <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-purple-400">
                             <ShoppingBag className="inline mr-2" size={20}/> [TX] NHẬN ĐI MUA HỘ ĐƠN NÀY
                           </button>
                         )}
                         
                         {order.status === 'tx1_picking' && (
                           <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-orange-400">
                             <Truck className="inline mr-2" size={20}/> [TX] ĐÃ MUA XONG, ĐANG ĐI GIAO
                           </button>
                         )}
                         
                         {order.status === 'tx2_delivering' && (
                           <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                             <CheckCircle2 className="inline mr-2" size={20}/> [TX] GIAO KHÁCH THÀNH CÔNG
                           </button>
                         )}
                       </>
                     )}

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}