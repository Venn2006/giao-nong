"use client";
import { useState, useEffect } from "react";
import { Banknote, QrCode, ArrowLeft, Loader2, MapPin, Phone, User, Receipt, TicketPercent, AlertTriangle } from "lucide-react";
import { supabase } from "../../lib/supabase"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutApp() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");

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

  // ==========================================
  // LOGIC TÍNH PHÍ SHIP BẬC THANG
  // ==========================================
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
  const orderTotal = cart.length > 0 ? Math.max(0, tongTienDoAn + phiShip - discount) : 0;
  const orderId = "GN" + Math.floor(1000 + Math.random() * 9000); 

  const handleCheckout = async () => {
    if (isOverLimit) return;
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Cô/Chú điền giúp con Tên, SĐT và Địa chỉ nha!");
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: customerName, phone: customerPhone, address: customerAddress }));
    
    const monAnText = cart.map(item => {
      const note = item.ghiChu ? ` [Ghi chú: ${item.ghiChu}]` : '';
      return `${item.soLuong}x ${item.tenMon} (${item.tenQuan})${note}`;
    }).join(" | ");

    const newOrder = {
      order_code: orderId,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: customerAddress,
      items_summary: monAnText,
      total_amount: orderTotal,
      shipping_fee: phiShip, 
      payment_method: paymentMethod,
      is_paid: paymentMethod === 'bank' ? true : false,
      status: 'pending' 
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    setIsSubmitting(false);
    if (error) {
      alert("Lỗi mạng, thử lại nha!");
    } else {
      localStorage.removeItem("giao_nong_cart"); 
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking');
    }
  };

  if (cart.length === 0) return <div className="p-10 text-center font-bold">Chưa có món nào trong giỏ.</div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-28 font-sans max-w-md mx-auto shadow-2xl relative">
      <header className="bg-white p-4 flex items-center gap-3 shadow-sm sticky top-0 z-20 rounded-b-2xl">
        <button onClick={() => router.back()} className="text-gray-600 p-2 rounded-full bg-gray-50"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-gray-800">Thanh toán</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Cảnh báo quá 10 món */}
        {isOverLimit && (
          <div className="bg-red-50 border-2 border-red-500 p-4 rounded-2xl flex gap-3 items-start animate-pulse">
            <AlertTriangle className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-black text-red-700">Vượt quá số lượng cho phép!</p>
              <p className="text-xs text-red-600 mt-1 font-medium">Shipper chỉ có thể chở tối đa 10 món/đơn. Vui lòng tách làm 2 đơn giúp Giao Nóng nhé.</p>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-black text-gray-800 border-b border-gray-100 pb-3 text-lg flex items-center gap-2"><MapPin className="text-orange-500" size={20} /> Thông tin nhận hàng</h2>
          <div className="space-y-3">
            <div className="relative"><User className="absolute left-3 top-3.5 text-gray-400" size={20} /><input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Họ và tên..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium" /></div>
            <div className="relative"><Phone className="absolute left-3 top-3.5 text-gray-400" size={20} /><input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Số điện thoại..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium" /></div>
            <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Địa chỉ cụ thể..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 h-20 resize-none font-medium"></textarea>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-800 mb-4 border-b border-gray-100 pb-3 text-lg flex items-center gap-2">
            <Receipt className="text-gray-800" size={20} /> Giỏ hàng ({totalQty} món)
          </h2>
          <div className="space-y-4 mb-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="pr-4">
                  <h3 className="font-bold text-gray-800 text-sm flex items-start gap-2"><span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{item.soLuong}x</span> {item.tenMon}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">Từ: {item.tenQuan}</p>
                  {item.ghiChu && <p className="text-[11px] text-orange-600 bg-orange-50 p-1.5 rounded-lg mt-1.5 font-medium italic inline-block">Lưu ý: {item.ghiChu}</p>}
                </div>
                <p className="font-black text-gray-800 text-sm">{(item.gia * item.soLuong).toLocaleString('vi-VN')}đ</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-gray-600 my-2 text-sm border-t border-dashed border-gray-200 pt-4"><span>Tiền đồ ăn (Giá gốc)</span><span>{tongTienDoAn.toLocaleString('vi-VN')}đ</span></div>
          <div className="flex justify-between text-gray-800 my-2 text-sm font-bold"><span>Phí giao nóng</span><span>{phiShip.toLocaleString('vi-VN')}đ</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600 my-2 font-bold text-sm"><span>Mã giảm giá</span><span>-{discount.toLocaleString('vi-VN')}đ</span></div>}
          <div className="flex justify-between text-xl font-black text-orange-600 mt-4 border-t border-gray-100 pt-4"><span>Tổng cộng</span><span>{orderTotal.toLocaleString('vi-VN')}đ</span></div>
        </div>

        {/* NÚT THANH TOÁN UPDATE FULL */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="font-black text-gray-800 mb-4 px-1 text-lg">Thanh toán</h2>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}><Banknote size={20} /></div><div><p className="font-bold text-sm">Tiền mặt</p></div></div>
              <input type="radio" name="payment" className="w-5 h-5 accent-orange-500" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
            </label>
            
            <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${paymentMethod === 'bank' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}><QrCode size={20} /></div><div><p className="font-bold text-sm">Chuyển khoản (Mã QR)</p></div></div>
              <input type="radio" name="payment" className="w-5 h-5 accent-orange-500" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
            </label>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto rounded-t-3xl z-40">
        <button 
          onClick={handleCheckout} 
          disabled={isSubmitting || isOverLimit} 
          className={`w-full text-white font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 ${isOverLimit ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-600 to-orange-500 active:scale-[0.98]'}`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : (isOverLimit ? 'VƯỢT QUÁ SỐ LƯỢNG MÓN' : 'CHỐT ĐƠN')}
        </button>
      </div>
    </div>
  );
}