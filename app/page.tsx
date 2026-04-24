"use client";
import { useState, useEffect } from "react";
import { Clock, MapPin, Coffee, Utensils, Box, Car, ChevronRight, Zap, Calendar, Star, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

// 1. DỮ LIỆU CA GIAO HÀNG
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

  const [timeLeft, setTimeLeft] = useState<{ active: typeof schedules[0], totalMinutes: number, seconds: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.name) setUserName(parsed.name);
      if (parsed.phone) setUserPhone(parsed.phone);
    }

    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date(now);
      let activeSchedule = schedules[0];
      let found = false;

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

      if (!found) {
        activeSchedule = schedules[0];
        target.setDate(target.getDate() + 1);
        target.setHours(schedules[0].cutoffHour, schedules[0].cutoffMin, 0, 0);
      }

      const diffMs = target.getTime() - now.getTime();
      
      if (diffMs > 0) {
        setTimeLeft({
          active: activeSchedule,
          totalMinutes: Math.floor(diffMs / (1000 * 60)), 
          seconds: Math.floor((diffMs / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-[#fcfaf1]"></div>;

  return (
    <div className="min-h-screen bg-[#fcfaf1] pb-24 max-w-md mx-auto shadow-2xl relative" style={{ fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
      
      <header className="bg-white p-4 sticky top-0 z-30 shadow-sm rounded-b-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-600 tracking-tight">GIAO NÓNG</h1>
          <p className="text-[10px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
            Cà Mau <ChevronRight size={10}/> Đầm Dơi, Chà Là
          </p>
        </div>
        <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100 shadow-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Đang nhận đơn</span>
        </div>
      </header>

      <div className="p-4 space-y-5">
        
        {!userName ? (
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-100 text-center space-y-3">
             <Gift className="text-orange-500 mx-auto" size={32} />
             <div>
                <h2 className="font-bold text-gray-800 text-lg">Chưa có thẻ thành viên?</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Đăng ký 1 lần duy nhất để không phải nhập lại địa chỉ & tích điểm giảm tới 15%</p>
             </div>
             <button className="w-full bg-orange-600 text-white font-semibold py-3.5 rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95">Đăng ký ngay</button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-10"><Zap size={120} /></div>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2"><div className="bg-white/20 p-2 rounded-xl"><Zap size={20}/></div><span className="font-bold text-lg">Đồng</span></div>
                <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">Giảm 0%</span>
             </div>
             <div className="flex justify-between items-end">
                <div><h2 className="text-xl font-bold uppercase">{userName}</h2><p className="text-xs font-medium opacity-90">{userPhone}</p></div>
                <div className="text-right"><p className="text-[9px] font-bold opacity-80 uppercase">Điểm tích lũy</p><p className="text-3xl font-bold leading-none mt-1">0</p></div>
             </div>
          </div>
        )}

        {timeLeft && (
          <div className="bg-[#bd4a1c] rounded-[2rem] p-6 text-white text-center shadow-md relative border border-[#a44216]">
            <p className="text-xs font-bold mb-4 uppercase tracking-wide text-orange-100">
              Hôm nay, đang chốt đơn {timeLeft.active.name}
            </p>
            <div className="flex justify-center items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                <span className="text-4xl font-bold">{String(timeLeft.totalMinutes).padStart(2, '0')}</span>
              </div>
              <span className="text-4xl font-bold pb-2 opacity-80 animate-pulse">:</span>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-20 h-20 flex items-center justify-center shadow-inner">
                <span className="text-4xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="bg-black/20 inline-block px-4 py-2 rounded-full mt-5 shadow-sm">
              <p className="text-[10px] font-semibold text-orange-100 uppercase tracking-wide">
                Giao: {timeLeft.active.delivery} • Chốt: {timeLeft.active.cutoff}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
           <div>
              <p className="font-bold text-gray-800 text-sm">Nhập mã người quen</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Nhận ưu đãi 20K phí ship!</p>
           </div>
           <button className="text-xs font-semibold text-orange-600 bg-orange-50 px-4 py-2.5 rounded-lg border border-orange-100 transition-all hover:bg-orange-100 active:scale-95">Nhập mã</button>
        </div>

        {/* THỨ TỰ MODULE ĐÃ SẮP XẾP LẠI CHUẨN CHỈNH */}
        <div className="grid grid-cols-2 gap-4">
           {/* 1. Đồ Ăn (Nổi bật nhất) */}
           <button onClick={() => router.push('/do-an')} className="bg-white p-5 rounded-[1.5rem] flex flex-col items-center gap-3 shadow-md border-2 border-orange-100 active:scale-95 transition-all hover:border-orange-300">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500">
                <Utensils size={32} strokeWidth={2}/>
              </div>
              <span className="font-bold text-orange-600 text-sm uppercase tracking-wide">Đồ Ăn</span>
           </button>
           
           {/* 2. Thức Uống */}
           <button onClick={() => alert("Chức năng Thức Uống sắp ra mắt!")} className="bg-white p-5 rounded-[1.5rem] flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all opacity-70">
              <div className="bg-amber-50 p-4 rounded-full text-amber-500">
                <Coffee size={32} strokeWidth={2}/>
              </div>
              <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Thức Uống</span>
           </button>

           {/* 3. Giao Hàng */}
           <button onClick={() => alert("Chức năng Giao Hàng sắp ra mắt!")} className="bg-white p-5 rounded-[1.5rem] flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all opacity-70">
              <div className="bg-blue-50 p-4 rounded-full text-blue-500">
                <Box size={32} strokeWidth={2}/>
              </div>
              <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Giao Hàng</span>
           </button>

           {/* 4. Đặt Xe */}
           <button onClick={() => alert("Chức năng Đặt Xe sắp ra mắt!")} className="bg-white p-5 rounded-[1.5rem] flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all opacity-70">
              <div className="bg-green-50 p-4 rounded-full text-green-500">
                <Car size={32} strokeWidth={2}/>
              </div>
              <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">Đặt Xe</span>
           </button>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 mt-6">
           <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
             <Calendar className="text-gray-600" size={20}/> Lịch Giao Cả Ngày
           </h2>
           <div className="space-y-3">
              {schedules.map((s) => (
                <div key={s.id} className={`flex justify-between items-center p-4 rounded-xl border ${timeLeft?.active.id === s.id ? 'border-orange-200 bg-orange-50/50' : 'border-gray-50 bg-white'}`}>
                  <div>
                     <p className={`font-bold text-sm ${timeLeft?.active.id === s.id ? 'text-orange-600' : 'text-gray-800'}`}>{s.name}</p>
                     <p className="text-[10px] text-gray-500 font-medium mt-1">Chốt đơn trước: <span className="font-semibold text-gray-700">{s.cutoff}</span></p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Giao Hàng</p>
                     <p className="font-bold text-gray-800 text-sm">{s.delivery}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}