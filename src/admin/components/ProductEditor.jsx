import React, { useState } from "react";

const ProductEditor = ({ onAddProduct }) => {
  const [product, setProduct] = useState({ name: "", description: "", price: "", image: null });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({ ...product, image: URL.createObjectURL(file) });
    }
  };

  const handleAdd = () => {
    if (!product.name || !product.price) return alert("يرجى ملء البيانات الأساسية");
    onAddProduct(product);
    setProduct({ name: "", description: "", price: "", image: null });
  };

  return (
    <div className="product-editor card">
              {/* إضافة منتج جديد   */}
      <h3 >    Add a product  </h3>
      <input name="name" placeholder=" product name" value={product.name} onChange={handleChange}/>
      <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange}/>
      <input name="price" type="number" placeholder=" the Price" value={product.price} onChange={handleChange}/>
      
      <div style={{margin: '10px 0'}}>
        <label> product image: </label>
        <input type="file" onChange={handleImage} accept="image/*" />
        {product.image && <img src={product.image} className="img-preview" alt="preview" />}
      </div>

      <button className="btn-primary" onClick={handleAdd}> Add the product</button>
    </div>
  );
};

export default ProductEditor;