"use client";
import React, { useState, useEffect } from "react";
import { 
  Soup, Coffee, Package, Car, MapPin, Clock, 
  Crown, Gift, Zap, Star, Calendar
} from "lucide-react";
import Link from "next/link";

export default function GiaoNongHome() {
  // 1. STATE LƯU NGƯỜI DÙNG & HYDRATION
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  useEffect(() => {
    setIsMounted(true);
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  // 2. LOGIC HẠNG THÀNH VIÊN
  const getTierDetails = (points: number) => {
    if (points >= 10000) return { name: "Kim Cương", color: "from-gray-900 via-gray-800 to-black", discount: 15, nextTier: "Max", icon: <Crown className="text-blue-400" /> };
    if (points >= 3000) return { name: "Vàng", color: "from-yellow-600 via-yellow-500 to-yellow-700", discount: 10, nextTier: "Kim Cương", icon: <Crown className="text-white" /> };
    if (points >= 1000) return { name: "Bạc", color: "from-slate-400 via-slate-300 to-slate-500", discount: 5, nextTier: "Vàng", icon: <Crown className="text-gray-100" /> };
    return { name: "Đồng", color: "from-orange-700 via-orange-600 to-orange-800", discount: 0, nextTier: "Bạc", icon: <Zap className="text-orange-300" /> };
  };

  const tier = user ? getTierDetails(user.points || 0) : null;

  // 3. LOGIC TỰ ĐỘNG TÍNH CA GIAO HÀNG
  const shiftSchedule = [
    { id: "sang", name: "Ca Sáng", close: "06:30", delivery: "07:00 - 08:00", start: 0, end: 8 },
    { id: "trua", name: "Ca Trưa", close: "10:00", delivery: "10:30 - 12:00", start: 8, end: 12 },
    { id: "chieu", name: "Ca Chiều", close: "14:00", delivery: "14:00 - 16:00", start: 12, end: 16 },
    { id: "toi", name: "Ca Tối", close: "17:30", delivery: "18:00 - 19:30", start: 16, end: 24 },
  ];

  const currentHour = new Date().getHours() + new Date().getMinutes() / 60;
  const activeShift = shiftSchedule.find(s => currentHour >= s.start && currentHour < s.end) || shiftSchedule[0];

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-10 font-sans max-w-md mx-auto shadow-2xl">
      
      {/* HEADER */}
      <header className="p-4 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm rounded-b-2xl">
        <div>
          <h1 className="text-2xl font-black text-orange-600 tracking-tighter">GIAO NÓNG</h1>
          <div className="flex items-center text-[10px] text-gray-500 gap-1 font-bold">
            <MapPin size={12} className="text-orange-500" /> Cà Mau → Đầm Dơi, Chà Là
          </div>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-teal-700">Đang nhận đơn</span>
        </div>
      </header>

      {/* THẺ THÀNH VIÊN / NÚT ĐĂNG KÝ */}
      {isMounted && (
        user && tier ? (
          <div className={`mx-4 mt-4 bg-gradient-to-br ${tier.color} p-5 rounded-3xl shadow-lg text-white relative overflow-hidden transition-all`}>
            <div className="absolute -right-6 -top-6 opacity-10 rotate-12"><Crown size={120} /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">{tier.icon}</div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">{tier.name}</h2>
                  </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  Giảm {tier.discount}%
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                  <p className="text-xs opacity-80">{user.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-80 uppercase font-bold">Điểm tích lũy</p>
                  <p className="text-2xl font-black text-orange-300">{(user.points || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 bg-white p-5 rounded-3xl border border-orange-100 shadow-sm flex flex-col items-center text-center">
            <Gift className="text-orange-500 mb-2" size={32} />
            <h3 className="font-black text-gray-800 text-base">CHƯA CÓ THẺ THÀNH VIÊN?</h3>
            <p className="text-xs text-gray-500 mb-4 px-2">Đăng ký 1 lần duy nhất để không phải nhập lại địa chỉ & tích điểm giảm tới 15%</p>
            <Link href="/dang-ky" className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">
              ĐĂNG KÝ NGAY
            </Link>
          </div>
        )
      )}

      {/* KHỐI CA GIAO HÀNG HIỆN TẠI TỰ ĐỘNG */}
      <div className="mx-4 mt-4 bg-[#c84414] text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-sm font-semibold opacity-90 mb-1">Hôm nay, <span className="font-black uppercase">ĐANG CHỐT ĐƠN {activeShift.name}</span></p>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><span className="text-4xl font-black tracking-widest">{mins}</span></div>
            <span className="text-2xl font-black animate-pulse">:</span>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><span className="text-4xl font-black tracking-widest">{secs}</span></div>
          </div>
          <div className="bg-black/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
            <span>Giao: {activeShift.delivery}</span>
            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
            <span>Chốt: {activeShift.close}</span>
          </div>
        </div>
      </div>

      {/* NHẬP MÃ NGƯỜI QUEN */}
      <div className="mx-4 mt-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Nhập mã người quen</h3>
          <p className="text-[10px] text-gray-500">Nhận ưu đãi 20K phí ship!</p>
        </div>
        <button className="bg-orange-50 text-orange-600 border border-orange-200 font-bold px-4 py-2 rounded-xl text-xs active:bg-orange-100">
          Nhập mã
        </button>
      </div>

      {/* 4 NÚT DỊCH VỤ CHÍNH */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <Link href="/do-an" className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
          <div className="bg-orange-50 p-4 rounded-full"><Soup size={32} className="text-orange-600" /></div>
          <span className="font-black text-gray-800 text-sm">ĐỒ ĂN</span>
        </Link>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all cursor-pointer">
          <div className="bg-orange-50 p-4 rounded-full"><Coffee size={32} className="text-orange-600" /></div>
          <span className="font-black text-gray-800 text-sm">THỨC UỐNG</span>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all cursor-pointer">
          <div className="bg-blue-50 p-4 rounded-full"><Package size={32} className="text-blue-600" /></div>
          <span className="font-black text-gray-800 text-sm">GIAO HÀNG</span>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all cursor-pointer">
          <div className="bg-blue-50 p-4 rounded-full"><Car size={32} className="text-blue-600" /></div>
          <span className="font-black text-gray-800 text-sm">ĐẶT XE</span>
        </div>
      </div>

      {/* MÓN GỢI Ý NÓNG SỐT (Link ảnh xịn từ Supabase) */}
      <div className="mx-4 mt-6">
        <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
          Gợi Ý Nóng Sốt <Sparkles className="text-orange-500" size={20} />
        </h2>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card Món 1 - Bún Riêu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 relative">
              <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg" alt="Bún Riêu" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-white font-bold">4.8</span>
              </div>
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <div className="flex gap-1 mb-1">
                <span className="bg-orange-100 text-orange-800 text-[8px] font-bold px-1.5 py-0.5 rounded">Nổi bật</span>
                <span className="bg-gray-100 text-gray-600 text-[8px] font-bold px-1.5 py-0.5 rounded">Đậm đà</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">Bún Riêu Cua Biển Chà Là</h3>
              <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">Nước dùng ngọt thanh, gạch cua béo bùi, chuẩn vị miền Tây.</p>
              <div className="mt-auto">
                <p className="font-black text-orange-600 text-base mb-2">45.000đ</p>
                <Link href="/do-an" className="block text-center bg-orange-600 text-white font-bold py-2 rounded-xl text-xs active:bg-orange-700">
                  Đặt Ngay
                </Link>
              </div>
            </div>
          </div>

          {/* Card Món 2 - Cơm Tấm */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="h-32 bg-gray-200 relative">
              <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/com-tam.webp" alt="Cơm Tấm" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-white font-bold">4.9</span>
              </div>
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <div className="flex gap-1 mb-1">
                <span className="bg-orange-100 text-orange-800 text-[8px] font-bold px-1.5 py-0.5 rounded">Cơm Đêm</span>
                <span className="bg-gray-100 text-gray-600 text-[8px] font-bold px-1.5 py-0.5 rounded">Hương vị</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">Cơm Tấm Sườn Bì Ốp La</h3>
              <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">Cơm dẻo, thịt sườn nướng mỡ hành thơm lừng, chả trứng béo ngậy.</p>
              <div className="mt-auto">
                <p className="font-black text-orange-600 text-base mb-2">40.000đ</p>
                <Link href="/do-an" className="block text-center bg-orange-600 text-white font-bold py-2 rounded-xl text-xs active:bg-orange-700">
                  Đặt Ngay
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* LỊCH GIAO CẢ NGÀY */}
      <div className="mx-4 mt-6 p-5 bg-white rounded-3xl shadow-sm border border-gray-100 mb-10">
        <div className="flex items-center gap-2 mb-4 border-b pb-3">
          <Calendar className="text-gray-800" size={20} />
          <h2 className="font-black text-gray-800 text-lg">Lịch Giao Cả Ngày</h2>
        </div>
        
        <div className="space-y-3">
          {shiftSchedule.map((shift) => {
            const isCurrentlyActive = activeShift.id === shift.id;
            return (
              <div key={shift.id} className={`flex justify-between items-center p-3 rounded-2xl transition-all ${isCurrentlyActive ? 'bg-orange-50 border border-orange-200' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm uppercase ${isCurrentlyActive ? 'text-orange-700' : 'text-gray-700'}`}>{shift.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">Chốt đơn trước: <span className="text-gray-800">{shift.close}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Giao hàng</p>
                  <p className={`text-xs font-black ${isCurrentlyActive ? 'text-orange-600' : 'text-gray-800'}`}>{shift.delivery}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}