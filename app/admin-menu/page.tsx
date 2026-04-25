"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form thêm món mới
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [type, setType] = useState("food");

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name || !price) return alert("Nhập tên và giá đi sếp!");
    await supabase.from('menu_items').insert([{ name, price: parseInt(price), image_url: img, type }]);
    setName(""); setPrice(""); setImg(""); fetchMenu();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa món này hả sếp?")) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 font-sans max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">Quản Lý Thực Đơn Ngày</h1>
      
      {/* FORM NHẬP NHANH */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 space-y-4">
        <h2 className="font-black text-orange-600 uppercase text-sm">Thêm món mới hôm nay</h2>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Tên món (vd: Bún Riêu Đặc Biệt)" value={name} onChange={e => setName(e.target.value)} className="p-3 border rounded-xl font-bold" />
          <input placeholder="Giá (vd: 35000)" type="number" value={price} onChange={e => setPrice(e.target.value)} className="p-3 border rounded-xl font-bold" />
        </div>
        <input placeholder="Link hình (Copy link ảnh từ Facebook/Supabase dán vào)" value={img} onChange={e => setImg(e.target.value)} className="w-full p-3 border rounded-xl" />
        <div className="flex gap-4">
          <label className="flex items-center gap-2 font-bold"><input type="radio" checked={type==='food'} onChange={()=>setType('food')} /> Đồ Ăn</label>
          <label className="flex items-center gap-2 font-bold"><input type="radio" checked={type==='drink'} onChange={()=>setType('drink')} /> Đồ Uống</label>
        </div>
        <button onClick={handleAdd} className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all">
          <Plus size={20}/> CẬP NHẬT LÊN APP NGAY
        </button>
      </div>

      {/* DANH SÁCH MÓN ĐANG CÓ */}
      <div className="space-y-4">
        <h2 className="font-black text-gray-500 uppercase text-sm">Thực đơn đang hiển thị</h2>
        {loading ? <Loader2 className="animate-spin mx-auto text-orange-600"/> : items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              {item.image_url ? <img src={item.image_url} className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon className="text-gray-400" size={20}/></div>}
              <div>
                <p className="font-black text-gray-900">{item.name}</p>
                <p className="text-orange-600 font-bold text-sm">{item.price.toLocaleString()}đ</p>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 p-2"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}