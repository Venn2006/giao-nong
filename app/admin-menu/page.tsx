"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form nhập liệu
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [type, setType] = useState("food");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name || !price || !category) return alert("Nhập đủ Tên, Giá và Danh mục nha sếp!");
    await supabase.from('menu_items').insert([{ 
      name, 
      price: parseInt(price), 
      image_url: img, 
      type, 
      category, 
      description: desc 
    }]);
    setName(""); setPrice(""); setImg(""); setDesc(""); fetchMenu();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Chắc chắn xóa món này khỏi Menu?")) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 font-sans max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">Nhập Đồ Ăn Real</h1>
      
      {/* FORM NHẬP NHANH */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 space-y-4">
        <h2 className="font-black text-orange-600 uppercase text-sm">Thêm món mới hôm nay</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Tên món (Vd: Bún Riêu Chả)" value={name} onChange={e => setName(e.target.value)} className="p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
          <input placeholder="Giá (Vd: 35000)" type="number" value={price} onChange={e => setPrice(e.target.value)} className="p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
        </div>
        
        <input placeholder="Danh mục (Vd: Bún Riêu Cua Đồng)" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
        
        <input placeholder="Mô tả ngắn (Vd: Full topping, chả cua...)" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-orange-500 text-sm" />
        
        <input placeholder="Link hình ảnh món ăn (Tùy chọn)" value={img} onChange={e => setImg(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-orange-500 text-sm" />
        
        <div className="flex gap-6 p-2 bg-gray-50 rounded-xl border border-gray-200">
          <label className="flex items-center gap-2 font-bold cursor-pointer"><input type="radio" checked={type==='food'} onChange={()=>setType('food')} className="w-4 h-4 accent-orange-600" /> Đồ Ăn</label>
          <label className="flex items-center gap-2 font-bold cursor-pointer"><input type="radio" checked={type==='drink'} onChange={()=>setType('drink')} className="w-4 h-4 accent-orange-600" /> Nước Uống</label>
        </div>

        <button onClick={handleAdd} className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg">
          <Plus size={20}/> TẢI LÊN APP GIAO NÓNG
        </button>
      </div>

      {/* DANH SÁCH MÓN ĐANG CÓ */}
      <div className="space-y-3">
        <h2 className="font-black text-gray-500 uppercase text-sm">Thực đơn đang hiển thị trên App</h2>
        {loading ? <Loader2 className="animate-spin mx-auto text-orange-600"/> : items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              {item.image_url ? <img src={item.image_url} className="w-12 h-12 object-cover rounded-xl" /> : <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><ImageIcon className="text-gray-400" size={20}/></div>}
              <div>
                <p className="font-black text-gray-900">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-orange-600 font-black text-xs">{item.price.toLocaleString('vi-VN')}đ</p>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold">{item.category}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 p-3 bg-red-50 rounded-xl active:bg-red-100 transition-colors"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}