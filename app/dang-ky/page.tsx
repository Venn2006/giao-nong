"use client";
import { useState } from "react";
import { User, Phone, MapPin, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Văn ơi, nhắc khách điền đủ 3 món này mới cấp thẻ được!");
      return;
    }

    setLoading(true);

    // 1. Đẩy dữ liệu lên bảng 'members' trên Supabase
    const { error } = await supabase.from("members").insert([
      { phone: phone, full_name: name, address: address, points: 0 }
    ]);

    if (error) {
      // Nếu số điện thoại đã tồn tại, mình cứ coi như họ đã đăng ký và lưu vào máy luôn
      console.log("Số này có rồi hoặc lỗi:", error.message);
    }

    // 2. Lưu vào LocalStorage để app tự nhận diện "người quen"
    localStorage.setItem("giao_nong_user", JSON.stringify({
      name: name,
      phone: phone,
      address: address,
      points: 0
    }));

    setLoading(false);
    router.push("/"); // Đăng ký xong cho về trang chủ ngắm thẻ Kim Cương liền
  };

  return (
    <div className="min-h-screen bg-[#fcfaf1] p-6 flex flex-col justify-center max-w-md mx-auto shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
          <Sparkles className="text-orange-600" size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tighter">GIAO NÓNG</h1>
        <p className="text-gray-500 font-medium mt-2">Đăng ký thành viên - Nhận ngay ưu đãi</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="relative">
          <User className="absolute left-4 top-4 text-gray-400" size={20} />
          <input 
            type="text" placeholder="Họ và tên..." value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-orange-500 font-bold"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
          <input 
            type="tel" placeholder="Số điện thoại..." value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-orange-500 font-bold"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
          <textarea 
            placeholder="Địa chỉ giao hàng (Ví dụ: Chà Là...)" value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-orange-500 font-bold h-24 resize-none"
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : "NHẬN THẺ THÀNH VIÊN"}
          <ArrowRight size={20} />
        </button>
      </form>

      <p className="text-center text-[10px] text-gray-400 mt-6 px-10">
        Bằng cách bấm nút, cô chú đồng ý tham gia hệ thống tích điểm Giao Nóng tại Cà Mau.
      </p>
    </div>
  );
}