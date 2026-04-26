"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Minus, X, Star, ChevronRight, Store, Loader2, Clock, Info, ShoppingCart, CheckCircle2, Utensils, CupSoda, Flame, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DoAnMenu() {
  const router = useRouter();
  
  // STATE GỘP CHUNG ĐỒ ĂN & THỨC UỐNG
  const [mainTab, setMainTab] = useState<"food" | "drink">("food");
  const [monGoc, setMonGoc] = useState<any[]>([]); 
  const [danhMuc, setDanhMuc] = useState<any[]>([]); 
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

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIC GIỜ CHỐT (GOM ĐƠN THEO CA CHUẨN GIAO NÓNG)
  const schedules = [
    { id: 'sang', name: 'CA SÁNG', cutoff: '06:30', delivery: '07:00-08:00', cutoffHour: 6, cutoffMin: 30 },
    { id: 'trua', name: 'CA TRƯA', cutoff: '10:00', delivery: '10:30-12:00', cutoffHour: 10, cutoffMin: 0 },
    { id: 'chieu', name: 'CA CHIỀU', cutoff: '14:00', delivery: '14:30-16:00', cutoffHour: 14, cutoffMin: 0 },
    { id: 'toi', name: 'CA TỐI', cutoff: '17:30', delivery: '18:00-19:30', cutoffHour: 17, cutoffMin: 30 },
  ];
  const [timeLeft, setTimeLeft] = useState<{ active: any }>({ active: schedules[0] });

  const getCategoryImage = (cat: string, type: string) => {
    if (type === 'drink') return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/nuoc-sam.jpg";
    if (!cat) return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80";
    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes("bún") || lowerCat.includes("phở") || lowerCat.includes("lèo")) return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg";
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
      const { data: menuData } = await supabase.from('menu_items').select('*').order('id', { ascending: true });
      
      if (menuData && menuData.length > 0) {
        const normalizedData = menuData.map((item: any) => ({
          id: item.id || item.ID,
          name: item['Tên món ăn'] || item.ten_mon_an || item.name,
          category: item['Danh mục'] || item.danh_muc || item.category,
          description: item['Mô tả gợi ý'] || item.mo_ta_goi_y || item.description,
          type: item.type || 'food'
        })).filter(item => item.name); 

        setMonGoc(normalizedData);
        
        const categoriesMap = new Map();
        normalizedData.forEach(item => {
          const catName = item.category || "Khác";
          if (!categoriesMap.has(catName)) { 
            categoriesMap.set(catName, { id: catName, ten: catName, type: item.type }); 
          }
        });
        const catArray = Array.from(categoriesMap.values());
        setDanhMuc(catArray);
        
        const firstFoodCat = catArray.find(c => c.type === 'food');
        if (firstFoodCat) setActiveCategory(firstFoodCat.id);
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

  const handleSwitchTab = (tab: "food" | "drink") => {
    setMainTab(tab);
    setMonDangChon(null); setQuanDangChon(null); setShowCustom(false);
    const firstCat = danhMuc.find(c => c.type === tab);
    if (firstCat) setActiveCategory(firstCat.id);
  };

  const fetchRestaurantsForDish = async (dishName: string) => {
    setIsLoading(true);
    const { data } = await supabase.from('restaurant_options').select('*').eq('dish_name', dishName);
    setQuananList(data || []);
    setIsLoading(false);
  };

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
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
    
    showSuccessToast(`Đã thêm ${soLuong} ${monDangChon.name}`);
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
      ghiChu: ghiChuMon ? `MUA HỘ NGOÀI - ${ghiChuMon}` : `MUA HỘ NGOÀI` 
    };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
    
    showSuccessToast(`Đã nhờ Shipper mua hộ`);
    setShowCustom(false); setMonDangChon(null); setGhiChuMon(""); setSoLuong(1); setCustomQuan(""); setCustomAddress("");
  };

  // CÔNG THỨC TÍNH PHÍ SHIP LŨY TIẾN ĐỈNH CAO CỦA BOSS
  const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.gia * item.soLuong), 0);

  const getServiceFee = (qty: number) => {
    if (qty === 0) return 0;
    if (qty >= 1 && qty <= 3) return 12000;
    if (qty === 4) return 13000;
    if (qty === 5) return 15000;
    if (qty === 6) return 16000;
    if (qty === 7) return 17000;
    if (qty === 8) return 18000;
    if (qty === 9) return 19000;
    return 20000; // Từ 10 món trở lên kịch trần 20k
  };
  const serviceFee = getServiceFee(totalQty);

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    if (!deliveryAddress || !userName || !userPhone) return alert("Điền đủ Tên, SĐT, Địa chỉ nha Cô/Chú!");

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: userName, phone: userPhone, address: deliveryAddress }));

    const orderId = "DA" + Math.floor(1000 + Math.random() * 9000); 
    
    let orderDetails = cart.map(item => {
       let text = `🔸 ${item.soLuong}x ${item.tenMon}\n   📍 Tại: ${item.tenQuan}`;
       if (item.ghiChu) text += `\n   📝 Ghi chú: ${item.ghiChu}`;
       return text;
    }).join("\n\n");

    const summary = `🍲 [ĐỒ ĂN - ${timeLeft.active.name}]\n\n${orderDetails}`;
    const fullAddress = `📍 GIAO ĐẾN: ${deliveryAddress}`;

    const newOrder = {
      order_code: orderId,
      customer_name: userName,
      customer_phone: userPhone,
      delivery_address: fullAddress,
      shipping_note: "Gom đơn theo ca. Tài xế ứng tiền mua trước.",
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

  if (isLoading && danhMuc.length === 0) return <div className="min-h-screen bg-[#fcfaf1] flex justify-center items-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-24 font-sans max-w-md mx-auto shadow-2xl relative overflow-x-hidden">
      
      {toastMsg && (
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full font-black text-sm z-50 animate-bounce shadow-2xl border border-gray-700">
          {toastMsg}
        </div>
      )}

      {/* HEADER CỐ ĐỊNH XUYÊN SUỐT */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-gray-100 active:scale-95"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              {monDangChon ? monDangChon.name : "GIAO NÓNG MENU"}
            </h1>
            <p className="text-[10px] text-orange-600 font-black uppercase flex items-center gap-1">
              <Zap size={10} fill="currentColor"/> Chốt {timeLeft.active.name} trước {timeLeft.active.cutoff}
            </p>
          </div>
        </div>
        
        {/* TABS ĐỒ ĂN - THỨC UỐNG */}
        {!monDangChon && (
          <>
            <div className="flex border-t border-gray-50">
               <button onClick={() => handleSwitchTab('food')} className={`flex-1 py-3 text-center flex items-center justify-center gap-1 font-black transition-colors ${mainTab === 'food' ? 'text-orange-600 border-b-[3px] border-orange-600 bg-orange-50/50' : 'text-gray-400 border-b-[3px] border-transparent hover:bg-gray-50'}`}>
                 <Utensils size={16}/> ĐỒ ĂN
               </button>
               <button onClick={() => handleSwitchTab('drink')} className={`flex-1 py-3 text-center flex items-center justify-center gap-1 font-black transition-colors ${mainTab === 'drink' ? 'text-orange-600 border-b-[3px] border-orange-600 bg-orange-50/50' : 'text-gray-400 border-b-[3px] border-transparent hover:bg-gray-50'}`}>
                 <CupSoda size={16}/> THỨC UỐNG
               </button>
            </div>
            
            <div className="flex overflow-x-auto scrollbar-hide bg-gray-50/50 p-2 gap-2">
               {danhMuc.filter(c => c.type === mainTab).map(cat => (
                 <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-black border-2 transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>
                   {cat.ten}
                 </button>
               ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-6">
        {monDangChon ? (
          // MÀN HÌNH 2: CHỌN QUÁN
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Danh sách quán đang bán</h2>
            
            {isLoading ? <Loader2 className="animate-spin mx-auto text-orange-500 mt-10" size={32}/> : 
             quananList.length === 0 ? (
               <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                 <Store size={40} className="mx-auto text-gray-300 mb-2"/>
                 <p className="font-bold text-gray-500 text-sm">Chưa có quán nào đăng ký bán món này.</p>
               </div>
             ) : 
             quananList.map((quan) => (
              <div key={quan.id} onClick={() => quan.is_open && setQuanDangChon(quan)} className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border transition-all ${!quan.is_open ? 'opacity-60 grayscale' : 'active:scale-[0.98] cursor-pointer'}`}>
                <div className="h-40 w-full relative bg-gray-100">
                  <img src={quan.image_url || getCategoryImage(monDangChon.category, mainTab)} alt={quan.restaurant_name} className="w-full h-full object-cover" />
                  
                  {/* TAG THỜI GIAN VÀ ĐÁNH GIÁ CHUẨN GIAO NÓNG */}
                  <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1 font-black text-xs text-gray-900 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500"/> 4.9
                  </div>
                  
                  {quan.is_open && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center gap-1.5 border border-white/20">
                      <Clock size={12} className="text-orange-400"/> Giao {timeLeft.active.name}
                    </div>
                  )}

                  {!quan.is_open && <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase text-sm shadow-xl">Tạm nghỉ cửa hàng</span></div>}
                </div>
                
                <div className="p-5 flex justify-between items-center">
                  <div className="max-w-[65%]">
                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{quan.restaurant_name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><MapPin size={10} className="text-orange-500"/> {quan.address || 'Cà Mau'}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xl font-black text-orange-600">{quan.price.toLocaleString('vi-VN')}đ</p>
                    <p className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded mt-1 inline-block">Trả đơn: {timeLeft.active.delivery}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* QUÁN CUSTOM MUA HỘ */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden mt-6">
               <div className="absolute -right-2 -bottom-2 opacity-20"><Store size={100} /></div>
               <div className="relative z-10">
                  <h2 className="text-lg font-black uppercase mb-1">Không thấy quán bạn thích?</h2>
                  <p className="text-xs font-medium text-blue-100 mb-4">Nhập tên quán bạn muốn mua, Shipper sẽ gom theo ca liền!</p>
                  <button onClick={() => { setShowCustom(!showCustom); setSoLuong(1); setGhiChuMon(""); }} className="bg-white text-blue-600 font-black text-sm px-4 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all w-full justify-center">
                    {showCustom ? "ĐÓNG FORM" : <><Plus size={18}/> NHẬP TÊN QUÁN MUA HỘ</>}
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
                 <button onClick={handleAddCustomToCart} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl active:scale-95 shadow-md">NHỜ SHIPPER MUA HỘ</button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* FEATURED SECTION - MÓN HOT GOM ĐƠN */}
            <div className="mb-6">
              <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-tight"><Flame size={18} className="text-red-500 fill-red-500"/> Chốt nhiều {timeLeft.active.name}</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {monGoc.filter(m => m.type === mainTab).slice(0, 5).map(m => (
                  <div key={m.id} onClick={() => { setMonDangChon(m); fetchRestaurantsForDish(m.name); }} className="min-w-[160px] bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex-shrink-0 active:scale-95 transition-all">
                    <div className="h-24 bg-gray-100 rounded-2xl mb-3 overflow-hidden relative">
                       <img src={mainTab === 'food' ? 'https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg' : 'https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/nuoc-sam.jpg'} className="w-full h-full object-cover" />
                       <span className="absolute top-2 right-2 bg-orange-600 text-white text-[8px] px-1.5 py-0.5 rounded-lg font-black uppercase shadow-sm">Hot</span>
                    </div>
                    <h3 className="font-black text-xs text-gray-900 line-clamp-1 mb-1">{m.name}</h3>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-orange-600">Gom chuyến</span><div className="bg-orange-600 text-white p-1 rounded-lg"><Plus size={12}/></div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* MAIN MENU */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2"><Utensils size={18} className="text-orange-500"/> Thực đơn chính</h2>
              {monGoc.filter(m => m.category === activeCategory && m.type === mainTab).map(m => (
                <div key={m.id} onClick={() => { setMonDangChon(m); fetchRestaurantsForDish(m.name); }} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 active:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden relative border border-gray-50">
                    <img src={getCategoryImage(m.category, mainTab)} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform" alt={m.name} />
                  </div>
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-black text-gray-900 leading-tight">{m.name}</h3>
                        <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-lg font-black uppercase">Gom đơn</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold line-clamp-2 leading-relaxed">{m.description || "Giao Nóng đảm bảo đồ ăn luôn nóng sốt."}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                       <div className="flex items-center gap-1.5">
                         <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-1 rounded-lg border border-orange-100 uppercase">Xem quán</span>
                       </div>
                       <div className="bg-gray-900 text-white p-1.5 rounded-xl group-active:scale-110 transition-transform shadow-lg shadow-gray-200"><ChevronRight size={14}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* POPUP CHỌN SỐ LƯỢNG */}
      {quanDangChon && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 slide-in-from-bottom-full duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
              <div>
                <p className="text-xs text-orange-600 font-black uppercase mb-1 flex items-center gap-1"><Store size={14}/> {quanDangChon.restaurant_name}</p>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{monDangChon.name}</h2>
              </div>
              <button onClick={() => setQuanDangChon(null)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú cho quán (Vd: Ít cay, không hành...)" className="w-full p-4 rounded-2xl border border-gray-100 text-sm h-24 mb-6 bg-gray-50 font-bold outline-orange-500"></textarea>
            <div className="flex justify-between items-center mb-8">
              <span className="text-gray-900 font-black text-lg uppercase tracking-tight">Số lượng</span>
              <div className="flex gap-5 bg-gray-100 p-2 rounded-2xl border border-gray-200">
                <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400"><Minus size={18}/></button>
                <span className="font-black text-2xl w-8 text-center text-gray-900">{soLuong}</span>
                <button onClick={() => setSoLuong(soLuong + 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600"><Plus size={18}/></button>
              </div>
            </div>
            <button onClick={handleAddToCart} className="w-full bg-orange-600 text-white p-5 rounded-[2rem] shadow-xl flex justify-between items-center active:scale-95 transition-all">
              <div className="text-left leading-none"><p className="text-[10px] font-black uppercase opacity-70 mb-1">Tạm tính</p><p className="text-2xl font-black">{(quanDangChon.price * soLuong).toLocaleString('vi-VN')}đ</p></div>
              <div className="bg-black/20 px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-inner">Xong & Chọn Tiếp <CheckCircle2 size={16}/></div>
            </button>
          </div>
        </div>
      )}

      {/* GIỎ HÀNG THÔNG MINH */}
      {totalQty > 0 && !quanDangChon && !monDangChon && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-gray-100 max-w-md mx-auto rounded-t-[2.5rem] z-40 shadow-[0_-15px_50px_rgba(0,0,0,0.1)]">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-inner mb-4 max-h-[45vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
               <h3 className="font-black text-gray-900 uppercase text-xs flex items-center gap-2"><ShoppingCart size={16}/> Đơn của Cô/Chú ({totalQty})</h3>
               <button onClick={() => { setCart([]); localStorage.removeItem("giao_nong_cart"); }} className="text-red-500 text-[10px] font-black uppercase">Xóa hết</button>
             </div>
             <div className="space-y-4">
               {cart.map(i => (
                 <div key={i.id} className="flex justify-between items-start">
                   <div className="max-w-[70%]">
                     <p className="font-black text-sm text-gray-900 leading-tight"><span className="text-orange-600">{i.soLuong}x</span> {i.tenMon}</p>
                     <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Tại: {i.tenQuan}</p>
                   </div>
                   <p className="font-black text-sm text-gray-900">{(i.gia * i.soLuong).toLocaleString('vi-VN')}đ</p>
                 </div>
               ))}
             </div>
             <div className="mt-6 pt-5 border-t border-dashed border-gray-200 space-y-3">
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Tên Cô/Chú" className="w-full p-3 border border-gray-100 rounded-xl text-sm font-black bg-gray-50 outline-none focus:border-orange-500" />
                <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="SĐT liên hệ" className="w-full p-3 border border-gray-100 rounded-xl text-sm font-black bg-gray-50 outline-none focus:border-orange-500" />
                <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Địa chỉ giao: Số nhà, tên đường..." className="w-full p-3 border border-gray-100 rounded-xl text-sm font-black bg-gray-50 outline-none focus:border-orange-500" />
             </div>
          </div>
          <button onClick={handleCreateOrder} disabled={isSubmitting} className="w-full bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex justify-between items-center active:scale-95 transition-all">
            <div className="text-left leading-none">
              <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Ship {serviceFee/1000}k | Tổng</p>
              <p className="text-2xl font-black text-orange-500">{(cartTotal + serviceFee).toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-orange-600 px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'Chốt Đơn'} <ChevronRight size={16}/>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}