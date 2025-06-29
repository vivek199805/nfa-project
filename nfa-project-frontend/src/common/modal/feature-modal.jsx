// ModalComponent.jsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth";

const FeatureModalComponent = ({
  title = "Producer / Production Company",
  buttonLabel = { label1: "feature", label2: "non-feature" },
  buttonValue = { value1: "feature", value2: "non-feature" },
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
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
    if (user?.usertype == 1) {
      if (type === "feature") navigate("/feature");
      else navigate("/non-feature");
    } else {
      if (type === "best-book") navigate("/best-book");
      else navigate("/film-critic");
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" onClick={handleModalClick}>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-options">
          <label onClick={() => handleSelect(buttonValue?.value1)}>
            <input type="radio" name="type" />
            <span>{buttonLabel?.label1}</span>
          </label>
          <label onClick={() => handleSelect(buttonValue?.value2)}>
            <input type="radio" name="type" />
            <span>{buttonLabel?.label2}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FeatureModalComponent;
