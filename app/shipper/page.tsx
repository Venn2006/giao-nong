"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  RefreshCw, 
  User, 
  CheckCircle2, 
  ClipboardList, 
  Truck, 
  XCircle, 
  Banknote, 
  QrCode, 
  Navigation, 
  Package, 
  Car, 
  AlertTriangle, 
  ShoppingBag,
  Calendar
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ShipperApp() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeRoute, setActiveRoute] = useState("Tất cả");
  const routes = ["Tất cả", "Cà Mau (Nội ô)", "Chà Là", "Đầm Dơi", "Cái Nước"];

  // STATE LỌC THỜI GIAN
  const [dateFilter, setDateFilter] = useState("today");
  const dateFilters = [
    { id: "today", label: "Hôm nay" },
    { id: "week", label: "7 ngày qua" },
    { id: "month", label: "Tháng này" },
    { id: "year", label: "Năm nay" },
    { id: "all", label: "Tất cả" }
  ];

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
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => fetchOrders()
      )
      .subscribe();
      
    return () => { 
      supabase.removeChannel(sub); 
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
  };

  // NÃO THỜI GIAN
  const isWithinDateRange = (dateString: string, filter: string) => {
    if (!dateString) return false;
    const orderDate = new Date(new Date(dateString).toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));

    if (filter === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (filter === 'week') {
      const diffTime = now.getTime() - orderDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (filter === 'month') {
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }
    if (filter === 'year') {
      return orderDate.getFullYear() === now.getFullYear();
    }
    return true; 
  };

  // LỌC ĐƠN HÀNG DỰA THEO THỜI GIAN ĐÃ CHỌN
  let filteredByDateOrders = orders.filter(o => {
    if (dateFilter === 'today') {
      const isActive = ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering'].includes(o.status);
      return isActive || isWithinDateRange(o.created_at, 'today');
    }
    return isWithinDateRange(o.created_at, dateFilter);
  });

  // LỌC TIẾP THEO TUYẾN ĐƯỜNG ĐÃ CHỌN
  if (activeRoute !== "Tất cả") {
    filteredByDateOrders = filteredByDateOrders.filter(o => {
      const address = (o.delivery_address || "").toLowerCase();
      if (activeRoute === "Cà Mau (Nội ô)") return address.includes("cà mau") || address.includes("ca mau") || address.includes("phường");
      if (activeRoute === "Chà Là") return address.includes("chà là") || address.includes("cha la");
      if (activeRoute === "Đầm Dơi") return address.includes("đầm dơi") || address.includes("dam doi");
      if (activeRoute === "Cái Nước") return address.includes("cái nước") || address.includes("cai nuoc");
      return true;
    });
  }

  const activeOrders = filteredByDateOrders.filter(o => 
    ['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering'].includes(o.status)
  );

  const completedFiltered = filteredByDateOrders.filter(o => o.status === 'completed');
  
  const cashToSubmit = completedFiltered
    .filter(o => o.payment_method === 'cash' || o.payment_method === 'cash_sender' || o.payment_method === 'cash_receiver')
    .reduce((sum, o) => sum + o.total_amount, 0);
    
  const bankToBoss = completedFiltered
    .filter(o => o.payment_method === 'bank')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const getFilterLabel = () => dateFilters.find(d => d.id === dateFilter)?.label || "Hôm nay";

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER TÀI XẾ */}
      <header className="bg-blue-600 p-5 sticky top-0 z-30 shadow-md rounded-b-[2rem]">
        <div className="flex justify-between items-center text-white mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">APP TÀI XẾ</h1>
            <p className="text-sm font-medium text-blue-100 mt-1">Đang có {activeOrders.length} đơn chờ xử lý</p>
          </div>
          <button 
            onClick={fetchOrders} 
            className="bg-white/20 p-3 rounded-xl active:scale-95 border border-white/30"
          >
            <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        {/* THANH CHỌN BỘ LỌC THỜI GIAN */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
          <div className="bg-white/10 p-2 rounded-xl text-blue-100 mr-1 flex-shrink-0">
            <Calendar size={16} />
          </div>
          {dateFilters.map(f => (
            <button 
              key={f.id} 
              onClick={() => setDateFilter(f.id)} 
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black border transition-colors ${
                dateFilter === f.id ? 'bg-white text-blue-700 border-white shadow-md' : 'bg-transparent text-blue-100 border-blue-400/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* THANH CHỌN TUYẾN */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x mt-2">
          {routes.map(r => (
            <button 
              key={r} 
              onClick={() => setActiveRoute(r)} 
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-xl text-sm font-black border-2 transition-colors ${
                activeRoute === r ? 'bg-blue-800 text-white border-blue-800 shadow-md' : 'bg-blue-700/50 text-blue-100 border-blue-400/30'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-5 -mt-2">
        
        {/* BÁO CÁO CHỐT CA */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
           <h2 className="text-sm font-black text-blue-700 flex items-center gap-2 mb-4 uppercase tracking-wider">
             <ClipboardList size={18}/> Chốt Ca {getFilterLabel()} {activeRoute !== 'Tất cả' ? `(${activeRoute})` : ''}
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
                  <QrCode size={14} className="text-green-500"/> Khách CK Boss
                </p>
                <p className="text-xl font-black text-green-700">{bankToBoss.toLocaleString('vi-VN')}đ</p>
              </div>
           </div>
           
           <div className="bg-gray-900 p-4 rounded-xl flex justify-between items-center text-white shadow-md">
              <p className="text-xs font-black uppercase tracking-wider">Doanh Thu {getFilterLabel()}</p>
              <p className="text-2xl font-black text-yellow-400">{(cashToSubmit + bankToBoss).toLocaleString('vi-VN')}đ</p>
           </div>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG */}
        <div className="space-y-5">
          {filteredByDateOrders.length === 0 ? (
             <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-4">
                <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
                <p className="font-black text-gray-800">Chưa có đơn nào trong {getFilterLabel().toLowerCase()}!</p>
             </div>
          ) : (
            filteredByDateOrders.map((order) => {
              
              const summaryText = order.items_summary || "";
              const isPackage = summaryText.includes('GIAO HÀNG');
              const isRide = summaryText.includes('ĐẶT XE');
              const isErrand = summaryText.includes('MUA HỘ');
              const isFood = !isPackage && !isRide && !isErrand;

              return (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-[2rem] p-5 shadow-md border-2 ${
                    isPackage ? 'border-blue-200' : 
                    isRide ? 'border-green-200' : 
                    isErrand ? 'border-purple-200' : 'border-gray-200'
                  }`}
                >
                  
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
                          
                         {isPackage ? 'KIỆN HÀNG GOM TUYẾN' : 
                          isRide ? 'GỌI XE ÔM' : 
                          isErrand ? 'ĐƠN MUA HỘ ĐA NĂNG' : 'ĐỒ ĂN/NƯỚC NÓNG'}
                       </p>
                     </div>
                     
                     <div className="flex flex-col items-end gap-1">
                       <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black border-2 uppercase text-center min-w-[130px] max-w-[130px] leading-tight ${
                          order.status === 'pending' ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 
                          order.status === 'tx1_picking' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          order.status === 'at_midpoint' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          order.status === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                          order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                       }`}>
                         {order.status === 'pending' && '🔴 ĐANG CHỜ TÀI XẾ'}
                         {order.status === 'tx1_picking' && (isPackage ? '📦 ĐANG GOM LÊN XE' : isErrand ? '🛍️ ĐANG MUA HÀNG' : '🛵 ĐANG MUA TẠI QUÁN')}
                         {order.status === 'at_midpoint' && '📍 ĐANG GẶP NHAU Ở BỜ ĐẬP'}
                         {order.status === 'tx2_delivering' && (isPackage ? '🚚 ĐANG CHẠY TUYẾN' : isRide ? '🚖 ĐANG CHỞ KHÁCH' : '🛵 ĐANG ĐI GIAO KHÁCH')}
                         {order.status === 'completed' && '✅ ĐÃ GIAO XONG'}
                         {order.status === 'cancelled' && '❌ ĐÃ HỦY ĐƠN'}
                       </span>
                       <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                         {new Date(order.created_at).toLocaleDateString('vi-VN')}
                       </span>
                     </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                     <div className="flex items-center gap-2 text-base font-black text-gray-900 ml-1">
                       <User size={20} className="text-gray-400" /> KH: {order.customer_name}
                     </div>
                     
                     <a 
                       href={`tel:${order.customer_phone}`} 
                       className="flex justify-between items-center bg-gray-50 text-gray-800 p-4 rounded-2xl text-base font-black border-2 border-gray-200 active:bg-gray-100 transition-colors"
                     >
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
                     <p className="text-xs font-black text-yellow-700 uppercase tracking-widest mb-2 border-b border-yellow-300 pb-2">
                       Nội dung đơn:
                     </p>
                     <p className="text-sm font-black text-gray-900 leading-relaxed whitespace-pre-line">
                       {order.items_summary}
                     </p>
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

                  {/* NÚT ĐIỀU PHỐI (CHỈ HIỆN KHI ĐƠN CÒN ĐANG CHẠY) */}
                  {['pending', 'tx1_picking', 'at_midpoint', 'tx2_delivering'].includes(order.status) && (
                    <div className="space-y-3 mt-2">
                      
                      {order.gps_location && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.gps_location)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center gap-2 bg-gray-100 text-blue-700 font-black w-full py-4 rounded-xl active:scale-95 text-sm uppercase border-2 border-gray-300 transition-colors"
                          >
                            <Navigation size={20} className="fill-blue-700" /> Mở Bản Đồ Chỉ Đường
                          </a>
                      )}

                      {/* LUỒNG ĐỒ ĂN */}
                      {isFood && (
                        <>
                          {order.status === 'pending' && (
                            <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                              <Truck className="inline mr-2" size={20}/> [TX TUYẾN 1] NHẬN ĐI MUA ĐỒ
                            </button>
                          )}
                          {order.status === 'tx1_picking' && (
                            <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-blue-400">
                              <MapPin className="inline mr-2" size={20}/> [TX TUYẾN 1] CHẠY ĐẾN BỜ ĐẬP ĐỔI HÀNG
                            </button>
                          )}
                          {order.status === 'at_midpoint' && (
                            <div className="space-y-2">
                              <p className="text-xs text-red-600 font-bold text-center flex items-center justify-center gap-1"><AlertTriangle size={14}/> 2 Tài xế gặp nhau tại Bờ Đập đổi chéo hàng!</p>
                              <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                                <Truck className="inline mr-2" size={20}/> [TX TUYẾN 2] ĐÃ NHẬN CHUYỂN GIAO, ĐI GIAO
                              </button>
                            </div>
                          )}
                          {order.status === 'tx2_delivering' && (
                            <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                              <CheckCircle2 className="inline mr-2" size={20}/> [TX TUYẾN 2] GIAO KHÁCH THÀNH CÔNG
                            </button>
                          )}
                        </>
                      )}

                      {/* LUỒNG GIAO HÀNG */}
                      {isPackage && (
                        <>
                          {order.status === 'pending' && (
                            <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                              <Package className="inline mr-2" size={20}/> [TX TUYẾN 1] GOM KIỆN HÀNG NÀY LÊN XE
                            </button>
                          )}
                          {order.status === 'tx1_picking' && (
                            <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-blue-400">
                              <MapPin className="inline mr-2" size={20}/> [TX TUYẾN 1] CHẠY ĐẾN BỜ ĐẬP ĐỔI HÀNG
                            </button>
                          )}
                          {order.status === 'at_midpoint' && (
                            <div className="space-y-2">
                              <p className="text-xs text-red-600 font-bold text-center flex items-center justify-center gap-1"><AlertTriangle size={14}/> 2 Tài xế gặp nhau tại Bờ Đập đổi chéo hàng!</p>
                              <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg">
                                <Truck className="inline mr-2" size={20}/> [TX TUYẾN 2] ĐÃ NHẬN CHUYỂN GIAO, ĐI GIAO
                              </button>
                            </div>
                          )}
                          {order.status === 'tx2_delivering' && (
                            <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                              <CheckCircle2 className="inline mr-2" size={20}/> [TX TUYẾN 2] ĐÃ GIAO KIỆN NÀY THÀNH CÔNG
                            </button>
                          )}
                        </>
                      )}

                      {/* LUỒNG ĐẶT XE */}
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

                      {/* LUỒNG MUA HỘ */}
                      {isErrand && (
                        <>
                          {order.status === 'pending' && (
                            <button onClick={() => updateStatus(order.id, 'tx1_picking')} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-purple-400">
                              <ShoppingBag className="inline mr-2" size={20}/> [TX TUYẾN 1] NHẬN ĐI MUA HỘ ĐƠN NÀY
                            </button>
                          )}
                          {order.status === 'tx1_picking' && (
                            <button onClick={() => updateStatus(order.id, 'at_midpoint')} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-purple-400">
                              <MapPin className="inline mr-2" size={20}/> [TX TUYẾN 1] CHẠY ĐẾN BỜ ĐẬP ĐỔI HÀNG
                            </button>
                          )}
                          {order.status === 'at_midpoint' && (
                            <div className="space-y-2">
                              <p className="text-xs text-purple-600 font-bold text-center flex items-center justify-center gap-1"><AlertTriangle size={14}/> 2 Tài xế gặp nhau tại Bờ Đập đổi chéo hàng!</p>
                              <button onClick={() => updateStatus(order.id, 'tx2_delivering')} className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-orange-400">
                                <Truck className="inline mr-2" size={20}/> [TX TUYẾN 2] ĐÃ NHẬN CHUYỂN GIAO, ĐI GIAO
                              </button>
                            </div>
                          )}
                          {order.status === 'tx2_delivering' && (
                            <button onClick={() => updateStatus(order.id, 'completed')} className="w-full bg-green-600 text-white font-black py-5 rounded-2xl text-base active:scale-95 shadow-lg border-[4px] border-green-400">
                              <CheckCircle2 className="inline mr-2" size={20}/> [TX TUYẾN 2] GIAO KHÁCH THÀNH CÔNG
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}