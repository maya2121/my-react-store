import React from "react";
import "../styles/admin.css";

const VisitStoreButton = () => {

    const goToStore = () => {
    window.open("http://localhost:5174", "_blank");
    // غيّري الرابط لاحقاً للموقع الحقيقي
    };

return (
    <div>
<button className="visit-store-btn" onClick={goToStore}>
        🌐  Visit  thr store
</button>
    </div>
);
};

export default VisitStoreButton;