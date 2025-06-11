const PaymentSection = ({ setActiveSection }) => {
  return (
    <>
      <div className="col-12 text-center mt-3">
        <button type="button" className="btn btn-primary">
          Pay with Build Desk
        </button>
      </div>
      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveSection(11)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Prev
        </button>
        <button
          type="button"
          className="btn btn-primary"
        >
          Finish <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>
    </>
  );
};

export default PaymentSection;
