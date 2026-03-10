import React, { useState } from "react";
import ProductEditor from "./ProductEditor";
import "../styles/admin.css";

const ProductManager = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "منتج 1", description: "وصف المنتج", price: 100 },
    { id: 2, name: "منتج 2", description: "وصف المنتج", price: 250 }
  ]);

  const addProduct = (product) => {
    setProducts([...products, { ...product, id: Date.now() }]);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="admin-section">
  

      <ProductEditor onAddProduct={addProduct} />

      <table className="admin-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>السعر</th>
            <th>إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price}$</td>
              <td>
                <button className="btn-danger" onClick={() => deleteProduct(product.id)}>
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManager;