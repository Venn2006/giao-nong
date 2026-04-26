"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone, Star, CheckCircle2, Motorbike, MessageSquare, Loader2, User, Receipt, Map, ClipboardList, HeartHandshake, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderTracking() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState(5); 
  const [review, setReview] = useState("");
  const [isRated, setIsRated] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const lastOrderId = localStorage.getItem("last_order_code");
    
    if (!lastOrderId) {
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', lastOrderId)
        .single();
      
      if (data) {
        setOrder(data);
        if (data.rating) setIsRated(true);
      }
    };

    fetchOrder();

    const subscription = supabase
      .channel('order_status_change')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_code=eq.${lastOrderId}` }, 
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [router]);

  const handleSendReview = async () => {
    if (!order) return;
    setIsSending(true);

    const { error } = await supabase
      .from('orders')
      .update({ rating: rating, review: review })
      .eq('id', order.id);
    
    setIsSending(false);

    if (!error) {
      setIsRated(true);
    } else {
      alert("Lỗi mạng, thử lại nha!");
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfaf1] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <h2 className="text-xl font-bold text-gray-800">Đang tìm đơn hàng của bạn...</h2>
      </div>
    );
  }

  const getStep = () => {
    if (order.status === 'pending') return 1;
    if (['tx1_picking', 'at_midpoint', 'tx2_delivering', 'assigned', 'cooking'].includes(order.status)) return 2;
    if (order.status === 'completed') return 3;
    return 0; 
  };
  const step = getStep();

  const displayShipperName = order.shipper_name || "Tài xế Giao Nóng";
  const displayShipperPhone = order.shipper_phone || "0901234567";

  // CÔNG THỨC TÍNH ĐIỂM THƯỞNG
  const diemMuaHang = Math.floor((order.total_amount || 0) / 10000);
  const diemDanhGia = 1;
  const tongDiemNhanDuoc = diemMuaHang + diemDanhGia;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans max-w-md mx-auto shadow-2xl relative overflow-x-hidden">
      
      <header className={`p-4 flex items-center gap-3 sticky top-0 z-20 transition-colors ${step === 3 ? 'bg-white shadow-sm' : 'bg-transparent absolute w-full'}`}>
        <Link href="/">
          <button className="text-gray-800 active:bg-gray-200 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <h1 className="text-xl font-black text-gray-800 drop-shadow-sm">Đơn {order.order_code}</h1>
      </header>

      <div className={`pt-20 pb-12 px-6 rounded-b-[2.5rem] transition-colors duration-700 ${
        step === 1 ? 'bg-gradient-to-b from-orange-200 to-orange-50' :
        step === 2 ? 'bg-gradient-to-b from-blue-200 to-blue-50' :
        'bg-gradient-to-b from-green-200 to-green-50'
      }`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-2 animate-in slide-in-from-bottom-2">
            {step === 1 && "Đang chờ duyệt đơn"}
            {step === 2 && "Shipper đang tới!"}
            {step === 3 && "Giao thành công!"}
          </h2>
          <p className="text-gray-600 font-medium text-sm">
            {step === 1 && "Vui lòng đợi xíu, tổng đài đang điều phối."}
            {step === 2 && "Đồ ăn nóng hổi đang trên đường giao."}
            {step === 3 && "Chúc bạn có một bữa ăn thật ngon miệng."}
          </p>
        </div>

        <div className="relative flex justify-between items-center max-w-[280px] mx-auto z-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 rounded-full -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gray-800 rounded-full -z-10 transition-all duration-700" 
               style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${step >= 1 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
            <ClipboardList size={16} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${step >= 2 ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
            <Motorbike size={16} className={step === 2 ? "animate-bounce" : ""} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        
        {/* HIỂN THỊ TÀI XẾ NẾU ĐÃ CÓ NGƯỜI NHẬN */}
        {step >= 2 && order.shipper_name && (
          <div className="bg-white p-5 rounded-[2rem] shadow-lg border border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner border-2 border-white">
                {displayShipperName.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Tài xế của bạn</p>
                <p className="font-black text-gray-800 text-base leading-none">{displayShipperName}</p>
                {step === 2 && <p className="text-xs text-blue-600 font-bold mt-1.5 flex items-center gap-1"><Motorbike size={12}/> Đang di chuyển tới bạn</p>}
              </div>
            </div>
            {step === 2 && (
              <a href={`tel:${displayShipperPhone}`} className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm">
                <Phone size={20} className="fill-green-600" />
              </a>
            )}
          </div>
        )}

        {/* KHU VỰC ĐÁNH GIÁ (CHỈ HIỆN KHI ĐÃ GIAO XONG) */}
        {step === 3 && (
          <>
            {!isRated ? (
              <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-orange-400 animate-in slide-in-from-bottom-8">
                <h3 className="text-lg font-black text-gray-800 mb-2 text-center flex items-center justify-center gap-2">
                  <HeartHandshake className="text-orange-500" /> Đánh giá trải nghiệm
                </h3>
                <p className="text-xs text-gray-500 text-center mb-6">Đánh giá để nhận <span className="font-bold text-orange-500">+1 điểm</span> thưởng Giao Nóng nhé!</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button key={num} onClick={() => setRating(num)} className="transition-transform active:scale-125 focus:outline-none">
                      <Star size={40} className={`${num <= rating ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-gray-200'} transition-colors`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Góp ý món ăn hoặc khen ngợi Shipper..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm h-24 mb-4 outline-none focus:border-orange-500 resize-none font-bold"
                />

                <button onClick={handleSendReview} disabled={isSending} className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.3)] active:scale-[0.98] transition-all flex justify-center items-center gap-2">
                  {isSending ? <Loader2 className="animate-spin" size={20} /> : "GỬI ĐÁNH GIÁ NGAY"}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 p-6 rounded-[2rem] border-2 border-green-200 text-center shadow-lg animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-black text-green-800 mb-2">Cảm ơn bạn đã đánh giá!</h3>
                <p className="text-sm text-green-600 mb-6 font-medium">Đánh giá của bạn giúp Giao Nóng ngày càng tốt hơn.</p>

                <div className="bg-white p-4 rounded-2xl border border-green-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-orange-500" size={24} />
                    <span className="font-bold text-gray-800 text-sm">Điểm nhận được:</span>
                  </div>
                  <span className="font-black text-2xl text-orange-600">+{tongDiemNhanDuoc}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 italic">*Đã bao gồm {diemMuaHang} điểm mua hàng và 1 điểm đánh giá</p>

                <Link href="/">
                  <button className="mt-6 w-full bg-green-600 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(22,163,74,0.3)] active:scale-95 transition-transform">
                    VỀ TRANG CHỦ
                  </button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* HÓA ĐƠN CHI TIẾT */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-4 relative">
          <div className="h-4 w-full bg-[radial-gradient(circle,transparent_4px,#fff_4px)] bg-[length:12px_12px] absolute top-[-6px] left-0"></div>
          
          <div className="p-5 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt size={18} className="text-orange-500" />
              <h4 className="font-black text-gray-800 text-base">Hóa đơn chi tiết</h4>
            </div>
            
            {/* FIX 1: THÊM whitespace-pre-line CHO BILL XUỐNG DÒNG MƯỢT MÀ */}
            <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Đồ ăn đã chọn</p>
              <p className="font-bold text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                {order.items_summary}
              </p>
            </div>

            {/* FIX 2: TÍNH TOÁN TRỪ PHÍ SHIP ĐỘNG THAY VÌ 15K CỨNG */}
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Tổng tiền món</span>
                <span className="font-bold text-gray-800">
                  {(order.total_amount - (order.shipping_fee || 0)).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-medium">Phí giao hàng</span>
                <span className="font-bold text-gray-800">
                  {(order.shipping_fee || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-2xl flex justify-between items-center text-white shadow-inner">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Tổng thanh toán</p>
                <p className="text-xl font-black text-orange-400">{order.total_amount?.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Thanh toán</p>
                <p className="font-bold text-sm bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                  {order.payment_method === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ĐỊA CHỈ GIAO HÀNG */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Map size={18} className="text-gray-400" />
            <h4 className="font-black text-gray-600 text-sm uppercase tracking-wider">Thông tin giao hàng</h4>
          </div>
          <div className="pl-6 space-y-2 relative">
            <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-gray-100"></div>
            
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
              <p className="text-xs text-gray-400 font-bold">Người nhận</p>
              <p className="font-bold text-gray-800 text-sm">{order.customer_name} - {order.customer_phone}</p>
            </div>
            
            <div className="relative pt-2">
              <div className="absolute -left-6 top-3 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
              <p className="text-xs text-gray-400 font-bold">Giao đến</p>
              <p className="font-bold text-gray-800 text-sm">{order.delivery_address}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}