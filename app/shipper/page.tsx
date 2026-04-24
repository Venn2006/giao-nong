"use client";
import { useState, useEffect } from "react";
import { MapPin, Phone, Receipt, RefreshCw, CheckCircle2, User, Wallet, Banknote, QrCode } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ShipperApp() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // LẤY ĐƠN HÀNG (CHỈ LẤY ĐƠN ĐANG GIAO HOẶC ĐÃ GIAO)
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['assigned', 'completed']) 
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.status === 'assigned') {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(e => console.log("Lỗi âm thanh"));
            fetchOrders(); 
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  // HÀM CẬP NHẬT: GHI NHẬN TÊN & SĐT SHIPPER ĐỂ KHÁCH ĐÁNH GIÁ
  const completeOrder = async (id: string) => {
    if(!window.confirm('Xác nhận đã giao hàng và thu tiền đầy đủ?')) return;

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        shipper_name: "Anh Văn Giao Nóng", // Tạm fix cứng tên Shipper
        shipper_phone: "0901234567" // SĐT của Shipper để khách gọi nếu cần
      })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed' } : o));
    } else {
      alert("Lỗi mạng, chưa cập nhật được!");
    }
  };

  // ==========================================
  // TÍNH TOÁN DOANH THU (CHỈ TÍNH ĐƠN ĐÃ GIAO HOÀN TẤT)
  // ==========================================
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  const tienMat = completedOrders
    .filter(o => o.payment_method === 'cash')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
  const chuyenKhoan = completedOrders
    .filter(o => o.payment_method === 'bank')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
  const tongDoanhThu = tienMat + chuyenKhoan;

  return (
    <div className="min-h-screen bg-slate-100 pb-10 font-sans max-w-md mx-auto shadow-2xl">
      
      <header className="bg-blue-600 p-5 sticky top-0 z-20 flex justify-between items-center shadow-md rounded-b-2xl">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            APP TÀI XẾ
          </h1>
          <p className="text-blue-200 text-xs font-medium">Bạn có {orders.filter(o => o.status === 'assigned').length} đơn cần giao</p>
        </div>
        <button onClick={fetchOrders} className="bg-blue-700 text-white p-3 rounded-xl active:scale-95 transition-all">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="p-4 space-y-4">

        {/* BẢNG BÁO CÁO CHỐT CA CHO TÀI XẾ */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
          <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Wallet size={18} className="text-blue-600"/> BÁO CÁO CHỐT CA
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
              <p className="text-[10px] text-orange-600 font-bold uppercase flex items-center gap-1 mb-1"><Banknote size={12}/> Tiền mặt (Cần nộp)</p>
              <p className="text-xl font-black text-orange-700">{tienMat.toLocaleString('vi-VN')}đ</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-2xl border border-green-100">
              <p className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1 mb-1"><QrCode size={12}/> Đã CK (Boss nhận)</p>
              <p className="text-xl font-black text-green-700">{chuyenKhoan.toLocaleString('vi-VN')}đ</p>
            </div>
            
            <div className="col-span-2 bg-slate-800 p-3 rounded-2xl text-white flex justify-between items-center">
              <p className="text-xs font-bold uppercase text-slate-300">Tổng doanh thu ({completedOrders.length} đơn)</p>
              <p className="text-lg font-black text-amber-400">{tongDoanhThu.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>

        {/* DANH SÁCH ĐƠN HÀNG */}
        {orders.map((order) => (
          <div key={order.id} className={`bg-white rounded-3xl p-5 shadow-sm border-2 ${order.status === 'assigned' ? 'border-blue-500' : 'border-gray-200 opacity-70'}`}>
            
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-3">
              <h3 className="font-black text-xl text-gray-800">{order.order_code}</h3>
              {order.status === 'assigned' ? (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black animate-pulse">CẦN GIAO GẤP</span>
              ) : (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black"><CheckCircle2 size={14} className="inline mr-1"/> ĐÃ GIAO</span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <p className="font-bold text-gray-800 flex items-center gap-2"><User size={16} className="text-blue-500"/> {order.customer_name}</p>
              
              <a href={`tel:${order.customer_phone}`} className="font-black text-blue-600 flex items-center gap-2 bg-blue-50 p-2 rounded-xl border border-blue-100 active:bg-blue-100">
                <Phone size={16} className="animate-bounce"/> {order.customer_phone} (Bấm gọi ngay)
              </a>
              
              <p className="text-gray-700 font-medium flex items-start gap-2 bg-gray-50 p-3 rounded-xl"><MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5"/> {order.delivery_address}</p>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-gray-600 text-xs uppercase mb-1">Cần mua:</p>
              <p className="font-black text-gray-800 text-sm leading-relaxed">{order.items_summary}</p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center mb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Tiền thu khách</p>
                <p className="text-2xl font-black text-amber-400">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="text-right">
                <p className={`text-xs px-2 py-1 rounded font-bold ${order.payment_method === 'bank' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {order.payment_method === 'bank' ? 'KHÁCH ĐÃ CK' : 'THU TIỀN MẶT'}
                </p>
              </div>
            </div>

            {order.status === 'assigned' && (
              <button 
                onClick={() => completeOrder(order.id)} 
                className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={24} /> GIAO THÀNH CÔNG
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}