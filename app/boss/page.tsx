"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, Receipt, RefreshCw, CheckCircle2, AlertCircle, 
  Motorbike, Headset, Wallet, Banknote, QrCode, TrendingUp, 
  DollarSign, Store, PiggyBank, Target, BarChart3, Layers, ShieldCheck, User 
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

  const assignShipper = async (id: string) => {
    await supabase.from('orders').update({ 
      status: 'assigned', 
      shipper_name: "Anh Văn Giao Nóng", 
      shipper_phone: "0901234567" 
    }).eq('id', id);
  };

  // =========================================================
  // LOGIC TÀI CHÍNH & KPI CHUYÊN NGHIỆP
  // =========================================================
  const today = new Date().toISOString().split('T')[0];
  const completedToday = orders.filter(o => o.status === 'completed' && o.created_at.startsWith(today));
  
  let gmv = 0;
  let totalShippingRevenue = 0;
  let totalFoodCost = 0;

  completedToday.forEach(o => {
    const fee = o.shipping_fee || 10000;
    gmv += o.total_amount;
    totalShippingRevenue += fee;
    totalFoodCost += (o.total_amount - fee);
  });

  // Logic KPI: 100 đơn thưởng 100k
  const kpiTarget = 100;
  const currentProgress = completedToday.length;
  const isKpiMet = currentProgress >= kpiTarget;
  const kpiBonus = isKpiMet ? 100000 : 0;

  // Quyết toán tiền mặt
  const codCash = completedToday
    .filter(o => o.payment_method === 'cash')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 max-w-4xl mx-auto shadow-2xl border-x border-gray-200">
      
      {/* TOP NAV CHUẨN SAAS */}
      <header className="bg-white border-b border-gray-200 p-6 sticky top-0 z-30 flex justify-between items-center backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2.5 rounded-2xl shadow-lg shadow-orange-200">
            <Headset size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">GIAO NÓNG <span className="text-orange-600">HUB</span></h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hệ thống đang trực tuyến</p>
            </div>
          </div>
        </div>
        <button onClick={fetchOrders} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-2xl transition-all active:scale-95 border border-gray-200">
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="p-6 space-y-6">
        
        {/* ROW 1: TỔNG QUAN DÒNG TIỀN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm relative overflow-hidden group">
             <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PiggyBank size={20} />
             </div>
             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Lợi nhuận Ship (Giao Nóng)</p>
             <h3 className="text-2xl font-black text-gray-900">{totalShippingRevenue.toLocaleString('vi-VN')}đ</h3>
             <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                <TrendingUp size={12}/> +100% doanh thu ship
             </div>
          </div>

          <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm">
             <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Store size={20} />
             </div>
             <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tiền vốn trả Quán</p>
             <h3 className="text-2xl font-black text-gray-900">{totalFoodCost.toLocaleString('vi-VN')}đ</h3>
             <p className="mt-2 text-[10px] text-gray-400 font-medium">Đối soát 100% giá món</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-[2rem] shadow-xl text-white">
             <div className="bg-white/10 text-orange-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Banknote size={20} />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Thu hồi mặt (COD)</p>
             <h3 className="text-2xl font-black text-orange-400">{codCash.toLocaleString('vi-VN')}đ</h3>
             <p className="mt-2 text-[10px] text-slate-500 italic">*Shipper nộp lại 100%</p>
          </div>
        </div>

        {/* ROW 2: KPI & PERFORMANCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                     <Target className="text-red-500" /> KPI SHIPPER NGÀY
                   </h2>
                   <p className="text-xs text-gray-500 font-medium">Mục tiêu: {kpiTarget} đơn / ngày</p>
                </div>
                {isKpiMet && <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black border border-green-200">ĐÃ ĐẠT</div>}
             </div>

             <div className="space-y-4">
                <div className="flex justify-between text-sm font-black">
                   <span className="text-gray-400">Tiến độ giao</span>
                   <span className="text-orange-600">{currentProgress} / {kpiTarget} đơn</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                   <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentProgress/kpiTarget)*100, 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                      <ShieldCheck size={14} className="text-blue-500"/> Thưởng KPI: 
                   </p>
                   <p className={`text-lg font-black ${isKpiMet ? 'text-green-600' : 'text-gray-300'}`}>+ {kpiBonus.toLocaleString('vi-VN')}đ</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h2 className="font-black text-gray-800 text-lg mb-6 flex items-center gap-2">
               <BarChart3 className="text-blue-500" /> TRẠNG THÁI VẬN HÀNH
             </h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                   <p className="text-[10px] text-red-600 font-black uppercase mb-1 text-center">Chờ duyệt</p>
                   <p className="text-3xl font-black text-red-700 text-center">{orders.filter(o => o.status === 'pending').length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <p className="text-[10px] text-blue-600 font-black uppercase mb-1 text-center">Đang giao</p>
                   <p className="text-3xl font-black text-blue-700 text-center">{orders.filter(o => o.status === 'assigned').length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* ROW 3: DANH SÁCH ĐƠN HÀNG THỜI GIAN THỰC */}
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
                <Layers className="text-gray-400" /> GIÁM SÁT ĐƠN HÀNG
              </h2>
              <span className="text-[10px] bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full uppercase tracking-tighter">Cập nhật ngay lập tức</span>
           </div>
           
           <div className="divide-y divide-gray-50">
              {orders.map((order, index) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-gray-900">{order.order_code}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          order.status === 'pending' ? 'bg-red-100 text-red-600 animate-pulse' :
                          order.status === 'completed' ? 'bg-green-100 text-green-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(order.created_at).toLocaleTimeString('vi-VN')}</span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                           <User size={14} className="text-gray-400" /> {order.customer_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-orange-600">
                           <Phone size={14} /> {order.customer_phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 italic">
                           <MapPin size={14} className="text-gray-400" /> {order.delivery_address}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed font-medium">
                        <span className="font-black text-gray-400 uppercase text-[9px] block mb-1">Món ăn & Ghi chú</span>
                        {order.items_summary}
                      </div>
                    </div>

                    <div className="md:w-48 flex flex-col justify-between items-end border-l border-gray-100 pl-4">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng thu khách</p>
                        <p className="text-xl font-black text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-1">{order.payment_method === 'bank' ? '🏦 CHUYỂN KHOẢN' : '💵 TIỀN MẶT'}</p>
                      </div>

                      <div className="w-full mt-4">
                        {order.status === 'pending' && (
                          <button onClick={() => assignShipper(order.id)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-orange-100 active:scale-95">
                            DUYỆT & GIAO SHIPPER
                          </button>
                        )}
                        {['pending', 'assigned'].includes(order.status) && (
                          <button onClick={() => { if(window.confirm('Hủy đơn?')) supabase.from('orders').update({status:'cancelled'}).eq('id', order.id) }} className="w-full mt-2 text-[10px] text-gray-400 font-bold underline hover:text-red-500">
                            Hủy đơn
                          </button>
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