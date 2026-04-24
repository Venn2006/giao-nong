"use client";
import { useState, useEffect } from "react";
import { Clock, MapPin, Coffee, Utensils, Box, Car, ChevronRight, Zap, Calendar, Star, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

// 1. DỮ LIỆU CA GIAO HÀNG (Đã sửa Ca Chiều chuẩn 14:30 - 16:00)
const schedules = [
  { id: 'sang', name: 'CA SÁNG', cutoff: '06:30', delivery: '07:00 - 08:00', cutoffHour: 6, cutoffMin: 30 },
  { id: 'trua', name: 'CA TRƯA', cutoff: '10:00', delivery: '10:30 - 12:00', cutoffHour: 10, cutoffMin: 0 },
  { id: 'chieu', name: 'CA CHIỀU', cutoff: '14:00', delivery: '14:30 - 16:00', cutoffHour: 14, cutoffMin: 0 },
  { id: 'toi', name: 'CA TỐI', cutoff: '17:30', delivery: '18:00 - 19:30', cutoffHour: 17, cutoffMin: 30 },
];

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // State đếm ngược
  const [timeLeft, setTimeLeft] = useState<{ active: typeof schedules[0], totalMinutes: number, seconds: number } | null>(null);

  useEffect(() => {
    // 2. CHỐNG HYDRATION MISMATCH
    setIsMounted(true);

    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.name) setUserName(parsed.name);
      if (parsed.phone) setUserPhone(parsed.phone);
    }

    // 3. LOGIC ĐẾM NGƯỢC CHUẨN GIỜ VIỆT NAM (Tính TỔNG số phút)
    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date(now);
      let activeSchedule = schedules[0];
      let found = false;

      // Quét tìm ca chốt đơn tiếp theo trong ngày
      for (let i = 0; i < schedules.length; i++) {
        const cutoffDate = new Date(now);
        cutoffDate.setHours(schedules[i].cutoffHour, schedules[i].cutoffMin, 0, 0);
        
        if (now.getTime() < cutoffDate.getTime()) {
          activeSchedule = schedules[i];
          target = cutoffDate;
          found = true;
          break;
        }
      }

      // Nếu đã qua 17:30, tự động nhảy sang Ca Sáng ngày mai
      if (!found) {
        activeSchedule = schedules[0];
        target.setDate(target.getDate() + 1);
        target.setHours(schedules[0].cutoffHour, schedules[0].cutoffMin, 0, 0);
      }

      const diffMs = target.getTime() - now.getTime();
      
      if (diffMs > 0) {
        setTimeLeft({
          active: activeSchedule,
          // TUYỆT ĐỐI KHÔNG DÙNG % 60 Ở ĐÂY. Lấy nguyên tổng số phút.
          totalMinutes: Math.floor(diffMs / (1000 * 60)), 
          seconds: Math.floor((diffMs / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tránh render HTML lúc Server chưa đồng bộ với Client
  if (!isMounted) return <div className="min-h-screen bg-[#fcfaf1]"></div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] font-sans pb-24 max-w-md mx-auto shadow-2xl relative" style={{ fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      
      {/* HEADER */}
      <header className="bg-white p-4 sticky top-0 z-30 shadow-sm rounded-b-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-orange-600 tracking-tight">GIAO NÓNG</h1>
          <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
            Cà Mau <ChevronRight size={10}/> Đầm Dơi, Chà Là
          </p>
        </div>
        <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100 shadow-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Đang nhận đơn</span>
        </div>
      </header>

      <div className="p-4 space-y-5">
        
        {/* THẺ THÀNH VIÊN HOẶC ĐĂNG KÝ */}
        {!userName ? (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-100 text-center space-y-3">
             <Gift className="text-orange-500 mx-auto" size={32} />
             <div>
                <h2 className="font-black text-gray-900 text-lg uppercase tracking-tight">Chưa có thẻ thành viên?</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Đăng ký 1 lần duy nhất để không phải nhập lại địa chỉ & tích điểm giảm tới 15%</p>
             </div>
             <button className="w-full bg-orange-600 text-white font-semibold py-3 rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95">ĐĂNG KÝ NGAY</button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10"><Zap size={120} /></div>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2"><div className="bg-white/20 p-2 rounded-xl"><Zap size={20}/></div><span className="font-black text-lg">Đồng</span></div>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black">Giảm 0%</span>
             </div>
             <div className="flex justify-between items-end">
                <div><h2 className="text-xl font-black uppercase">{userName}</h2><p className="text-xs font-medium opacity-90">{userPhone}</p></div>
                <div className="text-right"><p className="text-[9px] font-black opacity-80 uppercase">ĐIỂM TÍCH LŨY</p><p className="text-3xl font-black leading-none">0</p></div>
             </div>
          </div>
        )}

        {/* ĐỒNG HỒ ĐẾM NGƯỢC (HIỂN THỊ TỔNG PHÚT) */}
        {timeLeft && (
          <div className="bg-[#bd4a1c] rounded-[2rem] p-6 text-white text-center shadow-md relative border border-[#a44216]">
            <p className="text-xs font-black mb-4 uppercase tracking-wider text-orange-100">
              Hôm nay, ĐANG CHỐT ĐƠN {timeLeft.active.name}
            </p>
            <div className="flex justify-center items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                {/* HIỂN THỊ TỔNG SỐ PHÚT (VD: 85 phút) */}
                <span className="text-4xl font-black">{String(timeLeft.totalMinutes).padStart(2, '0')}</span>
              </div>
              <span className="text-4xl font-black pb-2 opacity-80 animate-pulse">:</span>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                {/* HIỂN THỊ GIÂY */}
                <span className="text-4xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="bg-black/20 inline-block px-4 py-2 rounded-full mt-5 shadow-sm">
              <p className="text-[10px] font-bold text-orange-100 uppercase">
                Giao: {timeLeft.active.delivery} • Chốt: {timeLeft.active.cutoff}
              </p>
            </div>
          </div>
        )}

        {/* MÃ NGƯỜI QUEN */}
        <div className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
           <div>
              <p className="font-bold text-gray-800 text-sm">Nhập mã người quen</p>
              <p className="text-[10px] text-gray-500 font-medium">Nhận ưu đãi 20K phí ship!</p>
           </div>
           <button className="text-xs font-semibold text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 transition-all hover:bg-orange-100 active:scale-95">Nhập mã</button>
        </div>

        {/* MENU DỊCH VỤ */}
        <div className="grid grid-cols-2 gap-3">
           <button onClick={() => router.push('/quan')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all">
              <div className="bg-blue-50 p-4 rounded-full text-blue-500"><Box size={28}/></div>
              <span className="font-bold text-gray-800 text-sm uppercase">GIAO HÀNG</span>
           </button>
           <button className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all opacity-60">
              <div className="bg-blue-50 p-4 rounded-full text-blue-500"><Car size={28}/></div>
              <span className="font-bold text-gray-800 text-sm uppercase">ĐẶT XE</span>
           </button>
           <button onClick={() => router.push('/quan')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all mt-2">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500"><Utensils size={28}/></div>
              <span className="font-bold text-gray-800 text-sm uppercase">ĐỒ ĂN</span>
           </button>
           <button className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all opacity-60 mt-2">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500"><Coffee size={28}/></div>
              <span className="font-bold text-gray-800 text-sm uppercase">THỨC UỐNG</span>
           </button>
        </div>

        {/* LỊCH GIAO CẢ NGÀY */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mt-6">
           <h2 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
             <Calendar className="text-gray-800" size={20}/> Lịch Giao Cả Ngày
           </h2>
           <div className="space-y-3">
              {schedules.map((s) => (
                <div key={s.id} className={`flex justify-between items-center p-4 rounded-xl border ${timeLeft?.active.id === s.id ? 'border-orange-200 bg-orange-50' : 'border-gray-50 bg-white'}`}>
                  <div>
                     <p className={`font-bold text-sm ${timeLeft?.active.id === s.id ? 'text-orange-600' : 'text-gray-800'}`}>{s.name}</p>
                     <p className="text-[10px] text-gray-500 font-medium mt-1">Chốt đơn trước: <span className="font-bold text-gray-800">{s.cutoff}</span></p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Giao Hàng</p>
                     <p className="font-bold text-gray-900 text-sm">{s.delivery}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}