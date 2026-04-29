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
  Bell,
  Award,
  Shield,
  Crown,
  Truck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const router = useRouter();
  
  const [userName, setUserName] = useState("Khách Mới");
  const [userPhone, setUserPhone] = useState("Chưa cập nhật SĐT");
  const [totalSpent, setTotalSpent] = useState(0);
  const [vipInfo, setVipInfo] = useState({ rank: 'Đồng', discount: 0, points: 0, next: 5000000, color: 'from-orange-400 to-orange-600', icon: Shield });

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

  // HÀM TÍNH RANK VIP CHUẨN LIÊN MINH CỦA SẾP
  const calculateRank = (spent: number) => {
    const points = Math.floor(spent / 100000); // 100k = 1 điểm
    
    if (spent >= 500000000) return { rank: 'Thách Đấu', discount: 20, points, next: null, color: 'from-red-600 to-orange-500', icon: Crown };
    if (spent >= 200000000) return { rank: 'Đại Cao Thủ', discount: 18, points, next: 500000000, color: 'from-rose-500 to-pink-700', icon: Crown };
    if (spent >= 120000000) return { rank: 'Cao Thủ', discount: 15, points, next: 200000000, color: 'from-purple-500 to-indigo-600', icon: Award };
    if (spent >= 80000000) return { rank: 'Kim Cương', discount: 12, points, next: 120000000, color: 'from-blue-400 to-cyan-500', icon: Award };
    if (spent >= 50000000) return { rank: 'Lục Bảo', discount: 9, points, next: 80000000, color: 'from-emerald-400 to-green-600', icon: Shield };
    if (spent >= 30000000) return { rank: 'Bạch Kim', discount: 7, points, next: 50000000, color: 'from-slate-300 to-slate-500', icon: Shield };
    if (spent >= 15000000) return { rank: 'Vàng', discount: 5, points, next: 30000000, color: 'from-yellow-400 to-amber-500', icon: Shield };
    if (spent >= 5000000) return { rank: 'Bạc', discount: 2, points, next: 15000000, color: 'from-gray-300 to-gray-400', icon: Shield };
    
    return { rank: 'Đồng', discount: 0, points, next: 5000000, color: 'from-orange-500 to-orange-700', icon: Shield };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const savedUser = localStorage.getItem("giao_nong_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.phone) setUserPhone(parsed.phone);
        setTempName(parsed.name || "");
        setTempPhone(parsed.phone || "");
        setTempAddress(parsed.address || "");

        // QUÉT TỔNG TIỀN ĐÃ MUA ĐỂ NÂNG RANK VIP
        if (parsed.phone) {
          const { data } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('customer_phone', parsed.phone)
            .eq('status', 'completed');

          if (data) {
            const total = data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            setTotalSpent(total);
            const vipData = calculateRank(total);
            setVipInfo(vipData);
            localStorage.setItem('giao_nong_vip', JSON.stringify({ discount: vipData.discount, rank: vipData.rank }));
          }
        }
      }
    };
    
    fetchUserData();

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
    window.location.reload(); // Tải lại để tính Rank tức thì
  };

  return (
    <div className="min-h-screen bg-[#fcfaf1] font-sans pb-32 max-w-md mx-auto shadow-2xl relative">
      
      {/* HEADER TÍCH HỢP LOGO GIAO NÓNG XỊN SÒ MÀU CAM */}
      <header className="bg-white p-4 sticky top-0 z-20 shadow-sm rounded-b-2xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* LOGO GIAO NÓNG CUSTOM */}
          <div className="bg-orange-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 relative">
             <Flame size={24} className="text-yellow-300 fill-yellow-300 absolute -top-1 -right-1"/>
             <Truck size={22} className="text-white"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">GIAO <span className="text-orange-600">NÓNG</span></h1>
            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
              Cà Mau <ChevronRight size={10}/> Bờ Đập <ChevronRight size={10}/> Chà Là
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* NÚT CHUÔNG LỊCH SỬ ĐƠN HÀNG */}
          <button onClick={() => router.push('/don-hang')} className="relative bg-orange-50 p-2.5 rounded-xl active:scale-95 transition-transform border border-orange-100">
             <Bell size={20} className="text-orange-600" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        
        {/* MEMBERSHIP CARD (RANK VIP) */}
        <div onClick={() => setShowProfile(true)} className={`bg-gradient-to-r ${vipInfo.color} rounded-[2rem] p-5 text-white shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-transform border border-white/20`}>
           <div className="absolute -right-4 -bottom-4 opacity-10">
             <vipInfo.icon size={120} />
           </div>
           
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm border border-white/30 shadow-inner">
                   <User size={24} className="text-white"/>
                 </div>
                 <div>
                   <span className="font-black text-[9px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm mb-1 inline-block">
                     HẠNG {vipInfo.rank}
                   </span>
                   <h2 className="text-xl font-black uppercase leading-tight truncate max-w-[150px] drop-shadow-md">{userName}</h2>
                   <p className="text-xs font-medium opacity-90 mt-0.5">{userPhone}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-bold uppercase opacity-80 mb-0.5">Đặc quyền</p>
                 <div className="bg-white text-gray-900 font-black text-sm px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                   Giảm {vipInfo.discount}%
                 </div>
              </div>
           </div>
           
           <div className="flex justify-between items-end relative z-10 border-t border-white/20 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80 mb-0.5 flex items-center gap-1"><Zap size={10}/> Điểm tích lũy (1đ = 1k)</p>
                <p className="text-3xl font-black drop-shadow-md leading-none">{vipInfo.points.toLocaleString('vi-VN')}</p>
              </div>
              {vipInfo.next && (
                <div className="text-right max-w-[45%]">
                  <p className="text-[9px] font-medium opacity-80 mb-1">Còn {(vipInfo.next - totalSpent).toLocaleString('vi-VN')}đ lên hạng</p>
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-white h-full rounded-full" style={{ width: `${(totalSpent / vipInfo.next) * 100}%` }}></div>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* ĐỒNG HỒ ĐẾM NGƯỢC CA GIAO */}
        <div className="bg-gray-900 rounded-[2rem] p-6 text-white text-center shadow-xl relative border border-gray-800">
          <p className="text-xs font-black mb-4 uppercase tracking-widest text-orange-400">
            Hôm nay, ĐANG CHỐT ĐƠN {timeLeft.active.name}
          </p>
          <div className="flex justify-center items-center gap-3">
            <div className="bg-gray-800 rounded-2xl w-20 h-24 flex items-center justify-center shadow-inner border border-gray-700">
              <span className="text-5xl font-black text-white drop-shadow-lg">{String(timeLeft.totalMinutes).padStart(2, '0')}</span>
            </div>
            <span className="text-4xl font-black pb-2 opacity-50 text-gray-500 animate-pulse">:</span>
            <div className="bg-gray-800 rounded-2xl w-20 h-24 flex items-center justify-center shadow-inner border border-gray-700">
              <span className="text-5xl font-black text-orange-500 drop-shadow-lg">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <div className="bg-gray-800 inline-block px-4 py-2 rounded-xl mt-5 border border-gray-700">
            <p className="text-[10px] font-bold text-gray-300 uppercase">
              Giao: <strong className="text-white">{timeLeft.active.delivery}</strong> • Chốt trước: <strong className="text-orange-400">{timeLeft.active.cutoff}</strong>
            </p>
          </div>
        </div>

        {/* CỤM 5 NÚT DỊCH VỤ HIỆN ĐẠI (TÔNG MÀU MỚI) */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-3">
             <button onClick={() => router.push('/do-an')} className="bg-white p-5 rounded-3xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all group">
                <div className="bg-orange-50 p-4 rounded-[1.5rem] text-orange-600 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Utensils size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">ĐỒ ĂN</span>
             </button>
             
             <button onClick={() => router.push('/thuc-uong')} className="bg-white p-5 rounded-3xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all group">
                <div className="bg-amber-50 p-4 rounded-[1.5rem] text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Coffee size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">THỨC UỐNG</span>
             </button>
             
             <button onClick={() => router.push('/giao-hang')} className="bg-white p-5 rounded-3xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all group">
                <div className="bg-blue-50 p-4 rounded-[1.5rem] text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Box size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">GỬI HÀNG</span>
             </button>
             
             <button onClick={() => router.push('/dat-xe')} className="bg-white p-5 rounded-3xl flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-all group">
                <div className="bg-green-50 p-4 rounded-[1.5rem] text-green-600 shadow-inner group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Car size={28}/>
                </div>
                <span className="font-black text-gray-900 text-sm">ĐẶT XE</span>
             </button>
          </div>

          <button 
            onClick={() => router.push('/mua-ho')} 
            className="w-full bg-gray-900 p-5 rounded-[2rem] flex items-center justify-between shadow-lg border-2 border-gray-800 active:scale-95 transition-all mb-2"
          >
             <div className="flex items-center gap-4">
                <div className="bg-gray-800 p-3 rounded-2xl text-yellow-400 shadow-inner">
                  <ShoppingBag size={24}/>
                </div>
                <div className="text-left">
                  <span className="font-black text-white text-base block uppercase tracking-wider">Mua Hộ Đa Năng</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Thuốc tây, đồ chợ, mỹ phẩm...</span>
                </div>
             </div>
             <ChevronRight size={24} className="text-gray-500" />
          </button>
        </div>

        {/* GỢI Ý NÓNG SỐT */}
        <div>
           <h2 className="font-black text-gray-900 text-lg mb-4 flex items-center gap-2">
             Gợi Ý Nóng Sốt <Flame className="text-red-500 fill-red-500" size={20} />
           </h2>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              
              <div onClick={() => router.push('/do-an')} className="min-w-[220px] bg-white rounded-[2rem] p-3 shadow-sm border border-gray-100 flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
                 <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/bun-rieu.jpg" alt="Bún Riêu" className="w-full h-32 object-cover rounded-2xl mb-3"/>
                 <div className="flex gap-1.5 mb-2">
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-orange-600"/> 4.8
                    </span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Nổi bật</span>
                 </div>
                 <h3 className="font-black text-sm text-gray-900 leading-tight mb-1">Bún Riêu Cua Biển Chà Là</h3>
                 <div className="flex justify-between items-center mt-3">
                    <span className="text-orange-600 font-black text-lg">45.000đ</span>
                    <button className="bg-gray-900 text-white font-bold text-xs px-3 py-2 rounded-xl">Đặt Ngay</button>
                 </div>
              </div>

              <div onClick={() => router.push('/do-an')} className="min-w-[220px] bg-white rounded-[2rem] p-3 shadow-sm border border-gray-100 flex-shrink-0 active:scale-95 transition-transform cursor-pointer">
                 <img src="https://uoqwsfltlbdqwwmwunzp.supabase.co/storage/v1/object/public/mon-an/com-tam.webp" alt="Cơm Tấm" className="w-full h-32 object-cover rounded-2xl mb-3"/>
                 <div className="flex gap-1.5 mb-2">
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-orange-600"/> 4.9
                    </span>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Cơm Đêm</span>
                 </div>
                 <h3 className="font-black text-sm text-gray-900 leading-tight mb-1">Cơm Tấm Sườn Bì Ốp La</h3>
                 <div className="flex justify-between items-center mt-3">
                    <span className="text-orange-600 font-black text-lg">40.000đ</span>
                    <button className="bg-gray-900 text-white font-bold text-xs px-3 py-2 rounded-xl">Đặt Ngay</button>
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* POPUP HỒ SƠ - FIX DARKMODE 100% */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
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
                  type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} placeholder="Số điện thoại..." 
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

      {/* THANH LIÊN HỆ DƯỚI CÙNG (DOCK) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-gray-100 max-w-md mx-auto z-40 rounded-t-[2.5rem] flex justify-around items-center pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <a href="tel:0911089103" className="flex flex-col items-center gap-1.5 w-1/3 active:scale-95 transition-transform">
          <div className="bg-green-50 p-3 rounded-2xl border border-green-100 text-green-600">
            <Phone size={22} className="fill-green-600"/>
          </div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Gọi Ngay</span>
        </a>
        
        <a href="https://zalo.me/0911089103" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 w-1/3 active:scale-95 transition-transform">
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-blue-600">
            <MessageSquare size={22} className="fill-blue-600"/>
          </div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Zalo Chat</span>
        </a>
        
        <a href="https://m.me/GiaoNongCaMau" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 w-1/3 active:scale-95 transition-transform">
          <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-indigo-600">
            <MessageCircle size={22} className="fill-indigo-600"/>
          </div>
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Messenger</span>
        </a>
      </div>

    </div>
  );
}