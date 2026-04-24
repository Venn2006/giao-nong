"use client";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Loader2, 
  ChevronRight, 
  Package, 
  Car, 
  ShoppingBag, 
  Utensils,
  Truck // <--- ÁC MỘNG LÀ ĐÂY, NÃY TAO QUÊN IMPORT CÁI NÀY LÀM VERCEL NÓ CHỬI
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DonHangPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.phone) {
         setUserPhone(parsed.phone);
         fetchMyOrders(parsed.phone);
      } else {
         setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMyOrders = async (phone: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });
      
    if (data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  const goToTracking = (orderCode: string) => {
    localStorage.setItem("last_order_code", orderCode);
    router.push('/tracking');
  };

  const getStatusUI = (status: string) => {
    if (status === 'pending') {
      return { text: 'Đang chờ TX', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: Clock };
    }
    if (status === 'completed') {
      return { text: 'Đã hoàn tất', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2 };
    }
    if (status === 'cancelled') {
      return { text: 'Đã hủy', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-200', icon: XCircle };
    }
    // Các trạng thái đang giao (tx1_picking, at_midpoint, tx2_delivering)
    return { text: 'Đang thực hiện', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: Truck }; 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex justify-center items-center max-w-md mx-auto shadow-2xl">
        <Loader2 className="animate-spin text-orange-600" size={40}/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      
      <header className="bg-white p-4 sticky top-0 z-20 shadow-sm rounded-b-2xl flex items-center gap-3">
        <button 
          onClick={() => router.push('/')} 
          className="p-2 rounded-full bg-gray-100 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Lịch sử đơn hàng</h1>
          <p className="text-xs font-bold text-gray-500">SĐT: {userPhone || "Chưa cập nhật"}</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
           <div className="text-center bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm mt-10">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Package size={40} className="text-gray-300" />
              </div>
              <h2 className="font-black text-gray-900 text-lg mb-2">Chưa có đơn hàng nào!</h2>
              <p className="text-sm font-bold text-gray-500 mb-6 leading-relaxed">
                Cô/Chú chưa đặt món đồ ăn hay sử dụng dịch vụ nào trên Giao Nóng cả.
              </p>
              <button 
                onClick={() => router.push('/')} 
                className="w-full bg-orange-600 text-white font-black px-6 py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-orange-200"
              >
                VỀ TRANG CHỦ ĐẶT ĐƠN NGAY
              </button>
           </div>
        ) : (
          orders.map((order) => {
            const statusUI = getStatusUI(order.status);
            
            // Trí tuệ nhận diện icon dịch vụ cho Khách hàng thấy
            const summaryText = order.items_summary || "";
            const isPackage = summaryText.includes('GIAO HÀNG');
            const isRide = summaryText.includes('ĐẶT XE');
            const isErrand = summaryText.includes('MUA HỘ');
            const isFood = !isPackage && !isRide && !isErrand;

            return (
              <div key={order.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-200">
                
                {/* DÒNG 1: MÃ ĐƠN VÀ STATUS */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <p className="font-black text-lg text-gray-900">{order.order_code}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border-2 flex items-center gap-1 ${statusUI.bg} ${statusUI.color}`}>
                    <statusUI.icon size={12} /> {statusUI.text}
                  </span>
                </div>
                
                {/* DÒNG 2: NỘI DUNG MUA GÌ */}
                <div className="flex items-center gap-3 mb-4">
                   <div className={`p-3 rounded-2xl shadow-inner ${
                     isPackage ? 'bg-blue-50 text-blue-600' : 
                     isRide ? 'bg-green-50 text-green-600' : 
                     isErrand ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                   }`}>
                     {isPackage ? <Package size={24}/> : 
                      isRide ? <Car size={24}/> : 
                      isErrand ? <ShoppingBag size={24}/> : <Utensils size={24}/>}
                   </div>
                   <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">
                     {order.items_summary}
                   </p>
                </div>

                {/* DÒNG 3: TỔNG TIỀN VÀ NÚT XEM TRACKING */}
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Thành tiền</p>
                    <p className="text-xl font-black text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
                  </div>
                  
                  {/* BẤM VÀO ĐÂY ĐỂ BAY QUA TRANG TRACKING XEM ĐƯỜNG ĐI CỦA ĐƠN HÀNG */}
                  <button 
                    onClick={() => goToTracking(order.order_code)} 
                    className="bg-gray-900 text-white font-black text-xs px-5 py-3 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    THEO DÕI ĐƠN <ChevronRight size={14}/>
                  </button>
                </div>
                
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}