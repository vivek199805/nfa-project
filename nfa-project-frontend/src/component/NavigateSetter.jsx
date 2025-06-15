import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "../common/navigate";

const NavigateSetter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
};

export default NavigateSetter;