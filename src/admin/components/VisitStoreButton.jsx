import React from "react";
import "../styles/admin.css";

const VisitStoreButton = () => {

    const goToStore = () => {
    window.open(window.location.origin, "_blank", "noopener,noreferrer");
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
