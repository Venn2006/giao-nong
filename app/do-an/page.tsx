"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Minus, X, Star, ChevronRight, Store, Loader2, Clock, ShoppingCart, CheckCircle2, Utensils, CupSoda, Flame, Zap, Trash2, Banknote, CreditCard, Sparkles, QrCode, ShieldAlert, StoreIcon, AlertCircle, AlertTriangle, HeartHandshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DoAnMenu() {
  const router = useRouter();
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
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank'>('cash');
  const [showQR, setShowQR] = useState(false);
  const [generatedOrderCode, setGeneratedOrderCode] = useState("");
  const [vipDiscountPercent, setVipDiscountPercent] = useState(0);

  const schedules = [
    { id: 'sang', name: 'CA SÁNG', cutoff: '06:30', delivery: '07:00-08:00', cutoffHour: 6, cutoffMin: 30 },
    { id: 'trua', name: 'CA TRƯA', cutoff: '10:00', delivery: '10:30-12:00', cutoffHour: 10, cutoffMin: 0 },
    { id: 'chieu', name: 'CA CHIỀU', cutoff: '14:00', delivery: '14:30-16:00', cutoffHour: 14, cutoffMin: 0 },
    { id: 'toi', name: 'CA TỐI', cutoff: '17:30', delivery: '18:00-19:30', cutoffHour: 17, cutoffMin: 30 },
  ];
  const [timeLeft, setTimeLeft] = useState<{ active: any }>({ active: schedules[0] });

  const detectType = (cat: string) => {
    const lower = (cat || "").toLowerCase();
    if (lower.includes("trà") || lower.includes("cà phê") || lower.includes("uống") || lower.includes("nước") || lower.includes("sinh tố") || lower.includes("sữa")) return "drink";
    return "food";
  };

  const getCategoryImage = (cat: string, type: string) => {
    const lowerCat = (cat || "").toLowerCase();
    if (type === 'drink') {
      if (lowerCat.includes("trà sữa")) return "https://images.unsplash.com/photo-1558850133-d8db1946ebde?auto=format&fit=crop&w=500&q=80"; 
      if (lowerCat.includes("cà phê") || lowerCat.includes("cafe")) return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80"; 
      return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/nuoc-sam.jpg"; 
    }
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
      
      if (parsedUser.phone) {
         supabase.from('orders').select('total_amount').eq('customer_phone', parsedUser.phone.trim()).eq('status', 'completed')
         .then(({ data }) => {
            if (data) {
               const total = data.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
               let discount = 0;
               if (total >= 500000000) discount = 20;
               else if (total >= 200000000) discount = 18;
               else if (total >= 120000000) discount = 15;
               else if (total >= 80000000) discount = 12;
               else if (total >= 50000000) discount = 9;
               else if (total >= 30000000) discount = 7;
               else if (total >= 15000000) discount = 5;
               else if (total >= 5000000) discount = 2;
               setVipDiscountPercent(discount);
            }
         });
      }
    }

    const fetchMenu = async () => {
      setIsLoading(true);
      const { data: menuData } = await supabase.from('menu_items').select('*').order('id', { ascending: true });
      if (menuData && menuData.length > 0) {
        const normalizedData = menuData.map((item: any) => {
          const categoryName = item['Danh mục'] || item.danh_muc || item.category || "Khác";
          return {
            id: item.id || item.ID,
            name: item['Tên món ăn'] || item.ten_mon_an || item.name,
            category: categoryName,
            description: item['Mô tả gợi ý'] || item.mo_ta_goi_y || item.description,
            type: item.type || detectType(categoryName)
          };
        }).filter(item => item.name); 
        setMonGoc(normalizedData);
        
        const categoriesMap = new Map();
        normalizedData.forEach(item => {
          if (!categoriesMap.has(item.category)) categoriesMap.set(item.category, { id: item.category, ten: item.category, type: item.type }); 
        });
        const catArray = Array.from(categoriesMap.values());
        setDanhMuc(catArray);
        
        const firstCat = catArray.find(c => c.type === 'food');
        if (firstCat) setActiveCategory(firstCat.id);
      }
      setIsLoading(false);
    };

    fetchMenu();

    const timer = setInterval(() => {
      const now = new Date();
      let activeSchedule = schedules[0];
      for (let i = 0; i < schedules.length; i++) {
        const cutoffDate = new Date();
        cutoffDate.setHours(schedules[i].cutoffHour, schedules[i].cutoffMin, 0, 0);
        if (now < cutoffDate) { activeSchedule = schedules[i]; break; }
      }
      setTimeLeft({ active: activeSchedule });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSwitchTab = (tab: "food" | "drink") => {
    setMainTab(tab);
    setMonDangChon(null); setQuanDangChon(null); setShowCustom(false);
    const firstCat = danhMuc.find(c => c.type === tab);
    if (firstCat) setActiveCategory(firstCat.id);
    else setActiveCategory(null); 
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
    const newItem = { id: Math.random().toString(), tenMon: monDangChon.name, tenQuan: quanDangChon.restaurant_name, gia: quanDangChon.price, soLuong: soLuong, ghiChu: ghiChuMon };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart); localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart)); 
    showSuccessToast(`Đã thêm ${soLuong} ${monDangChon.name}`);
    setQuanDangChon(null); setMonDangChon(null); setGhiChuMon(""); setSoLuong(1);
  };

  const handleAddCustomToCart = () => {
    if (!customQuan) { alert("Điền tên quán giúp Giao Nóng nha!"); return; }
    const newItem = { id: Math.random().toString(), tenMon: monDangChon.name, tenQuan: customQuan + (customAddress ? ` (${customAddress})` : ''), gia: 35000, soLuong: soLuong, ghiChu: ghiChuMon ? `MUA HỘ NGOÀI - ${ghiChuMon}` : `MUA HỘ NGOÀI` };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart); localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
    showSuccessToast(`Đã nhờ Shipper mua hộ`);
    setShowCustom(false); setMonDangChon(null); setGhiChuMon(""); setSoLuong(1); setCustomQuan(""); setCustomAddress("");
  };

  // TÍNH NĂNG MỚI: TĂNG GIẢM XÓA TRỰC TIẾP TRONG GIỎ HÀNG
  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, soLuong: item.soLuong + delta };
      }
      return item;
    }).filter(item => item.soLuong > 0);
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (idToRemove: string) => {
    const updatedCart = cart.filter(item => item.id !== idToRemove);
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
  };

  // CÔNG THỨC TÍNH TOÁN
  const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.gia * item.soLuong), 0);

  // LUẬT 1: PHÍ SHIP ĐỘNG
  const getServiceFee = (qty: number) => {
    if (qty === 0) return 0;
    if (qty <= 3) return 13000;
    if (qty === 4) return 14000;
    return 15000; // Tối đa 5 món
  };
  const serviceFee = getServiceFee(totalQty);
  
  // TÍNH TOÁN VIP DISCOUNT
  const discountAmount = Math.floor((cartTotal * vipDiscountPercent) / 100);
  const finalTotal = (cartTotal - discountAmount) + serviceFee;

  // LUẬT 2 & 3: TỐI ĐA 5 MÓN & TRÊN 200K ÉP CỌC
  const isOverLimit = totalQty > 5;
  const requireDeposit = finalTotal > 200000;

  // Ép trạng thái Bank nếu đơn quá 200k
  useEffect(() => {
    if (requireDeposit && paymentMethod === 'cash') {
      setPaymentMethod('bank');
    }
  }, [requireDeposit, paymentMethod]);

  // TÍCH ĐIỂM
  const diemTichLuy = Math.floor(finalTotal / 100000); 

  const handleCreateOrder = async () => {
    if (cart.length === 0) return alert("Giỏ hàng trống!");
    if (!deliveryAddress || !userName || !userPhone) return alert("Điền đủ Tên, SĐT, Địa chỉ nha Cô/Chú!");
    if (isOverLimit) return alert("Dạ tối đa 5 món/đơn. Cô chú vui lòng tách đơn giúp tụi con nha!");

    setIsSubmitting(true);
    localStorage.setItem("giao_nong_user", JSON.stringify({ name: userName, phone: userPhone.trim(), address: deliveryAddress }));
    const orderId = "DA" + Math.floor(1000 + Math.random() * 9000); 
    
    let orderDetails = cart.map(item => {
       let text = `🔸 ${item.soLuong}x ${item.tenMon}\n   📍 Tại: ${item.tenQuan}`;
       if (item.ghiChu) text += `\n   📝 Ghi chú: ${item.ghiChu}`;
       return text;
    }).join("\n\n");
    
    if (vipDiscountPercent > 0) orderDetails += `\n\n🎟️ [HẠNG VIP] Giảm giá ${vipDiscountPercent}%: -${discountAmount.toLocaleString('vi-VN')}đ`;

    const summary = `🍲 [ĐỒ ĂN - ${timeLeft.active.name}]\n\n${orderDetails}`;
    const fullAddress = `📍 GIAO ĐẾN: ${deliveryAddress}`;
    
    const newOrder = {
      order_code: orderId, 
      customer_name: userName, 
      customer_phone: userPhone.trim(), 
      delivery_address: fullAddress,
      gps_location: deliveryAddress, 
      shipping_note: requireDeposit ? `ĐƠN > 200K - KHÁCH SẼ CK/CỌC TRƯỚC` : `Gom đơn theo ca. THU TIỀN MẶT`, 
      items_summary: summary,
      total_amount: finalTotal, 
      shipping_fee: serviceFee, 
      payment_method: paymentMethod, 
      status: 'pending',
      is_approved: paymentMethod === 'cash' && !requireDeposit ? true : false
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    setIsSubmitting(false);
    
    if (error) {
      alert("Lỗi mạng!"); 
    } else {
      localStorage.removeItem("giao_nong_cart"); 
      localStorage.setItem("last_order_code", orderId); 
      
      if (paymentMethod === 'bank' || requireDeposit) {
        setGeneratedOrderCode(orderId);
        setShowQR(true);
      } else {
        router.push('/tracking');
      }
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
    <div className="min-h-screen bg-[#fcfaf1] pb-[420px] font-sans max-w-md mx-auto shadow-2xl relative overflow-x-hidden">
      
      {/* POPUP QR THANH TOÁN HOẶC CỌC */}
      {showQR && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-5 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm text-center animate-in zoom-in-95 shadow-2xl border-4 border-orange-500">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
              <QrCode size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Chuyển Khoản / Đặt Cọc</h2>
            <p className="text-xs font-bold text-gray-500 mb-6 px-2">
              Cô/Chú quét mã VietQR bên dưới để thanh toán/cọc cho đơn hàng nhé ạ!
            </p>
            
            <div className="bg-gray-50 p-2 rounded-3xl mb-6 border-2 border-dashed border-gray-200">
              <img 
                src={`https://img.vietqr.io/image/MB-0901234567-print.png?amount=${finalTotal}&addInfo=${generatedOrderCode}&accountName=GIAO NONG CAMAU`} 
                alt="VietQR" 
                className="w-full rounded-2xl"
              />
            </div>
            
            <div className="bg-orange-50 p-4 rounded-2xl mb-6 border border-orange-100 shadow-sm flex flex-col gap-1">
               <span>Số tiền: <strong className="text-xl text-orange-600">{finalTotal.toLocaleString('vi-VN')}đ</strong></span>
               <span className="text-[11px] text-gray-500">Nội dung CK: <strong className="text-sm text-gray-900 tracking-widest">{generatedOrderCode}</strong></span>
            </div>
            
            <button 
              onClick={() => router.push('/tracking')} 
              className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl active:scale-95 shadow-xl transition-all flex justify-center items-center gap-2 text-lg"
            >
              <CheckCircle2 size={20} /> TÔI ĐÃ CHUYỂN KHOẢN
            </button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-[80px] left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full font-black text-sm z-50 animate-bounce shadow-2xl border border-gray-700">
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-gray-100 active:scale-95"><ArrowLeft size={20} className="text-gray-900"/></button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">{monDangChon ? monDangChon.name : "GIAO NÓNG MENU"}</h1>
            <p className="text-[10px] text-orange-600 font-black uppercase flex items-center gap-1"><Zap size={10} fill="currentColor"/> Chốt {timeLeft.active.name} trước {timeLeft.active.cutoff}</p>
          </div>
        </div>
        
        {!monDangChon && (
          <>
            <div className="flex border-t border-gray-50">
               <button onClick={() => handleSwitchTab('food')} className={`flex-1 py-3 text-center flex items-center justify-center gap-1 font-black transition-colors ${mainTab === 'food' ? 'text-orange-600 border-b-[3px] border-orange-600 bg-orange-50/50' : 'text-gray-400 border-b-[3px] border-transparent hover:bg-gray-50'}`}><Utensils size={16}/> ĐỒ ĂN</button>
               <button onClick={() => handleSwitchTab('drink')} className={`flex-1 py-3 text-center flex items-center justify-center gap-1 font-black transition-colors ${mainTab === 'drink' ? 'text-orange-600 border-b-[3px] border-orange-600 bg-orange-50/50' : 'text-gray-400 border-b-[3px] border-transparent hover:bg-gray-50'}`}><CupSoda size={16}/> THỨC UỐNG</button>
            </div>
            
            <div className="flex overflow-x-auto scrollbar-hide bg-gray-50/50 p-2 gap-2 min-h-[48px]">
               {danhMuc.filter(c => c.type === mainTab).map(cat => (
                 <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-black border-2 transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
                   {cat.ten}
                 </button>
               ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-6">
        {monDangChon ? (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Danh sách quán đang bán</h2>
            {isLoading ? <Loader2 className="animate-spin mx-auto text-orange-500 mt-10" size={32}/> : 
             quananList.length === 0 ? (
               <div className="text-center bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
                 <Store size={40} className="mx-auto text-gray-300 mb-2"/>
                 <p className="font-bold text-gray-500 text-sm">Chưa có quán nào đăng ký bán món này.</p>
               </div>
             ) : 
             quananList.map((quan) => {
               const statusText = quan.trang_thai_quan || (quan.is_open === false ? 'Đã đóng cửa' : 'Đang mở cửa');
               const isOpen = statusText === 'Đang mở cửa';
               const isClosed = statusText === 'Đã đóng cửa';
               const isSoon = statusText === 'Chưa mở cửa';

               return (
                <div key={quan.id} onClick={() => isOpen && setQuanDangChon(quan)} className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border transition-all ${!isOpen ? 'opacity-70 grayscale-[50%]' : 'active:scale-[0.98] cursor-pointer hover:shadow-md'}`}>
                  <div className="h-40 w-full relative bg-gray-100">
                    <img src={quan.image_url || getCategoryImage(monDangChon.category, mainTab)} alt={quan.restaurant_name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1 font-black text-xs text-gray-900 shadow-sm"><Star size={12} className="text-yellow-500 fill-yellow-500"/> 4.9</div>
                    
                    {isOpen && <div className="absolute bottom-3 right-3 bg-green-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center gap-1.5 border border-white/20"><StoreIcon size={12} /> Đang mở cửa</div>}
                    {isSoon && <div className="absolute inset-0 bg-yellow-600/30 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-yellow-500 text-white px-5 py-2 rounded-full font-black uppercase text-sm shadow-xl flex items-center gap-2"><Clock size={16}/> Chưa mở cửa</span></div>}
                    {isClosed && <div className="absolute inset-0 bg-red-800/40 backdrop-blur-[2px] flex items-center justify-center"><span className="bg-red-600 text-white px-5 py-2 rounded-full font-black uppercase text-sm shadow-xl flex items-center gap-2"><AlertCircle size={16}/> Đã đóng cửa</span></div>}
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div className="max-w-[65%]">
                      <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{quan.restaurant_name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1"><MapPin size={10} className="text-orange-500"/> {quan.address || 'Cà Mau'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Giá</p>
                      <p className={`text-xl font-black ${isOpen ? 'text-orange-600' : 'text-gray-500'}`}>{quan.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                </div>
               );
             })}

            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden mt-6">
               <div className="absolute -right-2 -bottom-2 opacity-20"><Store size={100} /></div>
               <div className="relative z-10">
                  <h2 className="text-lg font-black uppercase mb-1">Không thấy quán bạn thích?</h2>
                  <p className="text-xs font-medium text-blue-100 mb-4">Nhập tên quán bạn muốn mua, Shipper sẽ gom theo ca liền!</p>
                  <button onClick={() => { setShowCustom(!showCustom); setSoLuong(1); setGhiChuMon(""); }} className="bg-white text-blue-600 font-black text-sm px-4 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all w-full justify-center">{showCustom ? "ĐÓNG FORM" : <><Plus size={18}/> NHẬP TÊN QUÁN MUA HỘ</>}</button>
               </div>
            </div>

            {showCustom && (
              <div className="bg-white p-5 rounded-[2rem] border border-blue-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4">
                 <input type="text" value={customQuan} onChange={(e) => setCustomQuan(e.target.value)} placeholder="Tên quán..." className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-blue-500 text-sm font-black text-gray-900 placeholder-gray-400" />
                 <input type="text" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="Địa chỉ quán..." className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-blue-500 text-sm font-black text-gray-900 placeholder-gray-400" />
                 <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú (Không hành...)" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300 outline-blue-500 text-sm h-20 resize-none font-black text-gray-900 placeholder-gray-400"></textarea>
                 <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-4">
                    <span className="text-gray-900 font-bold text-sm">Số lượng</span>
                    <div className="flex gap-3 bg-gray-100 p-1 rounded-xl border border-gray-200"><button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-2 bg-white rounded-lg text-gray-900"><Minus size={16} /></button><span className="font-black text-lg w-6 text-center text-gray-900">{soLuong}</span><button onClick={() => setSoLuong(soLuong + 1)} className="p-2 bg-white rounded-lg text-blue-600"><Plus size={16} /></button></div>
                 </div>
                 <button onClick={handleAddCustomToCart} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl active:scale-95 shadow-md">NHỜ SHIPPER MUA HỘ</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-tight"><Flame size={18} className="text-red-500 fill-red-500"/> Chốt nhiều {timeLeft.active.name}</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {monGoc.filter(m => m.type === mainTab).slice(0, 6).map(m => (
                  <div key={m.id} onClick={() => { setMonDangChon(m); fetchRestaurantsForDish(m.name); }} className="w-[140px] bg-white rounded-3xl p-2 shadow-sm border border-gray-100 flex-shrink-0 active:scale-95 transition-all cursor-pointer">
                    <div className="h-[100px] bg-gray-100 rounded-[1.2rem] mb-2 overflow-hidden relative">
                       <img src={getCategoryImage(m.category, mainTab)} className="w-full h-full object-cover" alt={m.name} />
                       <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase shadow-sm">Hot</span>
                    </div>
                    <h3 className="font-black text-xs text-gray-900 line-clamp-1 mb-1 px-1">{m.name}</h3>
                    <div className="flex justify-between items-center px-1 pb-1"><span className="text-[10px] font-black text-orange-600">Gom chuyến</span><div className="bg-gray-900 text-white p-1 rounded-lg"><Plus size={12}/></div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2"><Utensils size={18} className="text-orange-500"/> Thực đơn chính</h2>
              {monGoc.filter(m => m.category === activeCategory && m.type === mainTab).map(m => (
                <div key={m.id} onClick={() => { setMonDangChon(m); fetchRestaurantsForDish(m.name); }} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 active:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden relative border border-gray-50">
                    <img src={getCategoryImage(m.category, mainTab)} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform" alt={m.name} />
                  </div>
                  <div className="flex flex-col justify-between flex-grow py-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><h3 className="text-base font-black text-gray-900 leading-tight">{m.name}</h3><span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-lg font-black uppercase">Gom đơn</span></div>
                      <p className="text-[10px] text-gray-500 font-bold line-clamp-2 leading-relaxed">{m.description || "Giao Nóng đảm bảo đồ ăn luôn nóng sốt."}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                       <div className="flex items-center gap-1.5"><span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-1 rounded-lg border border-orange-100 uppercase">Xem quán</span></div>
                       <div className="bg-gray-900 text-white p-1.5 rounded-xl group-active:scale-110 transition-transform shadow-lg shadow-gray-200"><ChevronRight size={14}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* POPUP CHỌN SỐ LƯỢNG KHI THÊM MỚI TỪ QUÁN */}
      {quanDangChon && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] p-8 slide-in-from-bottom-full duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-5">
              <div><p className="text-xs text-orange-600 font-black uppercase mb-1 flex items-center gap-1"><Store size={14}/> {quanDangChon.restaurant_name}</p><h2 className="text-2xl font-black text-gray-900 leading-tight">{monDangChon.name}</h2></div>
              <button onClick={() => setQuanDangChon(null)} className="p-2 bg-gray-100 rounded-full text-gray-900"><X size={20}/></button>
            </div>
            
            <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú cho quán (Vd: Ít cay, không hành...)" className="w-full p-4 rounded-2xl border border-gray-200 text-sm h-24 mb-6 bg-white font-black text-gray-900 placeholder-gray-400 outline-orange-500"></textarea>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-gray-900 font-black text-lg uppercase tracking-tight">Số lượng</span>
              <div className="flex gap-5 bg-gray-100 p-2 rounded-2xl border border-gray-200">
                <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900"><Minus size={18}/></button>
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

      {/* GIỎ HÀNG THÔNG MINH CÓ NÚT TĂNG GIẢM TRỰC TIẾP */}
      {totalQty > 0 && !quanDangChon && !monDangChon && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-gray-200 max-w-md mx-auto rounded-t-[2.5rem] z-40 shadow-[0_-15px_50px_rgba(0,0,0,0.1)]">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm mb-4 max-h-[55vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
               <h3 className="font-black text-gray-900 uppercase text-xs flex items-center gap-2"><ShoppingCart size={16}/> Đơn của Cô/Chú ({totalQty})</h3>
               <button onClick={() => { setCart([]); localStorage.removeItem("giao_nong_cart"); }} className="text-red-500 text-[10px] font-black uppercase bg-red-50 px-2 py-1 rounded-lg">Xóa hết</button>
             </div>
             
             <div className="space-y-4">
               {cart.map(i => (
                 <div key={i.id} className="flex justify-between items-center gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                   <div className="max-w-[50%]">
                     <p className="font-black text-sm text-gray-900 leading-tight line-clamp-2">{i.tenMon}</p>
                     <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Tại: {i.tenQuan}</p>
                     {i.ghiChu && <p className="text-[10px] text-gray-600 italic mt-0.5">"{i.ghiChu}"</p>}
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                     <p className="font-black text-sm text-gray-900">{(i.gia * i.soLuong).toLocaleString('vi-VN')}đ</p>
                     {/* BỘ NÚT TĂNG GIẢM XÓA TRỰC TIẾP */}
                     <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button onClick={() => handleUpdateQuantity(i.id, -1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                           {i.soLuong === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} className="text-gray-900" />}
                        </button>
                        <span className="font-black text-sm w-6 text-center text-gray-900">{i.soLuong}</span>
                        <button onClick={() => handleUpdateQuantity(i.id, 1)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm active:scale-95 transition-transform text-orange-600">
                           <Plus size={14} />
                        </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* LUẬT 2: CẢNH BÁO VƯỢT QUÁ 5 MÓN (ĐỎ) */}
             {isOverLimit && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-200 mt-4 mb-4 animate-in fade-in">
                  <div className="flex gap-2 items-center mb-1.5">
                    <AlertTriangle className="text-red-600 shrink-0" size={18}/>
                    <p className="text-[11px] font-black text-red-700 leading-tight uppercase">Vượt quá 5 món / Đơn</p>
                  </div>
                  <p className="text-[10px] text-red-800 font-bold pl-6 italic">
                    * Dạ để đảm bảo đồ ăn giữ được độ nóng và tài xế chở an toàn, hệ thống chỉ nhận tối đa 5 món/đơn. Cô/Chú mua nhiều hơn vui lòng tách làm 2 đơn giúp tụi con nhé! ❤️
                  </p>
                </div>
             )}

             {/* LUẬT 3: YÊU CẦU CỌC VÌ ĐƠN > 200K (XANH DƯƠNG) */}
             {requireDeposit && !isOverLimit && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mt-4 mb-4 animate-in fade-in">
                  <div className="flex gap-2 items-center mb-1.5">
                    <ShieldAlert className="text-blue-600 shrink-0" size={18}/>
                    <p className="text-[11px] font-black text-blue-700 leading-tight uppercase">Đơn lớn ({finalTotal.toLocaleString('vi-VN')}đ) - Yêu cầu Cọc</p>
                  </div>
                  <p className="text-[10px] text-blue-800 font-bold pl-6 italic">
                    * Dạ do đơn hàng giá trị cao, tài xế không mang đủ tiền mặt để ứng trước. Cô/Chú anh chị thông cảm chuyển khoản hoặc cọc giúp tụi con để tài xế an tâm mua hàng nóng hổi nha! ❤️
                  </p>
                </div>
             )}

             <div className="mt-5 bg-orange-50 p-3 rounded-xl border border-orange-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-500 fill-orange-500" />
                    <span className="text-[11px] font-black text-orange-900 uppercase">Tích lũy đơn này</span>
                </div>
                <span className="text-sm font-black text-orange-600">+{diemTichLuy} điểm</span>
             </div>

             <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2 mb-4">
               <div className="flex justify-between items-center"><span className="text-gray-500 text-xs font-bold uppercase">Tổng tiền món</span><span className="font-black text-gray-900 text-sm">{cartTotal.toLocaleString('vi-VN')}đ</span></div>
               <div className="flex justify-between items-center"><span className="text-gray-500 text-xs font-bold uppercase">Phí gom chuyến</span><span className="font-black text-orange-600 text-sm">{serviceFee.toLocaleString('vi-VN')}đ</span></div>
               {vipDiscountPercent > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-green-600 text-xs font-black uppercase flex items-center gap-1"><HeartHandshake size={14}/> VIP Giảm ({vipDiscountPercent}%)</span>
                    <span className="font-black text-green-600 text-sm">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
               )}
             </div>

             <div className="mt-2 pt-5 border-t border-gray-100 space-y-3">
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Tên Cô/Chú" className="w-full p-3 border border-gray-300 rounded-xl text-sm font-black bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500" />
                <input type="tel" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="SĐT liên hệ" className="w-full p-3 border border-gray-300 rounded-xl text-sm font-black bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500" />
                <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Địa chỉ giao: Số nhà, tên đường..." className="w-full p-3 border border-gray-300 rounded-xl text-sm font-black bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500" />
             </div>

             <div className="mt-5">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Thanh toán (Chọn 1)</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (requireDeposit) {
                        alert("Đơn hàng trên 200k Cô/Chú vui lòng chọn Chuyển khoản/Cọc giúp tụi con nhé!");
                        return;
                      }
                      setPaymentMethod('cash');
                    }} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'cash' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500'} ${requireDeposit ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    <Banknote size={14}/> TIỀN MẶT
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('bank')} 
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'bank' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <CreditCard size={14}/> CHUYỂN KHOẢN
                  </button>
                </div>
             </div>
          </div>

          <button onClick={handleCreateOrder} disabled={isSubmitting || isOverLimit} className={`w-full text-white p-5 rounded-[2rem] shadow-2xl mt-4 flex justify-between items-center transition-all ${isOverLimit ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 active:scale-95'}`}>
            <div className="text-left leading-none">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{requireDeposit ? 'Số tiền cần cọc/CK' : 'Cần thanh toán'}</p>
              <p className={`text-2xl font-black ${isOverLimit ? 'text-gray-200' : 'text-orange-500'}`}>{finalTotal.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className={`px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 ${isOverLimit ? 'bg-gray-500 text-gray-300' : 'bg-orange-600 shadow-lg'}`}>
              {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : 'XÁC NHẬN ĐƠN'} <ChevronRight size={16}/>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}