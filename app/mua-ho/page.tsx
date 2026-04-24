"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, ShoppingBag, Store, User, Phone, Banknote, FileText, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function MuaHoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // THÔNG TIN KHÁCH HÀNG
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  // THÔNG TIN MUA HỘ
  const [buyList, setBuyList] = useState("");
  const [storeName, setStoreName] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  const serviceFee = 20000; // Phí mua hộ + Ship mặc định 20k

  useEffect(() => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserName(parsedUser.name || "");
      setUserPhone(parsedUser.phone || "");
      setDeliveryAddress(parsedUser.address || "");
    }
  }, []);

  const handleCreateOrder = async () => {
    if (!buyList || !deliveryAddress || !userName || !userPhone) {
      alert("Cô/Chú điền đầy đủ 'Món cần mua' và 'Địa chỉ nhận hàng' nha!");
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: userName, phone: userPhone, address: deliveryAddress }));

    const orderId = "MH" + Math.floor(1000 + Math.random() * 9000); 
    
    const storeText = storeName ? `Mua tại: ${storeName}` : 'Mua ở đâu cũng được';
    const estText = estimatedPrice ? `| Tiền hàng dự kiến: ${parseInt(estimatedPrice).toLocaleString('vi-VN')}đ` : '| Khách chưa báo tiền hàng';
    
    // Gắn tag MUA HỘ ĐA NĂNG
    const summary = `🛍️ [MUA HỘ ĐA NĂNG] \n- Món cần mua: ${buyList} \n- ${storeText} ${estText}`;
    const fullAddress = `📍 GIAO ĐẾN: ${deliveryAddress}`;

    const newOrder = {
      order_code: orderId,
      customer_name: userName,
      customer_phone: userPhone,
      delivery_address: fullAddress,
      shipping_note: "Tài xế sẽ ứng tiền mua đồ trước, Khách thanh toán sau khi nhận hàng.",
      items_summary: summary,
      total_amount: serviceFee, // Tạm tính bằng phí dịch vụ
      shipping_fee: serviceFee,
      payment_method: 'cash',
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    setIsSubmitting(false);
    if (error) {
      alert("Lỗi mạng, vui lòng thử lại!");
    } else {
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-28 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER TÍM XỊN XÒ */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-500 p-4 sticky top-0 z-20 shadow-md rounded-b-[2rem]">
        <div className="flex items-center gap-3 text-white mb-2">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/20 active:scale-95"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Mua Hộ Đa Năng</h1>
            <p className="text-xs font-medium text-purple-100 mt-0.5">Thuốc tây, tạp hóa, đi chợ... Cứ để đó!</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 -mt-4 relative z-10">
        
        {/* NỘI DUNG MUA HỘ */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-200">
           <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
             <ShoppingBag size={20} className="text-purple-600"/>
             <h2 className="font-black text-gray-900 text-sm uppercase tracking-wider">Cần Giao Nóng mua gì?</h2>
           </div>
           
           <div className="space-y-4">
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Món đồ cần mua (*)</p>
               <textarea value={buyList} onChange={(e) => setBuyList(e.target.value)} placeholder="Vd: 2 vỉ Panadol xanh, 1 chai dầu gió, nửa ký thịt ba rọi..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-4 border border-gray-200 rounded-2xl outline-purple-500 text-sm h-28 resize-none font-bold placeholder:text-gray-400"></textarea>
             </div>
             
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Store size={12}/> Gợi ý tiệm mua (Nếu có)</p>
               <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Vd: Nhà thuốc Ngọc Ánh ở đầu hẻm..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-purple-500 text-sm font-bold placeholder:text-gray-400" />
             </div>
             
             <div>
               <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Banknote size={12}/> Dự kiến tiền hàng (Để TX đem đủ tiền)</p>
               <input type="number" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} placeholder="Vd: 150000" style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-purple-500 text-sm font-bold placeholder:text-gray-400" />
             </div>
           </div>
        </div>

        {/* THÔNG TIN GIAO HÀNG */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-200">
           <h2 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2"><MapPin size={18} className="text-red-500"/> Giao hàng đến đâu?</h2>
           <div className="space-y-3">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tên Cô/Chú..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-purple-500 text-sm font-bold placeholder:text-gray-400" />
              <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="Số điện thoại..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-purple-500 text-sm font-bold placeholder:text-gray-400" />
              <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Địa chỉ chi tiết (Số nhà, tên đường)..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-purple-500 text-sm font-bold placeholder:text-gray-400" />
           </div>

           <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100 flex gap-2 items-start mt-4">
              <Info size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] font-bold text-purple-800 leading-relaxed">Tài xế sẽ tự động ứng tiền mua đồ trước. Khi nhận hàng, Cô/Chú vui lòng thanh toán <strong>Tiền đồ + Tiền Ship ({serviceFee.toLocaleString('vi-VN')}đ)</strong> cho Tài xế nha.</p>
           </div>
        </div>

      </div>

      {/* THANH CHỐT ĐƠN Ở ĐÁY */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 max-w-md mx-auto rounded-t-3xl z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3 px-2">
           <span className="text-gray-500 font-bold text-sm">Phí chạy mua hộ:</span>
           <span className="text-2xl font-black text-purple-600">{serviceFee.toLocaleString('vi-VN')}đ</span>
        </div>
        <button 
          onClick={handleCreateOrder} 
          disabled={isSubmitting} 
          className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-purple-200"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'TÌM TÀI XẾ MUA HỘ'}
        </button>
      </div>
    </div>
  );
}