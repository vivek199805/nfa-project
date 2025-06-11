// ModalComponent.jsx

import { useNavigate } from "react-router-dom";

const FeatureModalComponent = ({ isOpen, onClose }) => {
      const navigate = useNavigate();
  if (!isOpen) return null;

    const handleOverlayClick = () => {
    onClose(); // Close the modal
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent closing when clicking inside modal
  };

    const handleSelect = (type) => {
    onClose(); // Optional: close modal
    if (type === "feature") navigate("/feature");
    else navigate("/non-feature");
  };

   return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" onClick={handleModalClick}>
        <h2 className="modal-title">Producer / Production Company</h2>
        <div className="modal-options">
          <label onClick={() => handleSelect("feature")}>
            <input type="radio" name="type" />
            <span>Feature</span>
          </label>
          <label onClick={() => handleSelect("non-feature")}>
            <input type="radio" name="type" />
            <span>Non-Feature</span>
          </label>
        </div>
      </div>
    </div>
  );

};

export default FeatureModalComponent;
