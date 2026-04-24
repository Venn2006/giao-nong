"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, Car, Bike, Users, User, Phone, Banknote, FileText, Loader2, ChevronRight, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DatXePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // THÔNG TIN KHÁCH HÀNG
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // TUYẾN ĐƯỜNG
  const hubs = ["Cà Mau (Nội ô)", "Chà Là", "Đầm Dơi", "Cái Nước"];
  const [pickupHub, setPickupHub] = useState("Cà Mau (Nội ô)");
  const [pickupAddress, setPickupAddress] = useState("");
  
  const [dropoffHub, setDropoffHub] = useState("Chà Là");
  const [dropoffAddress, setDropoffAddress] = useState("");
  
  // LOẠI XE & GIÁ
  const [vehicleType, setVehicleType] = useState("xe_may");
  const [note, setNote] = useState("");

  const vehicles = [
    { id: "xe_may", name: "Xe Máy", desc: "Tiết kiệm, nhanh chóng", price: 30000, icon: Bike, color: "text-orange-600", bg: "bg-orange-50" },
    { id: "xe_4_cho", name: "Ô tô 4 chỗ", desc: "Sang trọng, có máy lạnh", price: 150000, icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "xe_7_cho", name: "Ô tô 7 chỗ", desc: "Rộng rãi cho gia đình", price: 250000, icon: Car, color: "text-green-600", bg: "bg-green-50" },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserName(parsed.name || "");
      setUserPhone(parsed.phone || "");
      setPickupAddress(parsed.address || "");
    }
  }, []);

  const getPrice = () => {
    const v = vehicles.find(x => x.id === vehicleType);
    return v ? v.price : 30000;
  };

  const handleBookRide = async () => {
    if (!pickupAddress || !dropoffAddress || !userName || !userPhone) {
      alert("Cô/Chú điền đầy đủ Thông tin và Địa chỉ để tài xế đón tận nơi nha!");
      return;
    }

    setIsSubmitting(true);
    const orderId = "DX" + Math.floor(1000 + Math.random() * 9000);
    const currentVehicle = vehicles.find(v => v.id === vehicleType);
    
    const summary = `🚖 [ĐẶT XE] ${currentVehicle?.name} | Tuyến: ${pickupHub} ➡️ ${dropoffHub}`;
    const fullAddress = `🚩 ĐÓN: ${pickupAddress} (${pickupHub}) \n🏁 ĐẾN: ${dropoffAddress} (${dropoffHub})`;

    const newOrder = {
      order_code: orderId,
      customer_name: userName,
      customer_phone: userPhone,
      delivery_address: fullAddress,
      shipping_note: note || "Khách gọi xe ôm/taxi",
      items_summary: summary,
      total_amount: getPrice(),
      shipping_fee: getPrice(),
      payment_method: 'cash',
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    setIsSubmitting(false);
    if (error) {
      alert("Lỗi kết nối, vui lòng thử lại!");
    } else {
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER TÍCH HỢP TABS */}
      <header className="bg-white sticky top-0 z-30 shadow-sm rounded-b-3xl">
        <div className="p-4 flex items-center gap-3">
          <button onClick={() => router.push('/')} className="text-gray-900 p-2 rounded-full bg-gray-100 active:scale-95"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase">Gọi Xe Giao Nóng</h1>
            <p className="text-[10px] text-gray-500 font-bold">An toàn - Đúng giờ - Tận tâm</p>
          </div>
        </div>
        
        <div className="flex border-t border-gray-100">
           <button onClick={() => router.push('/do-an')} className="flex-1 py-3 text-center font-bold text-gray-400 hover:bg-gray-50 transition-colors">🍔 ĐỒ ĂN</button>
           <button onClick={() => router.push('/giao-hang')} className="flex-1 py-3 text-center font-bold text-gray-400 hover:bg-gray-50 transition-colors">📦 GIAO HÀNG</button>
           <button className="flex-1 py-3 text-center font-black text-green-600 border-b-[3px] border-green-600 bg-green-50/30">🚖 ĐẶT XE</button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        
        {/* LỘ TRÌNH DI CHUYỂN (UI CHUYÊN NGHIỆP) */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-md border border-gray-100">
           <div className="relative pl-8 mb-6">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-[4px] border-blue-500 bg-white z-10"></div>
              <div className="absolute left-[7px] top-5 bottom-[-24px] w-[2px] bg-gray-200 border-l-2 border-dashed border-gray-300 z-0"></div>
              
              <div className="flex gap-2 mb-2">
                 <select value={pickupHub} onChange={(e) => setPickupHub(e.target.value)} style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-1/3 p-2 rounded-xl text-xs font-bold border border-gray-200">
                   {hubs.map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
                 <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Điểm đón (Số nhà, tên đường)..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-2/3 p-2 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold placeholder:text-gray-400" />
              </div>
           </div>

           <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-[4px] border-red-500 bg-white z-10"></div>
              <div className="flex gap-2 mb-2">
                 <select value={dropoffHub} onChange={(e) => setDropoffHub(e.target.value)} style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-1/3 p-2 rounded-xl text-xs font-bold border border-gray-200">
                   {hubs.map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
                 <input type="text" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} placeholder="Điểm đến (Huyện/Xã/Thôn)..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-2/3 p-2 border border-gray-200 rounded-xl outline-red-500 text-sm font-bold placeholder:text-gray-400" />
              </div>
           </div>
        </div>

        {/* CHỌN LOẠI XE */}
        <div className="space-y-3">
          <h2 className="font-black text-gray-900 ml-2 text-sm uppercase tracking-widest">Chọn phương tiện</h2>
          {vehicles.map((v) => (
            <label key={v.id} onClick={() => setVehicleType(v.id)} className={`flex items-center justify-between p-4 rounded-3xl border-2 cursor-pointer transition-all ${vehicleType === v.id ? 'border-green-500 bg-green-50 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${v.bg} ${v.color}`}><v.icon size={28} /></div>
                <div>
                  <p className="font-black text-gray-900">{v.name}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{v.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-green-700 text-lg">{v.price.toLocaleString('vi-VN')}đ</p>
                {vehicleType === v.id && <span className="text-[9px] font-black bg-green-600 text-white px-2 py-0.5 rounded-full">ĐANG CHỌN</span>}
              </div>
            </label>
          ))}
        </div>

        {/* THÔNG TIN NGƯỜI ĐẶT */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
           <h2 className="font-black text-gray-900 text-sm flex items-center gap-2 uppercase"><User size={18} className="text-blue-500"/> Người đi xe</h2>
           <div className="grid grid-cols-2 gap-3">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tên..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="p-3 border border-gray-200 rounded-xl outline-green-500 text-sm font-bold placeholder:text-gray-400" />
              <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="SĐT..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="p-3 border border-gray-200 rounded-xl outline-green-500 text-sm font-bold placeholder:text-gray-400" />
           </div>
           <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex gap-2 items-start">
              <Info size={16} className="text-blue-600 mt-0.5" />
              <p className="text-[10px] font-bold text-blue-800">Giá trên là cước dự kiến cho quãng đường dưới 10km. Nếu đi xa hơn, tài xế sẽ thỏa thuận thêm với Cô/Chú nhé!</p>
           </div>
           <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lời nhắn cho tài xế (Vd: Tôi mặc áo khoác đỏ, đón ở cổng trường)..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-green-500 text-sm h-20 resize-none font-bold placeholder:text-gray-400"></textarea>
        </div>

      </div>

      {/* FOOTER CHỐT ĐƠN */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 max-w-md mx-auto rounded-t-3xl z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3 px-4">
           <span className="text-gray-500 font-bold text-sm uppercase">Tổng cước phí:</span>
           <span className="text-3xl font-black text-green-600">{getPrice().toLocaleString('vi-VN')}đ</span>
        </div>
        <button 
          onClick={handleBookRide} 
          disabled={isSubmitting} 
          className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-200"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'GỌI TÀI XẾ NGAY'}
        </button>
      </div>

    </div>
  );
}