"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, Package, Box, Archive, User, Phone, Banknote, FileText, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function GiaoHangPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // THÔNG TIN NGƯỜI GỬI (Tự động lấy từ LocalStorage)
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  // TUYẾN ĐƯỜNG & ĐỊA CHỈ
  const hubs = ["Cà Mau (Nội ô)", "Chà Là", "Đầm Dơi", "Cái Nước"];
  const [pickupHub, setPickupHub] = useState("Cà Mau (Nội ô)");
  const [pickupAddress, setPickupAddress] = useState("");
  
  const [dropoffHub, setDropoffHub] = useState("Chà Là");
  const [dropoffAddress, setDropoffAddress] = useState("");
  
  // THÔNG TIN NGƯỜI NHẬN
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  // THÔNG TIN HÀNG HÓA
  const [packageSize, setPackageSize] = useState("nho");
  const [codAmount, setCodAmount] = useState("");
  const [note, setNote] = useState("");
  
  // THANH TOÁN
  const [paymentMethod, setPaymentMethod] = useState("cash_sender"); // cash_sender, cash_receiver, bank

  const sizes = [
    { id: "nho", name: "Hàng Nhỏ", desc: "Dưới 3kg (Túi nilon, tài liệu)", price: 10000, icon: Package },
    { id: "vua", name: "Hàng Vừa", desc: "3kg - 10kg (Thùng carton vừa)", price: 15000, icon: Box },
    { id: "lon", name: "Hàng Lớn", desc: "Trên 10kg (Cồng kềnh)", price: 20000, icon: Archive },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setSenderName(parsedUser.name || "");
      setSenderPhone(parsedUser.phone || "");
      setPickupAddress(parsedUser.address || "");
    }
  }, []);

  const getPrice = () => {
    const sizeObj = sizes.find(s => s.id === packageSize);
    return sizeObj ? sizeObj.price : 10000;
  };

  const handleCreateOrder = async () => {
    if (!pickupAddress || !dropoffAddress || !receiverName || !receiverPhone) {
      alert("Cô/Chú vui lòng điền đầy đủ Địa chỉ và Thông tin người nhận ạ!");
      return;
    }

    setIsSubmitting(true);
    
    // Lưu lại thông tin người gửi cho lần sau
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: senderName, phone: senderPhone, address: pickupAddress }));

    const orderId = "GH" + Math.floor(1000 + Math.random() * 9000); 
    const currentSize = sizes.find(s => s.id === packageSize);
    
    const codText = codAmount ? ` | Thu hộ (COD): ${parseInt(codAmount).toLocaleString('vi-VN')}đ` : '';
    const noteText = note ? ` | Ghi chú: ${note}` : '';
    const summary = `📦 [GIAO HÀNG] ${currentSize?.name}${codText}${noteText}`;
    
    const fullDeliveryAddress = `📍 LẤY: ${pickupAddress} (${pickupHub}) ➡️ 📍 GIAO: ${dropoffAddress} (${dropoffHub}) | Người nhận: ${receiverName} - ${receiverPhone}`;

    const newOrder = {
      order_code: orderId,
      customer_name: senderName,
      customer_phone: senderPhone,
      delivery_address: fullDeliveryAddress,
      shipping_note: "ĐƠN GIAO HÀNG (KIỆN HÀNG)",
      items_summary: summary,
      total_amount: getPrice(), // Chỉ tính tiền Ship
      shipping_fee: getPrice(),
      payment_method: paymentMethod,
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    setIsSubmitting(false);
    if (error) {
      alert("Lỗi mạng, vui lòng thử lại!");
    } else {
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking'); // Chuyển qua trang theo dõi đơn
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-28 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 sticky top-0 z-20 shadow-md rounded-b-[2rem]">
        <div className="flex items-center gap-3 text-white mb-2">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/20 active:scale-95"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Giao Hàng Siêu Tốc</h1>
            <p className="text-xs font-medium text-orange-100 mt-0.5">Chúng tôi sẽ giao hàng đến bất kỳ đâu!</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 -mt-4 relative z-10">
        
        {/* CARD ĐỊA CHỈ LẤY / GIAO (UI XỊN NHƯ ẢNH MÀY GỬI) */}
        <div className="bg-white p-5 rounded-[2rem] shadow-md border border-gray-100 relative">
           
           {/* Điểm Lấy */}
           <div className="relative pl-8 mb-6">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-[4px] border-blue-500 bg-white z-10"></div>
              <div className="absolute left-[7px] top-5 bottom-[-24px] w-[2px] bg-gray-200 border-l-2 border-dashed border-gray-300 z-0"></div>
              
              <div className="flex gap-2 mb-2">
                 <select value={pickupHub} onChange={(e) => setPickupHub(e.target.value)} style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-1/3 p-2 rounded-xl text-xs font-bold border border-gray-200 outline-none">
                   {hubs.map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
                 <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="Địa chỉ lấy hàng chi tiết..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-2/3 p-2 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold placeholder:text-gray-400 placeholder:font-medium" />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                 <User size={12}/> {senderName || "Tên người gửi"} • <Phone size={12}/> {senderPhone || "SĐT"}
              </div>
           </div>

           {/* Điểm Giao */}
           <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-[4px] border-red-500 bg-white z-10"></div>
              
              <div className="flex gap-2 mb-2">
                 <select value={dropoffHub} onChange={(e) => setDropoffHub(e.target.value)} style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-1/3 p-2 rounded-xl text-xs font-bold border border-gray-200 outline-none">
                   {hubs.map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
                 <input type="text" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} placeholder="Địa chỉ giao hàng chi tiết..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-2/3 p-2 border border-gray-200 rounded-xl outline-red-500 text-sm font-bold placeholder:text-gray-400 placeholder:font-medium" />
              </div>
              
              {/* Nhập Thông tin người nhận */}
              <div className="flex gap-2 mt-2">
                 <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Tên người nhận..." style={{ color: '#111827', backgroundColor: '#ffffff' }} className="w-1/2 p-2 border border-red-200 rounded-lg outline-red-500 text-sm font-bold placeholder:text-red-300" />
                 <input type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="SĐT người nhận..." style={{ color: '#111827', backgroundColor: '#ffffff' }} className="w-1/2 p-2 border border-red-200 rounded-lg outline-red-500 text-sm font-bold placeholder:text-red-300" />
              </div>
           </div>

        </div>

        {/* LOẠI HÀNG HÓA (10K - 15K - 20K) */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
           <h2 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2"><Package size={18} className="text-orange-500"/> Trọng lượng & Kích thước</h2>
           <div className="space-y-3">
             {sizes.map((s) => (
               <label key={s.id} className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition-all ${packageSize === s.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                 <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${packageSize === s.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}><s.icon size={20} /></div>
                   <div>
                     <p className="font-black text-sm text-gray-900">{s.name}</p>
                     <p className="text-[10px] font-bold text-gray-500">{s.desc}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <p className="font-black text-orange-600">{s.price.toLocaleString('vi-VN')}đ</p>
                   <input type="radio" name="size" checked={packageSize === s.id} onChange={() => setPackageSize(s.id)} className="w-4 h-4 accent-orange-600" />
                 </div>
               </label>
             ))}
           </div>
        </div>

        {/* DỊCH VỤ THÊM (THU HỘ COD & GHI CHÚ) */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
           <div>
             <h2 className="font-black text-gray-900 mb-2 text-sm flex items-center gap-2"><Banknote size={16} className="text-green-500"/> Thu hộ (COD)</h2>
             <input type="number" value={codAmount} onChange={(e) => setCodAmount(e.target.value)} placeholder="Số tiền cần thu hộ (VD: 150000)... để trống nếu không có" style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-green-500 text-sm font-bold placeholder:text-gray-400" />
           </div>
           <div>
             <h2 className="font-black text-gray-900 mb-2 text-sm flex items-center gap-2"><FileText size={16} className="text-blue-500"/> Ghi chú cho Tài xế</h2>
             <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Hàng dễ vỡ, xin gọi trước khi giao..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-blue-500 text-sm h-20 resize-none font-bold placeholder:text-gray-400"></textarea>
           </div>
        </div>

        {/* PHƯƠNG THỨC THANH TOÁN CƯỚC SHIP */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-900 mb-4 text-sm uppercase tracking-wider">Ai trả phí ship?</h2>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer ${paymentMethod === 'cash_sender' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <p className="font-bold text-sm text-gray-900">Người Gửi trả tiền mặt</p>
              <input type="radio" checked={paymentMethod === 'cash_sender'} onChange={() => setPaymentMethod('cash_sender')} className="accent-orange-600" />
            </label>
            <label className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer ${paymentMethod === 'cash_receiver' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <p className="font-bold text-sm text-gray-900">Người Nhận trả tiền mặt</p>
              <input type="radio" checked={paymentMethod === 'cash_receiver'} onChange={() => setPaymentMethod('cash_receiver')} className="accent-orange-600" />
            </label>
            <label className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer ${paymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <p className="font-bold text-sm text-gray-900">Chuyển khoản QR (Trả trước)</p>
              <input type="radio" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="accent-orange-600" />
            </label>
          </div>
        </div>

      </div>

      {/* THANH CHỐT ĐƠN Ở ĐÁY */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 max-w-md mx-auto rounded-t-3xl z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-3 px-2">
           <span className="text-gray-500 font-bold text-sm">Cước vận chuyển:</span>
           <span className="text-2xl font-black text-orange-600">{getPrice().toLocaleString('vi-VN')}đ</span>
        </div>
        <button 
          onClick={handleCreateOrder} 
          disabled={isSubmitting} 
          className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : 'TÌM TÀI XẾ GIAO HÀNG'}
        </button>
      </div>
    </div>
  );
}