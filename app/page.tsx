"use client";
import { useState, useEffect } from "react";
import { Clock, MapPin, Coffee, Utensils, Box, Car, ChevronRight, User, Phone, ShieldCheck, Ticket, Star, Calendar, Zap, X, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Khách Mới");
  const [userPhone, setUserPhone] = useState("Chưa cập nhật SĐT");
  
  // STATE CHO POPUP ĐĂNG KÝ / CẬP NHẬT TÀI KHOẢN
  const [showProfile, setShowProfile] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempAddress, setTempAddress] = useState("");

  const schedules = [
    { id: 'sang', name: 'CA SÁNG', cutoff: '06:30', delivery: '07:00 - 08:00', cutoffHour: 6, cutoffMin: 30 },
    { id: 'trua', name: 'CA TRƯA', cutoff: '10:00', delivery: '10:30 - 12:00', cutoffHour: 10, cutoffMin: 0 },
    { id: 'chieu', name: 'CA CHIỀU', cutoff: '14:00', delivery: '14:30 - 16:00', cutoffHour: 14, cutoffMin: 0 },
    { id: 'toi', name: 'CA TỐI', cutoff: '17:30', delivery: '18:00 - 19:30', cutoffHour: 17, cutoffMin: 30 },
  ];

  const [timeLeft, setTimeLeft] = useState<{ active: any, totalMinutes: number, seconds: number } | null>(null);

  useEffect(() => {
    // Load thông tin khách hàng nếu đã lưu
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.name) setUserName(parsed.name);
      if (parsed.phone) setUserPhone(parsed.phone);
      
      setTempName(parsed.name || "");
      setTempPhone(parsed.phone || "");
      setTempAddress(parsed.address || "");
    }

    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date();
      let activeSchedule = schedules[0];
      let found = false;

      for (let i = 0; i < schedules.length; i++) {
        const cutoffDate = new Date();
        cutoffDate.setHours(schedules[i].cutoffHour, schedules[i].cutoffMin, 0, 0);
        if (now < cutoffDate) {
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

      const difference = target.getTime() - now.getTime();
      setTimeLeft({
        active: activeSchedule,
        totalMinutes: Math.floor(difference / 1000 / 60), 
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // HÀM LƯU TÀI KHOẢN
  const handleSaveProfile = () => {
    if (!tempName || !tempPhone) {
      alert("Cô/Chú vui lòng điền ít nhất Tên và Số điện thoại nhé!");
      return;
    }
    const userData = { name: tempName, phone: tempPhone, address: tempAddress };
    localStorage.setItem("giao_nong_user", JSON.stringify(userData));
    setUserName(tempName);
    setUserPhone(tempPhone);
    setShowProfile(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24 max-w-md mx-auto shadow-2xl relative">
      
      <header className="bg-white p-4 sticky top-0 z-20 shadow-sm rounded-b-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-orange-600 tracking-tight">GIAO NÓNG</h1>
          <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
            Cà Mau <ChevronRight size={10}/> Bờ Đập <ChevronRight size={10}/> Chà Là
          </p>
        </div>
        <div className="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-100">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Đang nhận đơn</span>
        </div>
      </header>

      <div className="p-4 space-y-5">
        
        {/* MEMBERSHIP CARD - BẤM VÀO ĐỂ MỞ POPUP ĐĂNG KÝ */}
        <div 
          onClick={() => setShowProfile(true)}
          className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
        >
           <div className="absolute -right-4 -bottom-4 opacity-10"><Zap size={120} /></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-2">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><User size={20} className="text-white"/></div>
                 <span className="font-black text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Bấm cập nhật hồ sơ</span>
              </div>
           </div>
           
           <div className="flex justify-between items-end relative z-10">
              <div>
                <h2 className="text-xl font-black uppercase">{userName}</h2>
                <p className="text-xs font-medium opacity-90 mt-0.5">{userPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black opacity-80 uppercase tracking-wider mb-0.5">ĐIỂM TÍCH LŨY</p>
                <p className="text-3xl font-black leading-none">0</p>
              </div>
           </div>
        </div>

        {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
        {timeLeft && (
          <div className="bg-[#bd4a1c] rounded-[2rem] p-6 text-white text-center shadow-xl relative border border-[#a44216]">
            <p className="text-xs font-black mb-4 uppercase tracking-wider text-orange-100">Hôm nay, ĐANG CHỐT ĐƠN {timeLeft.active.name}</p>
            <div className="flex justify-center items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-24 h-24 flex items-center justify-center shadow-inner">
                <span className="text-5xl font-black">{String(timeLeft.totalMinutes).padStart(2, '0')}</span>
              </div>
              <span className="text-4xl font-black pb-2 opacity-80 animate-pulse">:</span>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl w-24 h-24 flex items-center justify-center shadow-inner">
                <span className="text-5xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="bg-black/20 inline-block px-4 py-2 rounded-full mt-5">
              <p className="text-[10px] font-bold text-orange-100 uppercase">Giao: {timeLeft.active.delivery} • Chốt: {timeLeft.active.cutoff}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
           <button onClick={() => router.push('/quan')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500"><Utensils size={28}/></div>
              <span className="font-black text-gray-800 text-sm">ĐỒ ĂN</span>
           </button>
           <button className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 opacity-60">
              <div className="bg-orange-50 p-4 rounded-full text-orange-500"><Coffee size={28}/></div>
              <span className="font-black text-gray-800 text-sm">THỨC UỐNG</span>
           </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* POPUP (MODAL) CẬP NHẬT TÀI KHOẢN                     */}
      {/* ==================================================== */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><User className="text-orange-500"/> Hồ sơ của bạn</h2>
              <button onClick={() => setShowProfile(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Tên của bạn..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium text-gray-800" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} placeholder="Số điện thoại..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium text-gray-800" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} placeholder="Địa chỉ mặc định..." className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-orange-500 font-medium text-gray-800" />
              </div>
              <p className="text-[10px] text-gray-400 italic text-center">*Thông tin sẽ được tự động điền khi bạn thanh toán đơn hàng.</p>
            </div>

            <button onClick={handleSaveProfile} className="w-full bg-orange-600 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <Save size={20} /> LƯU THÔNG TIN
            </button>
          </div>
        </div>
      )}

    </div>
  );
}