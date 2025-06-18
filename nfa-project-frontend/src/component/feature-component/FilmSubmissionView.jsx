import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { generatePDF } from "../../common/common-function";


const FilmSubmissionView = ({ data = {} }) => {
    const invoiceRef = useRef(null);
    const handleHardCopy = (type = 'DOWNLOAD', isCharges = false) => {
        const invoiceElement = invoiceRef.current;

        if (!invoiceElement) return;

        const chargeElements = invoiceElement.querySelectorAll('.chrg');

        chargeElements.forEach((el) => {
            if (isCharges) {
                el.removeAttribute('data-html2canvas-ignore');
            } else {
                el.setAttribute('data-html2canvas-ignore', 'true');
            }
        });

        generatePDF({
            element: invoiceElement,
            filename: 'Invoice',
            isType: type,
        });
    };
    return (
        <div className="container py-4" ref={invoiceRef} id="invoiceBox">
            {/* Header */}
            <div className="text-center mb-4">
                <img src="/logo.png" alt="Logo" className="logo" />
                <h3 className="text-warning">Creative minds of Tomorrow</h3>
            </div>

            {/* Section 1: Personal Detail */}
            <div className="mb-4">
                <h5 className="text-warning">1. Personal Detail</h5>
                <div className="row">
                    <div className="col-md-6">
                        <p>Full Name: {data?.name}</p>
                        <p>Age: {data.age}</p>
                        <p>(+ Country Code) - Mobile Number: {data.phone}</p>
                        <p>Photo: {data.photo}</p>
                        <p>Applicant Brief Bio: {data.bio}</p>
                        <p>Why Do You Want To Participate?: {data.reason}</p>
                        <p>Describe a time you helped your team: {data.teamwork}</p>
                        <p>Team rating (1-10): {data.rating}</p>
                        <p>(+ Country Code) - Alternate Number: {data.altPhone}</p>
                    </div>
                    <div className="col-md-6">
                        <p>Date of Birth: {data.dob}</p>
                        <p>Gender: {data.gender}</p>
                        <p>Email ID: {data.email}</p>
                        <p>Website Link: {data.website}</p>
                        <p>Instagram: {data.instagram}</p>
                        <p>Facebook: {data.facebook}</p>
                        <p>LinkedIn: {data.linkedin}</p>
                        <p>Twitter: {data.twitter}</p>
                        <p>How Did You Find CMOT?: {data.referral}</p>
                    </div>
                </div>
            </div>

            {/* Section 2: Address Identification */}
            <div className="mb-4">
                <h5 className="text-warning">2. Address Identification</h5>
                <div className="row">
                    <div className="col-md-6">
                        <p>Permanent Address: {data.permAddress}</p>
                        <p>State/UT: {data.permState}</p>
                        <p>State/UT of Origin: {data.stateOrigin}</p>
                        <p>First Govt. ID Number: {data.govId1}</p>
                    </div>
                    <div className="col-md-6">
                        <p>City: {data.permCity}</p>
                        <p>Residence Address: {data.residence}</p>
                        <p>State/UT: {data.resState}</p>
                        <p>City: {data.resCity}</p>
                        <p>Upload First Govt. ID Proof: {data.govId1Proof}</p>
                        <p>Upload Second Govt. ID Proof: {data.govId2Proof}</p>
                    </div>
                </div>
            </div>

            {/* Section 3: Films Details */}
            <div className="mb-4">
                <h5 className="text-warning">3. Films Details</h5>
                <div className="row">
                    <div className="col-md-6">
                        <p>Film Craft: {data.filmCraft}</p>
                        <p>Link to Film and password: {data.filmLink}</p>
                        <p>Project Title: {data.projectTitle}</p>
                        <p>Duration (minutes): {data.duration}</p>
                        <p>Project Completion Date: {data.completionDate}</p>
                        <p>Enter Filmography URL: {data.filmography}</p>
                        <p>Awards/Recognition: {data.awards}</p>
                    </div>
                    <div className="col-md-6">
                        <p>Link Film Password: {data.filmPassword}</p>
                        <p>Upload CV: {data.cv}</p>
                        <p>Show Reel (link): {data.showReel}</p>
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-between">
                <NavLink to={'/dashboard'} className="btn btn-outline-primary">Dashboard</NavLink>
                <button className="btn btn-success" onClick={() => handleHardCopy('DOWNLOAD', true)}>Print</button>
            </div>
        </div>
    );
};

export default FilmSubmissionView;
