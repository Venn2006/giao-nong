"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, 
  Coffee, 
  Utensils, 
  Box, 
  Car, 
  ChevronRight, 
  User, 
  Phone, 
  Zap, 
  X, 
  Save, 
  Flame, 
  MessageCircle, 
  MessageSquare, 
  Star, 
  Clock, 
  ShoppingBag, 
  Bell 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  const [userName, setUserName] = useState("Khách Mới");
  const [userPhone, setUserPhone] = useState("Chưa cập nhật SĐT");
  
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

  const [timeLeft, setTimeLeft] = useState<{ active: any, totalMinutes: number, seconds: number }>({
    active: schedules[0], 
    totalMinutes: 0, 
    seconds: 0
  });

  useEffect(() => {
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
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-32 max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER CÓ CHUÔNG THÔNG BÁO */}
      <header className="bg-white p-4 sticky top-0 z-20 shadow-sm rounded-b-2xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-orange-600 tracking-tight">GIAO NÓNG</h1>
          <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
            Cà Mau <ChevronRight size={10}/> Bờ Đập <ChevronRight size={10}/> Chà Là
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-50 px-2 py-1.5 rounded-xl items-center gap-1.5 border border-green-100 hidden sm:flex">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-black text-green-700 uppercase">Đang nhận đơn</span>
          </div>
          
          {/* NÚT CHUÔNG LỊCH SỬ ĐƠN HÀNG */}
          <button 
            onClick={() => router.push('/don-hang')} 
            className="relative bg-gray-100 p-2.5 rounded-full active:scale-95 transition-transform border border-gray-200"
          >
             <Bell size={20} className="text-gray-700" />
             {/* Chấm đỏ Noti nhấp nháy */}
             <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        
        {/* MEMBERSHIP CARD */}
        <div onClick={() => setShowProfile(true)} className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
           <div className="absolute -right-4 -bottom-4 opacity-10">
             <Zap size={120} />
           </div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-2">
                 <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                   <User size={20} className="text-white"/>
                 </div>
                 <span className="font-black text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded">
                   Bấm cập nhật hồ sơ
                 </span>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black backdrop-blur-sm">Giảm 0%</span>
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

        {/* ĐỒNG HỒ ĐẾM NGƯỢC ĐƠN HIỆN TẠI */}
        <div className="bg-[#bd4a1c] rounded-[2rem] p-6 text-white text-center shadow-xl relative border border-[#a44216]">
          <p className="text-xs font-black mb-4 uppercase tracking-wider text-orange-100">
            Hôm nay, ĐANG CHỐT ĐƠN {timeLeft.active.name}
          </p>
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
            <p className="text-[10px] font-bold text-orange-100 uppercase">
              Giao: {timeLeft.active.delivery} • Chốt: {timeLeft.active.cutoff}
            </p>
          </div>
        </div>

        {/* CỤM 5 NÚT DỊCH VỤ HIỆN ĐẠI */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
             <button onClick={() => router.push('/do-an')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-200 active:scale-95 transition-all">
                <div className="bg-orange-50 p-4 rounded-full text-orange-600 shadow-inner">
                  <Utensils size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">ĐỒ ĂN</span>
             </button>
             
             <button onClick={() => router.push('/thuc-uong')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-200 active:scale-95 transition-all">
                <div className="bg-orange-50 p-4 rounded-full text-orange-600 shadow-inner">
                  <Coffee size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">THỨC UỐNG</span>
             </button>
             
             <button onClick={() => router.push('/giao-hang')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-200 active:scale-95 transition-all">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600 shadow-inner">
                  <Box size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">GỬI HÀNG</span>
             </button>
             
             <button onClick={() => router.push('/dat-xe')} className="bg-white p-5 rounded-2xl flex flex-col items-center gap-3 shadow-sm border border-gray-200 active:scale-95 transition-all">
                <div className="bg-green-50 p-4 rounded-full text-green-600 shadow-inner">
                  <Car size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">ĐẶT XE</span>
             </button>
          </div>

          {/* NÚT MUA HỘ ĐA NĂNG */}
          <button 
            onClick={() => router.push('/mua-ho')} 
            className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-200 active:scale-95 transition-all mb-2"
          >
             <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600 shadow-inner">
                  <ShoppingBag size={24}/>
                </div>
                <div className="text-left">
                  <span className="font-black text-gray-900 text-sm block uppercase">Mua Hộ Đa Năng</span>
                  <span className="text-[10px] text-gray-500 font-bold">Thuốc tây, đồ chợ, mỹ phẩm...</span>
                </div>
             </div>
             <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* BẢNG TỔNG HỢP 4 KHUNG GIỜ */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-200">
          <h2 className="font-black text-gray-900 text-base mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Clock className="text-orange-500" size={20} /> Lịch Giao Nóng Hôm Nay
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {schedules.map((s, idx) => {
               const isActive = timeLeft?.active.id === s.id;
               return (
                 <div key={s.id} className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${isActive ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner ${isActive ? 'bg-orange-600 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className={`font-black uppercase text-sm ${isActive ? 'text-orange-700' : 'text-gray-700'}`}>{s.name}</h3>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase">Giao: {s.delivery}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chốt đơn</p>
                      <p className={`text-lg font-black ${isActive ? 'text-orange-600' : 'text-gray-900'}`}>{s.cutoff}</p>
                    </div>
                 </div>
               )
            })}
          </div>
        </div>

        {/* GỢI Ý NÓNG SỐT */}
        <div>
           <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
             Gợi Ý Nóng Sốt <Flame className="text-red-500 fill-red-500" size={20} />
           </h2>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              
              <div onClick={() => router.push('/do-an')} className="min-w-[220px] bg-white rounded-2xl p-3 shadow-sm border border-gray-200 flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
                 <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg" alt="Bún Riêu" className="w-full h-32 object-cover rounded-xl mb-3"/>
                 <div className="flex gap-1.5 mb-2">
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-orange-600"/> 4.8
                    </span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Nổi bật</span>
                 </div>
                 <h3 className="font-black text-sm text-gray-900 leading-tight mb-1">Bún Riêu Cua Biển Chà Là</h3>
                 <div className="flex justify-between items-center mt-3">
                    <span className="text-orange-600 font-black text-base">45.000đ</span>
                    <button className="bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg">Đặt Ngay</button>
                 </div>
              </div>

              <div onClick={() => router.push('/do-an')} className="min-w-[220px] bg-white rounded-2xl p-3 shadow-sm border border-gray-200 flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
                 <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/com-tam.webp" alt="Cơm Tấm" className="w-full h-32 object-cover rounded-xl mb-3"/>
                 <div className="flex gap-1.5 mb-2">
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-orange-600"/> 4.9
                    </span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Cơm Đêm</span>
                 </div>
                 <h3 className="font-black text-sm text-gray-900 leading-tight mb-1">Cơm Tấm Sườn Bì Ốp La</h3>
                 <div className="flex justify-between items-center mt-3">
                    <span className="text-orange-600 font-black text-base">40.000đ</span>
                    <button className="bg-orange-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg">Đặt Ngay</button>
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* POPUP HỒ SƠ */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md sm:rounded-[2rem] rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <User className="text-orange-600"/> Hồ sơ của bạn
              </h2>
              <button onClick={() => setShowProfile(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200">
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  placeholder="Tên của bạn..." 
                  style={{ color: '#111827', backgroundColor: '#f9fafb' }} 
                  className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-orange-600 font-bold placeholder:text-gray-400" 
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  value={tempPhone} 
                  onChange={(e) => setTempPhone(e.target.value)} 
                  placeholder="Số điện thoại..." 
                  style={{ color: '#111827', backgroundColor: '#f9fafb' }} 
                  className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-orange-600 font-bold placeholder:text-gray-400" 
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={tempAddress} 
                  onChange={(e) => setTempAddress(e.target.value)} 
                  placeholder="Địa chỉ mặc định..." 
                  style={{ color: '#111827', backgroundColor: '#f9fafb' }} 
                  className="w-full p-3 pl-10 border border-gray-200 rounded-xl outline-orange-600 font-bold placeholder:text-gray-400" 
                />
              </div>
            </div>
            
            <button onClick={handleSaveProfile} className="w-full bg-orange-600 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
              <Save size={20} /> LƯU THÔNG TIN
            </button>
          </div>
        </div>
      )}

      {/* THANH LIÊN HỆ DƯỚI CÙNG */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 max-w-md mx-auto z-40 rounded-t-3xl flex justify-around items-center pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <a href="tel:0911089103" className="flex flex-col items-center gap-1 w-1/3">
          <div className="bg-green-100 p-3 rounded-full border border-green-200 shadow-inner">
            <Phone size={22} className="text-green-600 fill-green-600"/>
          </div>
          <span className="text-[10px] font-black text-gray-600 uppercase mt-1">Gọi Trực Tiếp</span>
        </a>
        
        <a href="https://zalo.me/0911089103" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 w-1/3">
          <div className="bg-blue-100 p-3 rounded-full border border-blue-200 shadow-inner">
            <MessageSquare size={22} className="text-blue-600 fill-blue-600"/>
          </div>
          <span className="text-[10px] font-black text-gray-600 uppercase mt-1">Chat Zalo</span>
        </a>
        
        <a href="https://m.me/GiaoNongCaMau" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 w-1/3">
          <div className="bg-blue-50 p-3 rounded-full border border-blue-200 shadow-inner">
            <MessageCircle size={22} className="text-blue-600 fill-blue-600"/>
          </div>
          <span className="text-[10px] font-black text-gray-600 uppercase mt-1">Messenger</span>
        </a>
      </div>

    </div>
  );
}