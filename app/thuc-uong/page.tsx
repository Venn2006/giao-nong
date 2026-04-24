"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Minus, X, Star, ChevronRight, Store, Loader2, Clock, Info, ShoppingCart, Coffee, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ThucUongMenu() {
  const router = useRouter();
  
  const [danhMuc, setDanhMuc] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [monDangChon, setMonDangChon] = useState<any>(null); 
  const [quanDangChon, setQuanDangChon] = useState<any>(null); 
  
  const [showCustom, setShowCustom] = useState(false);
  const [customQuan, setCustomQuan] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  const [soLuong, setSoLuong] = useState(1);
  const [size, setSize] = useState("M");
  const [duong, setDuong] = useState("100%");
  const [da, setDa] = useState("100%");
  const [toppings, setToppings] = useState<string[]>([]);
  const [ghiChuMon, setGhiChuMon] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const drinkCategories = ["Cà Phê", "Trà Sữa", "Trà Trái Cây", "Sinh Tố & Nước Ép"];
  const danhSachTopping = [{ ten: "Trân châu đen", gia: 5000 }, { ten: "Thạch phô mai", gia: 7000 }, { ten: "Pudding trứng", gia: 5000 }, { ten: "Kem macchiato", gia: 10000 }];

  const getCategoryImage = (cat: string) => {
    if (cat === "Cà Phê") return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80";
    if (cat === "Trà Sữa") return "https://images.unsplash.com/photo-1558857563-b37102e99e00?w=500&q=80";
    if (cat === "Trà Trái Cây") return "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80";
    if (cat === "Sinh Tố & Nước Ép") return "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&q=80";
    return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80";
  };

  const getDanhSachQuanNuoc = (tenMon: string) => {
    return [
      { id: 1, ten: `Tiệm Cô Ba - ${tenMon}`, diaChi: "Chà Là", gia: 25000, sao: 4.9, khoangCach: "1.2 km", thoiGian: "10 phút", hinh: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&q=80" },
      { id: 2, ten: `Góc Cafe Đầm Dơi`, diaChi: "Đầm Dơi", gia: 20000, sao: 4.7, khoangCach: "4.5 km", thoiGian: "20 phút", hinh: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80" },
    ];
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("giao_nong_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const fetchMenu = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('menu_items').select('*');
      if (data) {
        const drinks = data.filter(item => drinkCategories.includes(item.category));
        setMenuItems(drinks);
        const categoriesMap = new Map();
        drinks.forEach(item => {
          if (!categoriesMap.has(item.category)) { categoriesMap.set(item.category, { id: item.category, ten: item.category, hinh: getCategoryImage(item.category), soMon: 0 }); }
          categoriesMap.get(item.category).soMon += 1;
        });
        setDanhMuc(Array.from(categoriesMap.values()));
      }
      setIsLoading(false);
    };
    fetchMenu();
  }, []);

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const toggleTopping = (topName: string) => {
    if (toppings.includes(topName)) setToppings(toppings.filter(t => t !== topName));
    else setToppings([...toppings, topName]);
  };

  const getGiaHienTai = () => {
    if (!quanDangChon) return 0;
    let total = quanDangChon.gia;
    if (size === "L") total += 10000;
    toppings.forEach(t => {
      const topData = danhSachTopping.find(x => x.ten === t);
      if (topData) total += topData.gia;
    });
    return total;
  };

  const handleAddToCartPopup = () => {
    let noteParts = [`Size ${size}`, `Đường ${duong}`, `Đá ${da}`];
    if (toppings.length > 0) noteParts.push(`Thêm: ${toppings.join(", ")}`);
    if (ghiChuMon) noteParts.push(`Note: ${ghiChuMon}`);

    const finalNote = noteParts.join(" | ");

    const newItem = { id: Math.random().toString(), tenMon: monDangChon.name, tenQuan: quanDangChon.ten, gia: getGiaHienTai(), soLuong: soLuong, ghiChu: finalNote };
    
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart)); 
    
    showSuccessToast(`Đã thêm ${soLuong} ly ${monDangChon.name} vào giỏ`);
    setQuanDangChon(null); setMonDangChon(null); setSize("M"); setDuong("100%"); setDa("100%"); setToppings([]); setGhiChuMon(""); setSoLuong(1);
  };

  const handleAddCustomToCart = () => {
    if (!customQuan) { alert("Điền tên quán giúp Giao Nóng nha!"); return; }
    const newItem = { id: Math.random().toString(), tenMon: monDangChon.name, tenQuan: customQuan + (customAddress ? ` (${customAddress})` : ''), gia: 30000, soLuong: soLuong, ghiChu: `[MUA HỘ QUÁN NGOÀI] ${ghiChuMon}` };
    const updatedCart = [...cart, newItem];
    setCart(updatedCart);
    localStorage.setItem("giao_nong_cart", JSON.stringify(updatedCart));
    
    showSuccessToast(`Đã nhờ Shipper mua ly ${monDangChon.name}`);
    setShowCustom(false); setMonDangChon(null); setSize("M"); setDuong("100%"); setDa("100%"); setToppings([]); setGhiChuMon(""); setSoLuong(1); setCustomQuan(""); setCustomAddress("");
  };

  const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);

  if (isLoading) return <div className="min-h-screen bg-[#fcfaf1] flex flex-col items-center justify-center max-w-md mx-auto"><Loader2 className="animate-spin text-blue-600 mb-4" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-24 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {toastMsg && (
        <div className="fixed top-[100px] left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-full font-black text-sm shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 w-max max-w-[90%] border border-gray-700">
          <CheckCircle2 size={18} className="text-green-400"/> {toastMsg}
        </div>
      )}

      {/* HEADER KÈM THANH ĐIỀU HƯỚNG */}
      <div className="sticky top-0 z-20 bg-white rounded-b-2xl shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (monDangChon) { setMonDangChon(null); setQuanDangChon(null); setShowCustom(false); } else if (activeCategory) { setActiveCategory(null); } else { router.push('/'); } }} className="text-gray-900 p-2 rounded-full bg-gray-100 active:scale-95"><ArrowLeft size={20}/></button>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-tight">{monDangChon ? monDangChon.name : (activeCategory || "Menu Thức Uống")}</h1>
              <p className="text-[10px] text-gray-500 font-bold">{monDangChon ? "Chọn quán để mua" : "Giải khát siêu tốc"}</p>
            </div>
          </div>
        </div>
        
        {/* TABS CHUYỂN TRANG */}
        {!monDangChon && (
          <div className="flex border-t border-gray-100">
             <button onClick={() => router.replace('/do-an')} className="flex-1 py-3 text-center font-bold text-gray-400 border-b-[3px] border-transparent hover:bg-gray-50 active:bg-gray-100 transition-colors">🍔 ĐỒ ĂN</button>
             <button onClick={() => router.replace('/thuc-uong')} className="flex-1 py-3 text-center font-black text-blue-600 border-b-[3px] border-blue-600 bg-blue-50/50">🥤 THỨC UỐNG</button>
          </div>
        )}
      </div>

      <div className="p-4">
        {monDangChon ? (
          <div className="space-y-5 animate-in slide-in-from-right-4">
            {getDanhSachQuanNuoc(monDangChon.name).map((quan) => (
              <div key={quan.id} onClick={() => { setQuanDangChon(quan); setSoLuong(1); setSize("M"); setDuong("100%"); setDa("100%"); setToppings([]); setGhiChuMon(""); }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer">
                <div className="h-48 w-full relative">
                  <img src={quan.hinh} alt={quan.ten} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm text-gray-900 font-black">{quan.sao}</span></div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"><Clock size={12}/> {quan.thoiGian}</div>
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div><h3 className="text-xl font-black text-gray-900 mb-1">{quan.ten}</h3><p className="text-sm text-gray-500 font-medium flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {quan.diaChi}</p></div>
                  <div className="text-right flex-shrink-0 ml-2"><p className="text-[10px] text-gray-400 font-bold uppercase">Giá từ</p><p className="text-xl font-black text-blue-600">{quan.gia.toLocaleString('vi-VN')}đ</p></div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden mt-6">
               <div className="absolute -right-2 -bottom-2 opacity-20"><Coffee size={100} /></div>
               <div className="relative z-10">
                  <h2 className="text-lg font-black uppercase mb-1">Không thấy quán bạn thích?</h2>
                  <p className="text-xs font-medium text-blue-100 mb-4">Nhập tên tiệm nước bạn muốn, Shipper chạy đi mua ngay!</p>
                  <button onClick={() => { setShowCustom(!showCustom); setSoLuong(1); setSize("M"); setDuong("100%"); setDa("100%"); setToppings([]); setGhiChuMon(""); }} className="bg-white text-blue-600 font-black text-sm px-4 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all shadow-sm w-full justify-center">
                    {showCustom ? "ĐÓNG FORM" : <><Plus size={18}/> NHẬP TÊN QUÁN MUA HỘ</>}
                  </button>
               </div>
            </div>

            {/* FORM MUA HỘ ÉP MÀU CHỮ DARK MODE */}
            {showCustom && (
              <div className="bg-white p-5 rounded-[2rem] border border-blue-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4">
                 <div className="flex items-center gap-2 text-blue-600 mb-2 border-b border-gray-100 pb-3"><Info size={18}/> <p className="font-black text-sm uppercase">Thông tin quán cần mua</p></div>
                 <input type="text" value={customQuan} onChange={(e) => setCustomQuan(e.target.value)} placeholder="Tên quán..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold placeholder:text-gray-400" />
                 <input type="text" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="Địa chỉ quán..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 border border-gray-200 rounded-xl outline-blue-500 text-sm font-bold placeholder:text-gray-400" />
                 <textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú pha chế..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-3 rounded-xl border border-gray-200 outline-blue-500 text-sm h-20 resize-none font-bold placeholder:text-gray-400 mt-2"></textarea>
                 <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-4">
                    <span className="text-gray-900 font-bold text-sm">Số lượng</span>
                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-200">
                      <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-2 bg-white rounded-lg shadow-sm text-gray-600"><Minus size={16} /></button>
                      <span className="font-black text-lg w-6 text-center text-gray-900">{soLuong}</span>
                      <button onClick={() => setSoLuong(soLuong + 1)} className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Plus size={16} /></button>
                    </div>
                 </div>
                 <button onClick={handleAddCustomToCart} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-md">
                    <ShoppingCart size={18} /> THÊM VÀO GIỎ HÀNG
                 </button>
              </div>
            )}
          </div>
        ) : !activeCategory ? (
          <div className="grid grid-cols-1 gap-4">
            {danhMuc.map((muc) => (
              <div key={muc.id} onClick={() => setActiveCategory(muc.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer relative">
                <div className="h-40 bg-gray-200 w-full"><img src={muc.hinh} alt={muc.ten} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                  <div><h3 className="text-2xl font-black text-white mb-1">{muc.ten}</h3><p className="text-blue-300 font-bold text-sm flex items-center gap-1"><Coffee size={14}/> {muc.soMon} món đang bán</p></div>
                  <div className="bg-blue-600 text-white p-2 rounded-full"><ChevronRight size={24} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {menuItems.filter(item => item.category === activeCategory).map((mon) => (
              <div key={mon.id} onClick={() => setMonDangChon(mon)} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 active:bg-gray-50 cursor-pointer">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden"><img src={activeCategory ? getCategoryImage(activeCategory) : ""} alt={mon.name} className="w-full h-full object-cover opacity-80" /></div>
                <div className="flex flex-col justify-between flex-grow py-1">
                  <div><h3 className="text-base font-black text-gray-900 leading-tight mb-1">{mon.name}</h3><p className="text-[10px] text-gray-500 line-clamp-2">{mon.description}</p></div>
                  <div className="flex justify-between items-end mt-2"><span className="font-black text-blue-600 text-sm">Từ 20.000đ</span><button className="bg-blue-50 text-blue-600 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-blue-100 uppercase">Chọn quán</button></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POPUP PHA CHẾ */}
        {quanDangChon && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in max-w-md mx-auto">
            <div className="bg-white w-full rounded-t-[2.5rem] p-6 slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-blue-600 font-bold flex items-center gap-1 mb-1"><Store size={14}/> {quanDangChon.ten}</p>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{monDangChon.name}</h2>
                </div>
                <button onClick={() => setQuanDangChon(null)} className="p-2 bg-gray-100 rounded-full active:bg-gray-200"><X size={20} className="text-gray-600"/></button>
              </div>

              <div className="mb-5">
                 <h3 className="font-black text-gray-900 mb-2 text-sm uppercase">Chọn Size</h3>
                 <div className="flex gap-3">
                   <button onClick={() => setSize("M")} className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all ${size === "M" ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Size M</button>
                   <button onClick={() => setSize("L")} className={`flex-1 py-3 rounded-xl font-black text-sm border-2 transition-all ${size === "L" ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>Size L (+10k)</button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                 <div>
                   <h3 className="font-black text-gray-900 mb-2 text-sm uppercase">Lượng Đường</h3>
                   <div className="flex flex-col gap-2">
                     {['100%', '50%', 'Không đường'].map(lv => (
                       <button key={lv} onClick={() => setDuong(lv)} className={`py-2 rounded-lg font-bold text-xs border-2 ${duong === lv ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{lv}</button>
                     ))}
                   </div>
                 </div>
                 <div>
                   <h3 className="font-black text-gray-900 mb-2 text-sm uppercase">Lượng Đá</h3>
                   <div className="flex flex-col gap-2">
                     {['100%', '50%', 'Không đá'].map(lv => (
                       <button key={lv} onClick={() => setDa(lv)} className={`py-2 rounded-lg font-bold text-xs border-2 ${da === lv ? 'bg-cyan-50 border-cyan-400 text-cyan-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{lv}</button>
                     ))}
                   </div>
                 </div>
              </div>

              <div className="mb-5">
                 <h3 className="font-black text-gray-900 mb-2 text-sm uppercase">Thêm Topping</h3>
                 <div className="space-y-2">
                   {danhSachTopping.map((top) => (
                     <label key={top.ten} className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-colors ${toppings.includes(top.ten) ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3"><input type="checkbox" checked={toppings.includes(top.ten)} onChange={() => toggleTopping(top.ten)} className="w-5 h-5 accent-blue-600 rounded" /><span className="font-bold text-sm text-gray-900">{top.ten}</span></div>
                        <span className="font-black text-gray-500 text-xs">+{top.gia.toLocaleString('vi-VN')}đ</span>
                     </label>
                   ))}
                 </div>
              </div>

              <div className="mb-6"><textarea value={ghiChuMon} onChange={(e) => setGhiChuMon(e.target.value)} placeholder="Ghi chú thêm..." style={{ color: '#111827', backgroundColor: '#f9fafb' }} className="w-full p-4 rounded-2xl border border-gray-200 outline-blue-500 text-sm h-20 resize-none font-bold placeholder:text-gray-400"></textarea></div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-900 font-bold text-lg">Số lượng ly</span>
                <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                  <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-3 bg-white rounded-xl shadow-sm text-gray-600 active:bg-gray-100 disabled:opacity-50" disabled={soLuong <= 1}><Minus size={20} /></button>
                  <span className="font-black text-2xl w-8 text-center text-gray-900">{soLuong}</span>
                  <button onClick={() => setSoLuong(soLuong + 1)} className="p-3 bg-white rounded-xl shadow-sm text-blue-600 active:bg-gray-100"><Plus size={20} /></button>
                </div>
              </div>

              <button onClick={handleAddToCartPopup} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center active:scale-[0.98] transition-transform">
                <div className="text-left"><p className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Tổng cộng</p><p className="text-2xl font-black">{(getGiaHienTai() * soLuong).toLocaleString('vi-VN')}đ</p></div>
                <div className="flex items-center gap-1 font-black text-sm bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm"><ShoppingCart size={18}/> BỎ VÀO GIỎ</div>
              </button>

            </div>
          </div>
        )}

        {/* THANH GIỎ HÀNG */}
        {totalQty > 0 && !quanDangChon && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-md mx-auto rounded-t-3xl z-40 animate-in slide-in-from-bottom-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <button onClick={() => router.push('/thanh-toan')} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition-all shadow-lg flex justify-between px-6 items-center">
              <span className="bg-white/25 px-3 py-1 rounded-lg text-sm shadow-inner">{totalQty} món</span>
              <span>ĐẾN THANH TOÁN <ChevronRight size={18} className="inline"/></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}