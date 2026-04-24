"use client";
import { useState, useEffect } from "react";
import { Banknote, QrCode, ArrowLeft, Loader2, MapPin, Phone, User, Receipt, AlertTriangle, Info, Navigation } from "lucide-react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";

export default function CheckoutApp() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [shippingNote, setShippingNote] = useState("");

  // STATE LƯU VỊ TRÍ GPS
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCustomerName(parsedUser.name || "");
      setCustomerPhone(parsedUser.phone || "");
      setCustomerAddress(parsedUser.address || "");
    }
    const savedCart = localStorage.getItem("giao_nong_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // HÀM ÉP LẤY GPS
  const requestLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Điện thoại không hỗ trợ định vị GPS.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationError("Cô/Chú vui lòng BẤM CHO PHÉP vị trí để chống bom hàng ạ!");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const tongTienDoAn = cart.reduce((sum, item) => sum + (item.gia * item.soLuong), 0);
  const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);

  let phiShip = 10000;
  if (totalQty <= 4) phiShip = 10000;
  else if (totalQty === 5) phiShip = 15000;
  else if (totalQty === 6 || totalQty === 7) phiShip = 17000; 
  else if (totalQty === 8) phiShip = 18000;
  else if (totalQty === 9) phiShip = 19000;
  else if (totalQty === 10) phiShip = 20000;

  const isOverLimit = totalQty > 10;
  const orderTotal = cart.length > 0 ? Math.max(0, tongTienDoAn + phiShip) : 0;
  const orderId = "GN" + Math.floor(1000 + Math.random() * 9000); 

  const handleCheckout = async () => {
    if (isOverLimit || !location) return; // Khóa nếu chưa có GPS
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Cô/Chú điền giúp con thông tin nhận hàng nha!");
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: customerName, phone: customerPhone, address: customerAddress }));
    
    const monAnText = cart.map(item => `${item.soLuong}x ${item.tenMon}`).join(" | ");

    const newOrder = {
      order_code: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: customerAddress,
      shipping_note: shippingNote,
      gps_location: `${location.lat},${location.lng}`, // Lưu GPS vào database
      items_summary: monAnText,
      total_amount: orderTotal,
      shipping_fee: phiShip, 
      payment_method: paymentMethod,
      status: 'pending' 
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    setIsSubmitting(false);
    if (error) {
      alert("Lỗi mạng, kiểm tra lại database nha!");
    } else {
      localStorage.removeItem("giao_nong_cart"); 
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking');
    }
  };

  if (cart.length === 0) return <div className="p-10 text-center font-bold">Chưa có món nào.</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-28 font-sans max-w-md mx-auto shadow-2xl relative">
      <header className="bg-white p-4 flex items-center gap-3 shadow-sm sticky top-0 z-20 rounded-b-2xl">
        <button onClick={() => router.back()} className="text-gray-600 p-2 rounded-full bg-gray-50"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-gray-800">Thanh toán</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* YÊU CẦU ĐỊNH VỊ (BẮT BUỘC) */}
        <div className={`p-5 rounded-[2rem] shadow-sm border-2 transition-all ${location ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
           <h2 className={`font-black text-lg mb-3 flex items-center gap-2 ${location ? 'text-green-700' : 'text-red-700'}`}>
             <Navigation size={20} className={isLocating ? "animate-spin" : ""} /> 
             {location ? 'Đã xác nhận vị trí' : 'Xác nhận vị trí (Bắt buộc)'}
           </h2>
           
           {!location ? (
             <>
               <p className="text-xs text-red-600 font-bold mb-4">Để bảo vệ hệ thống tránh đơn ảo (bom hàng) và giúp Shipper giao chính xác, Vui lòng bật định vị GPS.</p>
               <button onClick={requestLocation} disabled={isLocating} className="w-full bg-red-600 text-white font-black py-3 rounded-xl active:scale-95 shadow-md flex justify-center items-center gap-2">
                 {isLocating ? <Loader2 className="animate-spin" size={18} /> : 'BẤM ĐỂ LẤY VỊ TRÍ GPS'}
               </button>
               {locationError && <p className="text-[10px] text-red-500 font-bold mt-2 text-center animate-pulse">{locationError}</p>}
             </>
           ) : (
             <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-green-100">
               <div className="bg-green-500 p-1.5 rounded-full text-white"><MapPin size={12}/></div>
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Tọa độ an toàn</p>
                 <p className="text-xs font-bold text-green-700">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
               </div>
             </div>
           )}
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-black text-gray-800 border-b border-gray-100 pb-3 text-lg flex items-center gap-2"><MapPin className="text-orange-500" size={20} /> Thông tin nhận hàng</h2>
          <div className="space-y-3">
            <div className="relative"><User className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tên của Cô/Chú..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium" /></div>
            <div className="relative"><Phone className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Số điện thoại..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium" /></div>
            <div className="relative"><MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} /><input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Huyện/Xã/Thôn..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium" /></div>
            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
               <div className="flex items-center gap-2 mb-2 text-orange-700"><Info size={16} /><p className="text-[11px] font-black uppercase">Chỉ đường cho Shipper (Hẻm, màu nhà...)</p></div>
               <textarea value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} placeholder="Ví dụ: Hẻm cạnh trường học, nhà cửa màu xanh lá, đối diện cây đa..." className="w-full p-3 bg-white border border-orange-200 rounded-xl outline-orange-500 h-24 resize-none text-sm font-medium"></textarea>
            </div>
          </div>
        </div>

        {/* Giỏ hàng giữ nguyên */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-800 mb-4 border-b border-gray-100 pb-3 text-lg flex items-center gap-2">
            <Receipt className="text-gray-800" size={20} /> Giỏ hàng ({totalQty} món)
          </h2>
          <div className="space-y-4 mb-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="pr-4"><h3 className="font-bold text-gray-800 text-sm flex items-start gap-2"><span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{item.soLuong}x</span> {item.tenMon}</h3><p className="text-[10px] text-gray-500 mt-1">Từ: {item.tenQuan}</p></div>
                <p className="font-black text-gray-800 text-sm">{(item.gia * item.soLuong).toLocaleString('vi-VN')}đ</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-gray-600 my-2 text-sm border-t border-dashed border-gray-200 pt-4"><span>Tiền đồ ăn (Giá gốc)</span><span>{tongTienDoAn.toLocaleString('vi-VN')}đ</span></div>
          <div className="flex justify-between text-gray-800 my-2 text-sm font-bold"><span>Phí giao nóng</span><span>{phiShip.toLocaleString('vi-VN')}đ</span></div>
          <div className="flex justify-between text-xl font-black text-orange-600 mt-4 border-t border-gray-100 pt-4"><span>Tổng cộng</span><span>{orderTotal.toLocaleString('vi-VN')}đ</span></div>
        </div>

        {/* Thanh toán giữ nguyên */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-800 mb-4 px-1 text-lg">Cách thanh toán</h2>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}><Banknote size={20} /></div><p className="font-bold text-sm">Tiền mặt</p></div>
              <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
            </label>
            <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${paymentMethod === 'bank' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}><QrCode size={20} /></div><p className="font-bold text-sm">Chuyển khoản QR</p></div>
              <input type="radio" name="payment" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
            </label>

            {paymentMethod === 'bank' && (
              <div className="mt-4 p-5 bg-orange-50/50 border-2 border-orange-200 rounded-2xl text-center shadow-inner transition-all duration-300">
                <p className="text-xs font-black text-gray-700 mb-3 uppercase tracking-wider">Quét mã để thanh toán</p>
                <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                  <img src={`https://img.vietqr.io/image/acb-260997069-compact2.png?amount=${orderTotal}&addInfo=GIAO%20NONG%20${customerPhone || "DON%20HANG"}&accountName=NGUYEN%20TRONG%20VAN`} alt="QR Thanh Toan" className="w-48 h-48 object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto rounded-t-3xl z-40">
        <button 
          onClick={handleCheckout} 
          disabled={isSubmitting || isOverLimit || !location} 
          className={`w-full text-white font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 transition-all ${(!location || isOverLimit) ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-600 to-orange-500 active:scale-[0.98]'}`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : (!location ? 'CHƯA CÓ VỊ TRÍ GPS' : (isOverLimit ? 'VƯỢT QUÁ SỐ LƯỢNG' : 'CHỐT ĐƠN NGAY'))}
        </button>
      </div>
    </div>
  );
}