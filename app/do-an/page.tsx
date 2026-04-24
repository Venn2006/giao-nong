"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Plus, Minus, X, Star, ChevronRight, Store, Loader2, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DoAnMenu() {
  const router = useRouter();
  
  const [danhMuc, setDanhMuc] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [monDangChon, setMonDangChon] = useState<any>(null); 
  const [quanDangChon, setQuanDangChon] = useState<any>(null); 
  const [soLuong, setSoLuong] = useState(1);
  
  // STATE MỚI: GHI CHÚ CHO TỪNG MÓN
  const [ghiChuMon, setGhiChuMon] = useState("");

  const getCategoryImage = (cat: string) => {
    if (cat === "Bún & Phở") return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg";
    if (cat === "Cơm & Xôi") return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/com-tam.webp";
    if (cat === "Bánh Mì") return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/banh-mi.jpg"; 
    if (cat === "Cháo & Lẩu") return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/chao-lau.jpg"; 
    if (cat === "Ăn Vặt") return "https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/an-vat.jpg"; 
    return "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80";
  };

  const getDanhSachQuan = (tenMon: string) => {
    return [
      { id: 1, ten: `Quán Phượng - ${tenMon}`, diaChi: "Phường 5, Cà Mau", gia: 45000, sao: 4.8, khoangCach: "1.2 km", thoiGian: "15 phút", hinh: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=80" },
      { id: 2, ten: `Tiệm Cô Ba`, diaChi: "Chợ Phường 8", gia: 35000, sao: 4.5, khoangCach: "2.5 km", thoiGian: "25 phút", hinh: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=500&q=80" },
      { id: 3, ten: `Đặc Sản Gia Truyền`, diaChi: "Ngã 3 Chà Là", gia: 50000, sao: 4.9, khoangCach: "0.8 km", thoiGian: "10 phút", hinh: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80" },
    ];
  };

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('menu_items').select('*');
      
      if (data) {
        setMenuItems(data);
        const categoriesMap = new Map();
        data.forEach(item => {
          if (!categoriesMap.has(item.category)) {
            categoriesMap.set(item.category, { id: item.category, ten: item.category, hinh: getCategoryImage(item.category), soMon: 0 });
          }
          categoriesMap.get(item.category).soMon += 1;
        });
        setDanhMuc(Array.from(categoriesMap.values()));
      }
      setIsLoading(false);
    };

    fetchMenu();
  }, []);

  const handleCheckout = () => {
    // Đã nhét thêm ghiChuMon vào Giỏ hàng
    const newItem = {
      id: Math.random().toString(),
      tenMon: monDangChon.name,
      tenQuan: quanDangChon.ten,
      gia: quanDangChon.gia,
      soLuong: soLuong,
      ghiChu: ghiChuMon
    };
    
    // Lấy giỏ hàng cũ ra cộng dồn vào (để mốt mua nhiều món được)
    const existingCart = JSON.parse(localStorage.getItem("giao_nong_cart") || "[]");
    localStorage.setItem("giao_nong_cart", JSON.stringify([...existingCart, newItem])); 
    
    router.push('/thanh-toan');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfaf1] flex flex-col items-center justify-center max-w-md mx-auto">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      </div>
    );
  }

  // TRANG DANH SÁCH QUÁN
  if (monDangChon) {
    const danhSachQuan = getDanhSachQuan(monDangChon.name);
    return (
      <div className="min-h-screen bg-[#fcfaf1] pb-10 font-sans max-w-md mx-auto shadow-2xl relative animate-in slide-in-from-right-8 duration-300">
        <header className="bg-white p-4 flex items-center gap-3 shadow-sm sticky top-0 z-10 rounded-b-2xl">
          <button onClick={() => { setMonDangChon(null); setQuanDangChon(null); }} className="text-gray-600 active:bg-gray-200 p-2 rounded-full bg-gray-50"><ArrowLeft size={20}/></button>
          <div><h1 className="text-xl font-black text-gray-800 leading-tight">{monDangChon.name}</h1><p className="text-[10px] text-gray-500 font-bold">Chọn quán để đặt món</p></div>
        </header>

        <div className="p-4 space-y-5">
          {danhSachQuan.map((quan) => (
            <div key={quan.id} onClick={() => { setQuanDangChon(quan); setSoLuong(1); setGhiChuMon(""); }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="h-48 w-full relative">
                <img src={quan.hinh} alt={quan.ten} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm"><Star size={14} className="text-yellow-500 fill-yellow-500" /><span className="text-sm text-gray-800 font-black">{quan.sao}</span></div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1"><Clock size={12}/> {quan.thoiGian}</div>
              </div>
              <div className="p-5 flex justify-between items-center">
                <div><h3 className="text-xl font-black text-gray-800 mb-1">{quan.ten}</h3><p className="text-sm text-gray-500 font-medium flex items-center gap-1"><MapPin size={14} className="text-orange-500"/> {quan.diaChi} ({quan.khoangCach})</p></div>
                <div className="text-right flex-shrink-0 ml-2"><p className="text-[10px] text-gray-400 font-bold uppercase">Giá từ</p><p className="text-xl font-black text-orange-600">{quan.gia.toLocaleString('vi-VN')}đ</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* POPUP CHỌN SỐ LƯỢNG & GHI CHÚ */}
        {quanDangChon && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in max-w-md mx-auto">
            <div className="bg-white w-full rounded-t-[2.5rem] p-6 slide-in-from-bottom-full duration-300">
              
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-orange-600 font-bold flex items-center gap-1 mb-1"><Store size={14}/> {quanDangChon.ten}</p>
                  <h2 className="text-2xl font-black text-gray-800 leading-tight">{monDangChon.name}</h2>
                </div>
                <button onClick={() => setQuanDangChon(null)} className="p-2 bg-gray-100 rounded-full active:bg-gray-200"><X size={20} /></button>
              </div>

              {/* KHU VỰC GHI CHÚ NẰM Ở ĐÂY NÈ! */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-gray-800 font-bold text-sm mb-2">
                  <MessageSquare size={16} className="text-gray-500"/> Ghi chú cho quán (Tùy chọn)
                </label>
                <textarea
                  value={ghiChuMon}
                  onChange={(e) => setGhiChuMon(e.target.value)}
                  placeholder="Ví dụ: Không hành, nước lèo để riêng, ít cay..."
                  className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-200 focus:border-orange-500 outline-none text-sm h-24 resize-none font-medium placeholder:text-gray-400 placeholder:font-normal"
                ></textarea>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-800 font-bold text-lg">Số lượng</span>
                <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                  <button onClick={() => soLuong > 1 && setSoLuong(soLuong - 1)} className="p-3 bg-white rounded-xl shadow-sm text-gray-600 active:bg-gray-100 disabled:opacity-50" disabled={soLuong <= 1}><Minus size={20} /></button>
                  <span className="font-black text-2xl w-8 text-center text-gray-800">{soLuong}</span>
                  <button onClick={() => setSoLuong(soLuong + 1)} className="p-3 bg-white rounded-xl shadow-sm text-orange-600 active:bg-gray-100"><Plus size={20} /></button>
                </div>
              </div>

              <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 rounded-2xl shadow-[0_8px_30px_rgba(234,88,12,0.3)] flex justify-between items-center active:scale-[0.98] transition-transform">
                <div className="text-left"><p className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Thêm vào giỏ hàng</p><p className="text-2xl font-black">{(quanDangChon.gia * soLuong).toLocaleString('vi-VN')}đ</p></div>
                <div className="flex items-center gap-1 font-black text-sm bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">CHỐT ĐƠN <ChevronRight size={18} /></div>
              </button>

            </div>
          </div>
        )}
      </div>
    );
  }

  // TRANG MENU MẶC ĐỊNH 
  const dsMonTheoDanhMuc = menuItems.filter(item => item.category === activeCategory);
  const categoryImage = activeCategory ? getCategoryImage(activeCategory) : "";

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-10 font-sans max-w-md mx-auto shadow-2xl relative">
      <header className="bg-white p-4 flex items-center gap-3 shadow-sm sticky top-0 z-10 rounded-b-2xl">
        {activeCategory ? (<button onClick={() => setActiveCategory(null)} className="text-gray-600 active:bg-gray-200 p-2 rounded-full bg-gray-50"><ArrowLeft size={20}/></button>) : (<Link href="/"><button className="text-gray-600 active:bg-gray-200 p-2 rounded-full bg-gray-50"><ArrowLeft size={20}/></button></Link>)}
        <div><h1 className="text-xl font-black text-gray-800">{activeCategory || "Khám Phá Menu"}</h1>{activeCategory && <p className="text-[10px] text-gray-500 font-bold">{dsMonTheoDanhMuc.length} món ngon cho bạn</p>}</div>
      </header>
      <div className="p-4">
        {!activeCategory && (
          <div className="grid grid-cols-1 gap-4">
            {danhMuc.map((muc) => (
              <div key={muc.id} onClick={() => setActiveCategory(muc.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer relative">
                <div className="h-40 bg-gray-200 w-full"><img src={muc.hinh} alt={muc.ten} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                  <div><h3 className="text-2xl font-black text-white mb-1">{muc.ten}</h3><p className="text-orange-300 font-bold text-sm flex items-center gap-1"><Store size={14}/> {muc.soMon} món đang bán</p></div>
                  <div className="bg-orange-600 text-white p-2 rounded-full"><ChevronRight size={24} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeCategory && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {dsMonTheoDanhMuc.map((mon) => (
              <div key={mon.id} onClick={() => setMonDangChon(mon)} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 active:bg-gray-50 cursor-pointer">
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden"><img src={categoryImage} alt={mon.name} className="w-full h-full object-cover opacity-80" /></div>
                <div className="flex flex-col justify-between flex-grow py-1">
                  <div><h3 className="text-base font-black text-gray-800 leading-tight mb-1">{mon.name}</h3><p className="text-[10px] text-gray-500 line-clamp-2">{mon.description}</p></div>
                  <div className="flex justify-between items-end mt-2"><span className="font-black text-orange-600 text-sm">Từ 35.000đ</span><button className="bg-orange-50 text-orange-600 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-orange-100 uppercase">Chọn quán</button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}