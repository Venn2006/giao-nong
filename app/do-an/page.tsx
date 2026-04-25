"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Minus, X, Star, ChevronRight, Store, Loader2, Clock, Info, ShoppingCart, CheckCircle2, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DoAnMenu() {
  const router = useRouter();
  
  const [danhMuc, setDanhMuc] = useState<any[]>([]); 
  const [monGoc, setMonGoc] = useState<any[]>([]); 
  const [quananList, setQuananList] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [monDangChon, setMonDangChon] = useState<any>(null); 
  const [quanDangChon, setQuanDangChon] = useState<any>(null); 
  
  const [soLuong, setSoLuong] = useState(1);
  const [ghiChuMon, setGhiChuMon] = useState("");

  const [showCustom, setShowCustom] = useState(false);
  const [customQuan, setCustomQuan] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  
  const [toastMsg, setToastMsg] = useState("");

  const serviceFee = 15000;
  const schedules = [
    { id: 'sang', name: 'CA SÁNG', cutoff: '06:30', delivery: '07:00 - 08:00', cutoffHour: 6, cutoffMin: 30 },
    { id: 'trua', name: 'CA TRƯA', cutoff: '10:00', delivery: '10:30 - 12:00', cutoffHour: 10, cutoffMin: 0 },
    { id: 'chieu', name: 'CA CHIỀU', cutoff: '14:00', delivery: '14:30 - 16:00', cutoffHour: 14, cutoffMin: 0 },
    { id: 'toi', name: 'CA TỐI', cutoff: '17:30', delivery: '18:00 - 19:30', cutoffHour: 17, cutoffMin: 30 },
  ];
  const [timeLeft, setTimeLeft] = useState<{ active: any }>({ active: schedules[0] });

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryImage = (cat: string) => {
    if (!cat) return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80";
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("bún") || lowerCat.includes("phở")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg";
    if (lowerCat.includes("cơm") || lowerCat.includes("xôi")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/com-tam.webp";
    if (lowerCat.includes("bánh mì")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/banh-mi.jpg"; 
    if (lowerCat.includes("cháo") || lowerCat.includes("lẩu")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/chao-lau.jpg"; 
    if (lowerCat.includes("ăn vặt")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/an-vat.jpg"; 
    return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80";
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("giao_nong_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserName(parsedUser.name || "");
      setUserPhone(parsedUser.phone || "");
      setDeliveryAddress(parsedUser.address || "");
    }

    const fetchMenu = async () => {
      setIsLoading(true);
      // ĐỌC BẢNG MENU TỪ FILE EXCEL MÀY UP LÊN
      const { data: menuData } = await supabase.from('menu_items').select('*').order('id', { ascending: true });
      
      if (menuData && menuData.length > 0) {
        // PHIÊN DỊCH CỘT TIẾNG VIỆT TỪ EXCEL SANG CODE
        const normalizedData = menuData.map((item: any) => ({
          id: item.id || item.ID,
          name: item['Tên món ăn'] || item.ten_mon_an || item.name,
          category: item['Danh mục'] || item.danh_muc || item.category,
          description: item['Mô tả gợi ý'] || item.mo_ta_goi_y || item.description
        })).filter(item => item.name); // Bỏ qua dòng trống

        setMonGoc(normalizedData);
        
        const categoriesMap = new Map();
        normalizedData.forEach(item => {
          const catName = item.category || "Khác";
          if (!categoriesMap.has(catName)) { 
            categoriesMap.set(catName, { id: catName, ten: catName }); 
          }
        });
        const catArray = Array.from(categoriesMap.values());
        setDanhMuc(catArray);
        if (catArray.length > 0) setActiveCategory(catArray[0].id);
      }
      setIsLoading(false);
    };

    fetchMenu();

    const timer = setInterval(() => {
      const now = new Date();
      let activeSchedule = schedules[0];
      let found = false;
      for (let i = 0; i < schedules.length; i++) {
        const cutoffDate = new Date();
        cutoffDate.setHours(schedules[i].cutoffHour, schedules[i].cutoffMin, 0, 0);
        if (now < cutoffDate) {
          activeSchedule = schedules[i]; found = true; break;
        }
      }
      if (!found) activeSchedule = schedules[0];
      setTimeLeft({ active: activeSchedule });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchRestaurantsForDish = async (dishName: string) => {
    setIsLoading(true);
    // TÌM CÁC QUÁN BÁN MÓN NÀY TRONG BẢNG QUÁN
    const { data } = await supabase.from('restaurant_options').select('*').eq('dish_name', dishName);
    setQuananList(data || []);
    setIsLoading(false);
  };

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleAddToCart = () => {
    const newItem = { 
      id: Math.random().toString(), 
      tenMon: monDangChon.name, 
      tenQuan: quanDangChon.restaurant_name, 
      gia: quanDangChon.price, 
      soLuong: soLuong, 
      ghiChu: ghiChuMon 
    };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart)); 
    
    showSuccessToast(`Đã thêm ${soLuong} ${monDangChon.name} vào giỏ`);
    setQuanDangChon(null); setMonDangChon(null); setGhiChuMon(""); setSoLuong(1);
  };

  const handleAddCustomToCart = () => {
    if (!customQuan) { alert("Điền tên quán giúp Giao Nóng nha!"); return; }
    const newItem = { 
      id: Math.random().toString(), 
      tenMon: monDangChon.name, 
      tenQuan: customQuan + (customAddress ? ` (${customAddress})` : ''), 
      gia: 35000, 
      soLuong: soLuong, 
      ghiChu: `[MUA HỘ NGOÀI] ${ghiChuMon}` 
    };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
    
    showSuccessToast(`Đã nhờ Shipper mua hộ`);
    setShowCustom(false); setMonDangChon(null); setGhiChuMon(""); setSoLuong(1); setCustomQuan(""); setCustomAddress("");
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    if (!deliveryAddress || !userName || !userPhone) return alert("Điền đủ Tên, SĐT, Địa chỉ nha Cô/Chú!");

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: userName, phone: userPhone, address: deliveryAddress }));

    const orderId = "DA" + Math.floor(1000 + Math.random() * 9000); 
    let orderDetails = cart.map(item => `${item.soLuong}x ${item.tenMon} (Tại: ${item.tenQuan}) ${item.ghiChu ? `[${item.ghiChu}]` : ''}`).join("\n");
    const summary = `🍲 [ĐỒ ĂN - ${timeLeft.active.name}]\n${orderDetails}`;
    const fullAddress = `📍 GIAO ĐẾN: ${deliveryAddress}`;

    const newOrder = {
      order_code: orderId,
      customer_name: userName,
      customer_phone: userPhone,
      delivery_address: fullAddress,
      shipping_note: "Gom đơn đồ ăn. Tài xế ứng tiền mua trước.",
      items_summary: summary,
      total_amount: cartTotal + serviceFee, 
      shipping_fee: serviceFee,
      payment_method: 'cash',
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    setIsSubmitting(false);
    if (error) alert("Lỗi mạng!"); 
    else {
      localStorage.removeItem("giao_nong_cart");
      localStorage.setItem("last_order_code", orderId);
      router.push('/tracking');
    }
  };

  const handleBack = () => {
    if (quanDangChon) setQuanDangChon(null);
    else if (showCustom) setShowCustom(false);
    else if (monDangChon) setMonDangChon(null);
    else router.push('/');
  };

  const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.gia * item.soLuong), 0);

  if (isLoading && danhMuc.length === 0) return <div className="min-h-screen bg-[#fcfaf1] flex justify-center items-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-24 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {toastMsg && (
        <div className="fixed top-[100px] left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full font-black text-sm shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 w-max max-w-[90%]">
          <CheckCircle2 size={18} className="text-green-400"/> {toastMsg}
        </div>
      )}

      {/* HEADER CỐ ĐỊNH */}
      <div className="sticky top-0 z-20 bg-white rounded-b-2xl shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <button onClick={handleBack} className="text-gray-900 p-2 rounded-full bg-gray-100 active:scale-95"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {monDangChon ? monDangChon.name : "Thực Đơn Giao Nóng"}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold">
              {monDangChon ? "Chọn quán để đặt" : "Lấp đầy chiếc bụng đói"}
            </p>
          </div>
        </div>
        
        {/* TABS DANH MỤC TRƯỢT NGANG */}
        {!monDangChon && (
          <div className="flex overflow-x-auto scrollbar-hide border-t border-gray-100">
             {danhMuc.map(cat => (
               <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-5 py-3 text-sm font-black border-b-[3px] transition-colors ${activeCategory === cat.id ? 'text-orange-600 border-orange-600 bg-orange-50/50' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}>
                 {cat.ten}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* NỘI DUNG CHÍNH TRANG */}
      <div className="p-4">
        {monDangChon ? (
          // MÀN HÌNH 2: CHỌN QUÁN SAU KHI ĐÃ CHỌN MÓN GỐC
          <div className="space-y-5 animate-in slide-in-from-right-4">
            {isLoading ? <Loader2 className="animate-spin mx-auto text-orange-500 mt-10" size={32}/> : 
             quananList.length === 0 ? (
               <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-200">
                 <Store size={40} className="mx-auto text-gray-300 mb-2"/>
                 <p className="font-bold text-gray-500 text-sm">Chưa có quán nào đăng ký bán món này.</p>
               </div>
             ) : 
             quananList.map((quan) => (
              <div key={quan.id} onClick={() => { setQuanDangChon(quan); setSoLuong(1); setGhiChuMon(""); }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer">
                <div className="h-40 w-full bg-gray-100 relative">
                  <img src={quan.image_url || getCategoryImage(monDangChon.category)} alt={quan.restaurant_name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm text-gray-900 font-black">4.9</span></div>
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 mb-1">{quan.restaurant_name}</h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin size={14} className="text-orange-500"/> {quan.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Giá</p>
                    <p className="text-xl font-black text-orange-600">{quan.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              </div>
            ))}

            {/* FORM MUA QUÁN NGOÀI */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden mt-6">
               <div className="absolute -right-2 -bottom-2 opacity-20"><Store size={100} /></div>
               <div className="relative z-10">
                  <h2 className="text-lg font-black uppercase mb-1">Không thấy quán bạn thích?</h2>
                  <p className="text-xs font-medium text-blue-100 mb-4">Nhập tên quán bạn muốn mua, Shipper đi mua liền!</p>
                  <button onClick={() => { setShowCustom(!showCustom); setSoLuong(1); setGhiChuMon(""); }} className="bg-white text-blue-600 font-black text-sm px-4 py-3 rounded-xl flex justify-center w-full active:scale-95 transition-all">
                    {showCustom ? "ĐÓNG FORM" : "NHẬP TÊN QUÁN MUA HỘ"}
                  </button>
               </div>
            </div>

            {showCustom && (
              <div className="bg-white p-5 rounded-[2rem] border border-blue-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4">
                 <input type="text" value={customQuan} onChange={(e) => setCustomQuan(e.target.value)} placeholder="Tên quán..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold" />
                 <input type="text" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="Địa chỉ quán..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold" />
                 <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú (Không hành...)" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-blue-500 text-sm h-20 resize-none font-bold"></textarea>
                 <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-4">
                    <span className="text-gray-900 font-bold text-sm">Số lượng</span>
                    <div className="flex gap-3 bg-gray-50 p-1 rounded-xl border border-gray-200">
                      <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-2 bg-white rounded-lg"><Minus size={16} /></button>
                      <span className="font-black text-lg w-6 text-center">{soLuong}</span>
                      <button onClick={() => setSoLuong(soLuong + 1)} className="p-2 bg-white rounded-lg text-blue-600"><Plus size={16} /></button>
                    </div>
                 </div>
                 <button onClick={handleAddCustomToCart} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl active:scale-95 shadow-md">THÊM VÀO GIỎ HÀNG</button>
              </div>
            )}
          </div>
        ) : (
          // MÀN HÌNH 1: HIỆN DANH SÁCH MÓN GỐC (TỪ FILE EXCEL)
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {monGoc.filter(item => item.category === activeCategory).map((mon) => (
              <div key={mon.id} onClick={() => { setMonDangChon(mon); fetchRestaurantsForDish(mon.name); }} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 active:bg-gray-50 cursor-pointer">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                  <img src={getCategoryImage(mon.category)} alt={mon.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-grow py-1">
                  <div>
                    <h3 className="text-base font-black text-gray-900 leading-tight mb-1">{mon.name}</h3>
                    <p className="text-[10px] text-gray-500 line-clamp-2">{mon.description}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-orange-600 font-black text-xs uppercase flex items-center gap-1"><Store size={12}/> Xem các quán</span>
                    <div className="bg-orange-50 text-orange-600 p-2 rounded-xl"><ChevronRight size={14}/></div>
                  </div>
                </div>
              </div>
            ))}
            {monGoc.filter(item => item.category === activeCategory).length === 0 && (
               <div className="text-center py-10 opacity-50"><Utensils size={40} className="mx-auto mb-2"/> <p className="font-bold">Đang cập nhật món mới...</p></div>
            )}
          </div>
        )}
      </div>

      {/* POPUP SỐ LƯỢNG KHI CHỌN QUÁN */}
      {quanDangChon && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <p className="text-xs text-orange-600 font-bold flex items-center gap-1 mb-1"><Store size={14}/> {quanDangChon.restaurant_name}</p>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{monDangChon.name}</h2>
              </div>
              <button onClick={() => setQuanDangChon(null)} className="p-2 bg-gray-100 rounded-full active:bg-gray-200"><X size={20} /></button>
            </div>
            <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú (Không hành, ít cay)..." className="w-full p-4 rounded-2xl border border-gray-200 outline-orange-500 text-sm h-24 mb-6 bg-gray-50 font-bold"></textarea>
            <div className="flex justify-between items-center mb-8">
              <span className="text-gray-900 font-bold text-lg">Số lượng</span>
              <div className="flex gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-3 bg-white rounded-xl shadow-sm text-gray-600"><Minus size={20} /></button>
                <span className="font-black text-2xl w-8 text-center">{soLuong}</span>
                <button onClick={() => setSoLuong(soLuong + 1)} className="p-3 bg-white rounded-xl shadow-sm text-orange-600"><Plus size={20} /></button>
              </div>
            </div>
            <button onClick={handleAddToCart} className="w-full bg-orange-600 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center active:scale-[0.98]">
              <div className="text-left"><p className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Tổng cộng</p><p className="text-2xl font-black">{(quanDangChon.price * soLuong).toLocaleString('vi-VN')}đ</p></div>
              <div className="flex items-center gap-1 font-black text-sm bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm"><ShoppingCart size={18}/> BỎ VÀO GIỎ</div>
            </button>
          </div>
        </div>
      )}

      {/* FLOAT GIỎ HÀNG DƯỚI ĐÁY KHI CHƯA MỞ POPUP */}
      {cart.length > 0 && !quanDangChon && !monDangChon && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto rounded-t-3xl z-40 animate-in slide-in-from-bottom-4 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm max-h-[40vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                <h3 className="font-black text-sm text-gray-900">Giỏ hàng của bạn</h3>
                <button onClick={() => { setCart([]); localStorage.removeItem("giao_nong_cart"); }} className="text-red-500 text-[10px] font-bold uppercase">Xóa hết</button>
             </div>
             <div className="space-y-3">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-start gap-2">
                   <div>
                     <p className="font-bold text-sm text-gray-900"><span className="text-orange-600 font-black">{item.soLuong}x</span> {item.tenMon}</p>
                     <p className="text-[10px] text-gray-500 font-medium">Tại: {item.tenQuan}</p>
                   </div>
                   <p className="font-black text-sm text-gray-900">{(item.gia * item.soLuong).toLocaleString('vi-VN')}đ</p>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-3">
                <h3 className="font-black text-xs text-gray-900 uppercase flex items-center gap-1"><MapPin size={14} className="text-red-500"/> Giao đến đâu?</h3>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tên người nhận..." className="w-full p-3 border border-gray-200 rounded-xl outline-orange-500 text-sm font-bold bg-gray-50" />
                <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="Số điện thoại..." className="w-full p-3 border border-gray-200 rounded-xl outline-orange-500 text-sm font-bold bg-gray-50" />
                <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Địa chỉ giao hàng..." className="w-full p-3 border border-gray-200 rounded-xl outline-orange-500 text-sm font-bold bg-gray-50" />
             </div>
          </div>
          <button onClick={handleCreateOrder} disabled={isSubmitting} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-lg flex justify-between px-6 items-center">
            <div className="text-left leading-tight"><span className="text-[10px] uppercase font-bold opacity-80 block">Tổng thanh toán</span><span>{(cartTotal + serviceFee).toLocaleString('vi-VN')}đ</span></div>
            <span>{isSubmitting ? <Loader2 className="animate-spin" /> : 'CHỐT ĐƠN NGAY'} <ChevronRight size={18} className="inline"/></span>
          </button>
        </div>
      )}
    </div>
  );
}