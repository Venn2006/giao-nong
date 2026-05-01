"use client";
import { useState, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  Flame, 
  Clock, 
  Star, 
  ChevronRight, 
  Utensils, 
  Coffee, 
  Box, 
  Car, 
  Home, 
  FileText, 
  Bell, 
  User,
  ShieldCheck,
  TrendingUp,
  Gift,
  Phone,
  Save,
  X,
  MessageCircle,
  Shield,
  Award,
  Crown,
  Truck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const router = useRouter();
  
  const [userName, setUserName] = useState("Khách Mới");
  const [userPhone, setUserPhone] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  
  // ĐÃ FIX LỖI COLOR VÀ ICON CHO THẺ VIP CHỐNG CRASH
  const [vipInfo, setVipInfo] = useState<any>({ rank: 'Đồng', discount: 0, points: 0, color: 'from-orange-400 to-orange-600', icon: Shield });

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

  const [timeLeft, setTimeLeft] = useState<{ active: any, hours: number, minutes: number, seconds: number }>({
    active: schedules[0], hours: 0, minutes: 0, seconds: 0
  });

  // TÍNH RANK VIP CHUẨN XÁC KÈM ĐỔI MÀU, ĐỔI ICON
  const calculateRank = (spent: number) => {
    const points = Math.floor(spent / 100000); 
    if (spent >= 500000000) return { rank: 'Thách Đấu', discount: 20, points, color: 'from-red-600 to-orange-500', icon: Crown };
    if (spent >= 200000000) return { rank: 'Đại Cao Thủ', discount: 18, points, color: 'from-rose-500 to-pink-700', icon: Crown };
    if (spent >= 120000000) return { rank: 'Cao Thủ', discount: 15, points, color: 'from-purple-500 to-indigo-600', icon: Award };
    if (spent >= 80000000) return { rank: 'Kim Cương', discount: 12, points, color: 'from-blue-400 to-cyan-500', icon: Award };
    if (spent >= 50000000) return { rank: 'Lục Bảo', discount: 9, points, color: 'from-emerald-400 to-green-600', icon: Shield };
    if (spent >= 30000000) return { rank: 'Bạch Kim', discount: 7, points, color: 'from-slate-300 to-slate-500', icon: Shield };
    if (spent >= 15000000) return { rank: 'Vàng', discount: 5, points, color: 'from-yellow-400 to-amber-500', icon: Shield };
    if (spent >= 5000000) return { rank: 'Bạc', discount: 2, points, color: 'from-gray-300 to-gray-400', icon: Shield };
    return { rank: 'Đồng', discount: 0, points, color: 'from-orange-500 to-orange-700', icon: Shield };
  };

  const fetchUserData = async () => {
    const savedUser = localStorage.getItem("giao_nong_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.name) setUserName(parsed.name);
      if (parsed.phone) setUserPhone(parsed.phone);
      setTempName(parsed.name || "");
      setTempPhone(parsed.phone || "");
      setTempAddress(parsed.address || "");

      if (parsed.phone) {
        const safePhone = parsed.phone.trim();
        const { data } = await supabase.from('orders').select('total_amount').eq('customer_phone', safePhone).eq('status', 'completed');
        if (data) {
          const total = data.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
          setTotalSpent(total);
          const vipData = calculateRank(total);
          setVipInfo(vipData);
          localStorage.setItem('giao_nong_vip', JSON.stringify({ discount: vipData.discount, rank: vipData.rank }));
        }
      }
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;900&display=swap');
      .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; }
      .glow-text { text-shadow: 0 0 15px rgba(234, 88, 12, 0.8), 0 0 30px rgba(234, 88, 12, 0.4); }
      .flame-bg { background: radial-gradient(circle at top, #431407 0%, #09090b 60%); }
      .glass-card { background: rgba(39, 39, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
    `;
    document.head.appendChild(style);

    fetchUserData();

    const savedUser = localStorage.getItem("giao_nong_user");
    let phoneToListen = "";
    if (savedUser) phoneToListen = JSON.parse(savedUser).phone?.trim();
    const sub = supabase.channel('home_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (phoneToListen) fetchUserData();
      }).subscribe();

    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date();
      let activeSchedule = schedules[0];
      let found = false;

      for (let i = 0; i < schedules.length; i++) {
        const cd = new Date();
        cd.setHours(schedules[i].cutoffHour, schedules[i].cutoffMin, 0, 0);
        if (now < cd) {
          activeSchedule = schedules[i]; target = cd; found = true; break;
        }
      }

      if (!found) {
        activeSchedule = schedules[0]; target.setDate(target.getDate() + 1); target.setHours(schedules[0].cutoffHour, schedules[0].cutoffMin, 0, 0);
      }

      const diff = target.getTime() - now.getTime();
      setTimeLeft({
        active: activeSchedule,
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => { clearInterval(timer); supabase.removeChannel(sub); document.head.removeChild(style); };
  }, []);

  const handleSaveProfile = () => {
    if (!tempName || !tempPhone) return alert("Điền Tên và SĐT nhé!");
    const userData = { name: tempName, phone: tempPhone.trim(), address: tempAddress };
    localStorage.setItem("giao_nong_user", JSON.stringify(userData));
    setUserName(tempName);
    setUserPhone(tempPhone.trim());
    setShowProfile(false);
    fetchUserData();
  };

  const reviews = [
    { name: "Anh Khang", rating: 5, text: "Giao Đầm Dơi 35km mà cơm vẫn nóng hổi, shipper nhiệt tình!" },
    { name: "Chị Thảo", rating: 5, text: "Gom đơn công ty mỗi ngày phí ship rẻ bèo. Quá đỉnh." },
    { name: "Tuấn Anh", rating: 4, text: "Trà sữa đá không bị tan, sẽ ủng hộ Giao Nóng dài dài." }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-32 max-w-md mx-auto shadow-2xl relative overflow-x-hidden flame-bg">
      
      <header className="px-5 pt-6 pb-2 flex justify-between items-center relative z-10">
        <div onClick={() => setShowProfile(true)} className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <User size={20} className="text-orange-500"/>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
              {userName} <ChevronRight size={12}/>
            </p>
            <p className="text-sm font-black text-white truncate max-w-[150px] flex items-center gap-1">
              <MapPin size={14} className="text-orange-500"/> Cà Mau - Đầm Dơi
            </p>
          </div>
        </div>
        <div className="bg-zinc-800/80 px-3 py-1.5 rounded-full flex items-center gap-2 border border-zinc-700">
          <Flame size={14} className="text-orange-500 fill-orange-500"/>
          <span className="text-xs font-bold text-orange-400">{vipInfo.points.toLocaleString('vi-VN')} Điểm</span>
        </div>
      </header>

      <div className="px-5 py-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
           <div className="bg-orange-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50 relative border-2 border-orange-400">
             <Flame size={24} className="text-yellow-300 fill-yellow-300 absolute -top-2 -right-2 drop-shadow-md animate-pulse"/>
             <Truck size={22} className="text-white"/>
           </div>
           <h1 className="font-display text-5xl text-white glow-text tracking-wider mt-2">
             GIAO <span className="text-orange-500">NÓNG</span>
           </h1>
        </div>
        <p className="text-zinc-400 text-sm font-medium mb-6">Đồ ăn Cà Mau - Bất chấp khoảng cách</p>

        <div className="glass-card rounded-[2rem] p-5 border-t border-orange-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-yellow-400"></div>
          <p className="text-xs text-orange-400 font-black uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            CHỐT ĐƠN {timeLeft.active.name} TRONG
          </p>
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="bg-zinc-950/80 rounded-2xl w-16 h-20 flex flex-col items-center justify-center border border-zinc-800 shadow-inner">
              <span className="font-display text-4xl text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Giờ</span>
            </div>
            <span className="text-3xl font-black text-zinc-600 animate-pulse pb-4">:</span>
            <div className="bg-zinc-950/80 rounded-2xl w-16 h-20 flex flex-col items-center justify-center border border-zinc-800 shadow-inner">
              <span className="font-display text-4xl text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Phút</span>
            </div>
            <span className="text-3xl font-black text-zinc-600 animate-pulse pb-4">:</span>
            <div className="bg-zinc-950/80 rounded-2xl w-16 h-20 flex flex-col items-center justify-center border border-zinc-800 shadow-inner">
              <span className="font-display text-4xl text-orange-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Giây</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 font-medium">Dự kiến giao: <strong className="text-white">{timeLeft.active.delivery}</strong></p>
        </div>
      </div>

      <div className="px-5 mb-6">
        {totalSpent === 0 ? (
          <div onClick={() => setShowProfile(true)} className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(234,88,12,0.3)] cursor-pointer active:scale-95 transition-transform">
            <div>
              <p className="text-[10px] font-black uppercase text-orange-950 mb-1">🎁 Quà tặng người mới</p>
              <h3 className="text-sm font-black text-white leading-tight">Cập nhật SĐT nhận ngay<br/>1 điểm tích lũy!</h3>
            </div>
            <div className="bg-white text-orange-600 p-2 rounded-full"><Gift size={20}/></div>
          </div>
        ) : (
          <div onClick={() => setShowProfile(true)} className={`bg-gradient-to-r ${vipInfo.color} border border-white/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <vipInfo.icon size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-white/80 mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Hạng {vipInfo.rank}</p>
              <h3 className="text-sm font-bold text-white leading-tight">Bạn đang được giảm <strong className="text-yellow-300 font-black">{vipInfo.discount}%</strong><br/>càng mua phí ship càng rẻ!</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full relative z-10"><TrendingUp size={20}/></div>
          </div>
        )}
      </div>

      <div className="px-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Bạn đang thèm gì? (Bún riêu, Trà sữa...)" 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      <div className="px-5 mb-8">
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => router.push('/do-an')} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-[1.2rem] bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.15)]">
              <Utensils size={28} className="text-orange-500" />
            </div>
            <span className="text-[11px] font-bold text-zinc-300">Đồ Ăn</span>
          </button>
          <button onClick={() => router.push('/thuc-uong')} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-[1.2rem] bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
              <Coffee size={28} className="text-yellow-500" />
            </div>
            <span className="text-[11px] font-bold text-zinc-300">Nước</span>
          </button>
          <button onClick={() => router.push('/giao-hang')} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-[1.2rem] bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Box size={28} className="text-blue-500" />
            </div>
            <span className="text-[11px] font-bold text-zinc-300">Giao Hàng</span>
          </button>
          <button onClick={() => router.push('/dat-xe')} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-[1.2rem] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Car size={28} className="text-emerald-500" />
            </div>
            <span className="text-[11px] font-bold text-zinc-300">Đặt Xe</span>
          </button>
        </div>
      </div>

      <div className="px-5 mb-8">
        <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-inner">
          <div className="text-center px-2 border-r border-zinc-800">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Đơn H.nay</p>
            <p className="text-sm font-black text-white flex items-center gap-1"><Flame size={12} className="text-orange-500"/> 1,240+</p>
          </div>
          <div className="text-center px-2 border-r border-zinc-800">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Đánh giá</p>
            <p className="text-sm font-black text-white flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500"/> 4.9/5</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-0.5">Đúng giờ</p>
            <p className="text-sm font-black text-white flex items-center gap-1"><Clock size={12} className="text-green-500"/> 98%</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-8">
        <h2 className="font-display text-2xl text-white mb-4 tracking-wide">CHỌN CA GIAO NGAY</h2>
        <div className="grid grid-cols-2 gap-3">
          {schedules.map(s => {
            const isActive = timeLeft.active.id === s.id;
            return (
              <div key={s.id} className={`p-4 rounded-2xl border transition-all ${isActive ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.15)]' : 'bg-zinc-900 border-zinc-800 opacity-70'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-black text-sm uppercase ${isActive ? 'text-orange-500' : 'text-zinc-400'}`}>{s.name}</span>
                  {isActive && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span></span>}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Chốt trước: <strong className={isActive ? 'text-white' : ''}>{s.cutoff}</strong></p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Giao: <strong className={isActive ? 'text-white' : ''}>{s.delivery}</strong></p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="pl-5 mb-10">
        <h2 className="font-display text-2xl text-white mb-4 tracking-wide flex items-center gap-2">KHÁCH NÓI GÌ <MessageCircle size={20} className="text-orange-500"/></h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide pr-5">
          {reviews.map((r, i) => (
            <div key={i} className="min-w-[240px] bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-orange-500">{r.name.charAt(0)}</div>
                <div>
                  <p className="text-xs font-black text-white">{r.name}</p>
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"}/>)}</div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed italic">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 h-16 rounded-t-3xl flex justify-around items-center px-4 z-50">
        <button className="flex flex-col items-center gap-1 active:scale-95 text-orange-500">
          <Home size={22} className="fill-orange-500/20"/>
          <span className="text-[9px] font-bold">Trang Chủ</span>
        </button>
        <button onClick={() => router.push('/don-hang')} className="flex flex-col items-center gap-1 active:scale-95 text-zinc-500 hover:text-zinc-300">
          <FileText size={22} />
          <span className="text-[9px] font-bold">Đơn Hàng</span>
        </button>
        
        <button onClick={() => router.push('/do-an')} className="relative -top-5 flex flex-col items-center active:scale-95 transition-transform">
          <div className="bg-gradient-to-tr from-orange-600 to-yellow-500 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(234,88,12,0.4)] border-4 border-[#09090b]">
            <Utensils size={24} className="text-white" />
          </div>
        </button>
        
        <button className="flex flex-col items-center gap-1 active:scale-95 text-zinc-500 hover:text-zinc-300 relative">
          <Bell size={22} />
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[9px] font-bold">Thông báo</span>
        </button>
        <button onClick={() => setShowProfile(true)} className="flex flex-col items-center gap-1 active:scale-95 text-zinc-500 hover:text-zinc-300">
          <User size={22} />
          <span className="text-[9px] font-bold">Tài Khoản</span>
        </button>
      </div>

      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border-4 border-orange-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <User className="text-orange-600"/> Cập Nhật Hồ Sơ
              </h2>
              <button onClick={() => setShowProfile(false)} className="bg-gray-100 p-2 rounded-full text-gray-900 active:scale-95">
                <X size={20}/>
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="relative">
                <User className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                  type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Tên Cô/Chú..." 
                  className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl outline-orange-500 font-black text-gray-900 bg-gray-50 placeholder-gray-400" 
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                  type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} placeholder="Số điện thoại (để tích điểm)..." 
                  className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl outline-orange-500 font-black text-gray-900 bg-gray-50 placeholder-gray-400" 
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                <input 
                  type="text" value={tempAddress} onChange={(e) => setTempAddress(e.target.value)} placeholder="Địa chỉ thường gọi..." 
                  className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl outline-orange-500 font-black text-gray-900 bg-gray-50 placeholder-gray-400" 
                />
              </div>
            </div>
            
            <button onClick={handleSaveProfile} className="w-full bg-orange-600 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_10px_20px_rgba(234,88,12,0.3)]">
              <Save size={20} /> LƯU THÔNG TIN
            </button>
          </div>
        </div>
      )}

    </div>
  );
}