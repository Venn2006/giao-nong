"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Plus, Trash2, Store, Loader2, ListOrdered } from "lucide-react";

export default function AdminMenu() {
  const [genericDishes, setGenericDishes] = useState<any[]>([]); // Món gốc từ Excel
  const [restaurants, setRestaurants] = useState<any[]>([]); // Quán đã nhập
  const [loading, setLoading] = useState(true);

  // Form nhập liệu Quán
  const [selectedDish, setSelectedDish] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Lấy danh sách món gốc (từ file Excel của mày up lên menu_items)
    const { data: dishes } = await supabase.from('menu_items').select('name').order('name');
    if (dishes) setGenericDishes(dishes);
    
    // 2. Lấy danh sách Quán đã thêm
    const { data: rests } = await supabase.from('restaurant_options').select('*').order('created_at', { ascending: false });
    if (rests) setRestaurants(rests);
    
    setLoading(false);
  };

  const handleAddRestaurant = async () => {
    if (!selectedDish || !restaurantName || !price || !address) {
      return alert("Nhập đủ Tên Món, Tên Quán, Địa chỉ và Giá nha sếp!");
    }
    
    await supabase.from('restaurant_options').insert([{ 
      dish_name: selectedDish, 
      restaurant_name: restaurantName, 
      address: address,
      price: parseInt(price), 
      image_url: img 
    }]);
    
    setRestaurantName(""); setAddress(""); setPrice(""); setImg(""); 
    fetchData();
    alert("Đã thêm quán lên App Giao Nóng!");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Chắc chắn xóa quán này khỏi món ăn?")) {
      await supabase.from('restaurant_options').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20 font-sans max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-6 uppercase">Nhập Quán Ăn Real</h1>
      
      {/* FORM THÊM QUÁN */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 space-y-4 border-t-4 border-orange-600">
        <h2 className="font-black text-gray-800 uppercase text-sm flex items-center gap-2"><Store size={18}/> Gán Quán cho Món</h2>
        
        {/* Chọn món gốc (Sổ ra từ file Excel) */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-1">CHỌN MÓN GỐC</p>
          <select value={selectedDish} onChange={e => setSelectedDish(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl font-bold outline-orange-500 bg-gray-50">
            <option value="">-- Bấm để chọn món gốc --</option>
            {genericDishes.map((dish, idx) => (
              <option key={idx} value={dish.name}>{dish.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-bold text-gray-500 mb-1">TÊN QUÁN THỰC TẾ</p>
            <input placeholder="Vd: Bún Cây Xoài" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 mb-1">GIÁ BÁN</p>
            <input placeholder="Vd: 35000" type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
          </div>
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-1">ĐỊA CHỈ QUÁN</p>
          <input placeholder="Vd: Phường 5, TP Cà Mau" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl font-bold outline-orange-500" />
        </div>
        
        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-1">LINK ẢNH MÓN CỦA QUÁN (Nếu có)</p>
          <input placeholder="Dán link ảnh vào đây..." value={img} onChange={e => setImg(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl outline-orange-500 text-sm" />
        </div>

        <button onClick={handleAddRestaurant} className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg">
          <Plus size={20}/> CẬP NHẬT QUÁN LÊN APP
        </button>
      </div>

      {/* DANH SÁCH QUÁN ĐANG HIỂN THỊ */}
      <div className="space-y-3">
        <h2 className="font-black text-gray-500 uppercase text-sm flex items-center gap-2"><ListOrdered size={16}/> Danh sách Quán đã thêm</h2>
        {loading ? <Loader2 className="animate-spin mx-auto text-orange-600"/> : restaurants.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              {item.image_url ? <img src={item.image_url} className="w-12 h-12 object-cover rounded-xl" /> : <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Store className="text-gray-400" size={20}/></div>}
              <div>
                <p className="font-black text-gray-900">{item.restaurant_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">{item.dish_name}</span>
                  <p className="text-gray-600 font-bold text-xs">{item.price.toLocaleString('vi-VN')}đ</p>
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