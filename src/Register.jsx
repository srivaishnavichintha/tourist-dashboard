import { useState, useEffect } from "react"
import {
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  FileText,
  Camera,
  Clock,
} from "lucide-react"
import "./Register.css"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    gender: "",

    // Identity Documents
    idType: "",
    idNumber: "",
    passportNumber: "",

    // Trip Information
    visitPurpose: "",
    duration: "",
    accommodation: "",
    emergencyContact: "",
    emergencyPhone: "",

    // Itinerary
    plannedDestinations: "",
    travelDates: "",

    // Agreements
    dataConsent: false,
    trackingConsent: false,
    emergencyConsent: false,
  })

  const [uploadedDocs, setUploadedDocs] = useState({
    photoId: null,
    idDocument: null,
    passport: null,
  })

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResendOtp, setCanResendOtp] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Timer for OTP
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    } else if (otpTimer === 0 && otpSent) {
      setCanResendOtp(true)
    }
    return () => clearInterval(interval)
  }, [otpTimer, otpSent])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Reset OTP verification if ID number changes
    if (field === "idNumber" && otpSent) {
      setOtpSent(false)
      setOtpVerified(false)
      setOtpValue("")
    }
  }

  const handleFileUpload = (docType, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Different validation based on document type
    if (docType === "photoId") {
      // Only accept images for profile photo
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG and PNG files are allowed for profile photo.");
        return;
      }
    } else {
      // Only accept PDF for ID documents
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed for ID documents.");
        return;
      }
    }

    setUploadedDocs((prev) => ({
      ...prev,
      [docType]: {
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      },
    }));
  }

  // Handle OTP sending
  const handleSendOtp = () => {
    // Validate it's a 12-digit number for Aadhaar
    if (formData.idType === "aadhaar" && formData.idNumber.length === 12 && /^\d+$/.test(formData.idNumber)) {
      // Simulate sending OTP (in a real app, this would call an API)
      setOtpSent(true)
      setOtpTimer(120) // 2 minutes timer
      setCanResendOtp(false)
      alert("OTP has been sent to your registered mobile number")
    } else {
      alert("Please enter a valid 12-digit Aadhaar number")
    }
  }

  // Handle OTP verification
  const handleVerifyOtp = () => {
    // Simulate OTP verification (in a real app, this would call an API)
    // For demo purposes, any 6-digit number will work
    if (otpValue.length === 6) {
      setOtpVerified(true)
      alert("Aadhaar verified successfully!")
    } else {
      alert("Please enter a valid 6-digit OTP")
    }
  }

  // Handle OTP resend
  const handleResendOtp = () => {
    setOtpSent(true)
    setOtpTimer(120)
    setCanResendOtp(false)
    setOtpValue("")
    alert("New OTP has been sent to your registered mobile number")
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // Simulate blockchain registration
    alert(
      "Digital ID successfully registered on blockchain! Your Tourist ID: TST-2024-" +
        Math.random().toString(36).substr(2, 9).toUpperCase(),
    )
  }

  // Get placeholder text based on selected ID type
  const getIdPlaceholder = () => {
    switch (formData.idType) {
      case "aadhaar":
        return "Enter 12-digit Aadhaar Number";
      case "driving-license":
        return "Enter Driving License Number";
      case "voter-id":
        return "Enter Voter ID Number";
      case "passport":
        return "Enter Passport Number";
      default:
        return "Enter ID number";
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="section-title">
                <User className="icon" />
                Personal Information
              </h3>
              <div className="form-grid">
                <div>
                  <label htmlFor="fullName" className="form-label">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth *
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="nationality" className="form-label">
                    Nationality *
                  </label>
                  <select
                    id="nationality"
                    className="form-input"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                  >
                    <option value="">Select nationality</option>
                    <option value="indian">Indian</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="section-title">
                <FileText className="icon" />
                Identity Verification
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="idType" className="form-label">
                    Primary ID Type *
                  </label>
                  <select
                    id="idType"
                    className="form-input"
                    value={formData.idType}
                    onChange={(e) => handleInputChange("idType", e.target.value)}
                  >
                    <option value="">Select ID type</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving-license">Driving License</option>
                    <option value="voter-id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="idNumber" className="form-label">
                    ID Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="idNumber"
                      className="form-input flex-1"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange("idNumber", e.target.value)}
                      placeholder={getIdPlaceholder()}
                      maxLength={formData.idType === "aadhaar" ? 12 : undefined}
                    />
                    {formData.idType === "aadhaar" && formData.idNumber.length === 12 && !otpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="button button-primary whitespace-nowrap"
                        disabled={otpSent}
                      >
                        {otpSent ? "OTP Sent" : "Verify"}
                      </button>
                    )}
                    {otpVerified && (
                      <div className="flex items-center justify-center bg-green-100 text-green-800 px-4 rounded-md">
                        <CheckCircle size={20} className="mr-2" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                
                {/* OTP Verification Section */}
                {formData.idType === "aadhaar" && otpSent && !otpVerified && (
                  <div className="otp-verification-section">
                    <div className="flex items-center gap-2 mb-2">
                      <label htmlFor="otpInput" className="form-label mb-0">
                        Enter OTP *
                      </label>
                      {otpTimer > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="otpInput"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-input flex-1"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="button button-primary whitespace-nowrap"
                      >
                        Verify OTP
                      </button>
                    </div>
                    {canResendOtp && (
                      <div className="mt-2 text-sm">
                        Didn't receive OTP?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-blue-600 hover:underline"
                        >
                          Resend OTP
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {formData.nationality !== "indian" && (
                  <div>
                    <label htmlFor="passportNumber" className="form-label">
                      Passport Number *
                    </label>
                    <input
                      id="passportNumber"
                      className="form-input"
                      value={formData.passportNumber}
                      onChange={(e) =>
                        handleInputChange("passportNumber", e.target.value)
                      }
                      placeholder="Enter passport number"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="subsection-title">Document Upload</h4>
              <div className="document-upload-grid">
                {/* Photo ID Upload - Images only */}
                <div className="upload-card">
                  <label htmlFor="photoUpload" className="upload-content cursor-pointer">
                    {uploadedDocs.photoId ? (
                      uploadedDocs.photoId.preview ? (
                        <img
                          src={uploadedDocs.photoId.preview}
                          alt="Photo ID"
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      ) : (
                        <CheckCircle className="upload-icon-complete" />
                      )
                    ) : (
                      <Camera className="upload-icon" />
                    )}
                    <p className="upload-title">Profile Photo</p>
                    <p className="upload-subtitle">Click to upload or capture</p>
                    <p className="file-requirements">JPG, PNG only</p>
                  </label>
                  <input
                    id="photoUpload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileUpload("photoId", e)}
                    capture="camera"
                  />
                </div>

                {/* ID Document Upload - PDF only */}
                <div className="upload-card">
                  <label htmlFor="idUpload" className="upload-content cursor-pointer">
                    {uploadedDocs.idDocument ? (
                      <CheckCircle className="upload-icon-complete" />
                    ) : (
                      <Upload className="upload-icon" />
                    )}
                    <p className="upload-title">ID Document</p>
                    <p className="upload-subtitle">Click to upload</p>
                    <p className="file-requirements">PDF only</p>
                  </label>
                  <input
                    id="idUpload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload("idDocument", e)}
                  />
                </div>

                {/* Passport Upload - PDF only */}
                <div className="upload-card">
                  <label htmlFor="passportUpload" className="upload-content cursor-pointer">
                    {uploadedDocs.passport ? (
                      <CheckCircle className="upload-icon-complete" />
                    ) : (
                      <Upload className="upload-icon" />
                    )}
                    <p className="upload-title">Passport</p>
                    <p className="upload-subtitle">If applicable</p>
                    <p className="file-requirements">PDF only</p>
                  </label>
                  <input
                    id="passportUpload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload("passport", e)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="section-title">
                <MapPin className="icon" />
                Trip Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="visitPurpose" className="form-label">
                    Purpose of Visit *
                  </label>
                  <select
                    id="visitPurpose"
                    className="form-input"
                    value={formData.visitPurpose}
                    onChange={(e) => handleInputChange("visitPurpose", e.target.value)}
                  >
                    <option value="">Select purpose</option>
                    <option value="tourism">Tourism</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical</option>
                    <option value="family">Family Visit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="form-label">
                    Duration of Stay *
                  </label>
                  <select
                    id="duration"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  >
                    <option value="">Select duration</option>
                    <option value="1-3-days">1-3 days</option>
                    <option value="4-7-days">4-7 days</option>
                    <option value="1-2-weeks">1-2 weeks</option>
                    <option value="2-4-weeks">2-4 weeks</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="longer">Longer than 3 months</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="accommodation" className="form-label">
                    Accommodation Details
                  </label>
                  <textarea
                    id="accommodation"
                    className="form-textarea"
                    value={formData.accommodation}
                    onChange={(e) =>
                      handleInputChange("accommodation", e.target.value)
                    }
                    placeholder="Hotel name, address, or accommodation details"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="plannedDestinations" className="form-label">
                    Planned Destinations *
                  </label>
                  <textarea
                    id="plannedDestinations"
                    className="form-textarea"
                    value={formData.plannedDestinations}
                    onChange={(e) =>
                      handleInputChange("plannedDestinations", e.target.value)
                    }
                    placeholder="List the places you plan to visit in Northeast India"
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </div>

            <div>
              <h4 className="subsection-title">
                <Phone className="icon" />
                Emergency Contact
              </h4>
              <div className="form-grid">
                <div>
                  <label htmlFor="emergencyContact" className="form-label">
                    Emergency Contact Name *
                  </label>
                  <input
                    id="emergencyContact"
                    className="form-input"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      handleInputChange("emergencyContact", e.target.value)
                    }
                    placeholder="Full name of emergency contact"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="form-label">
                    Emergency Contact Phone *
                  </label>
                  <input
                    id="emergencyPhone"
                    className="form-input"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyPhone", e.target.value)
                    }
                    placeholder="Phone number with country code"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="section-title">
                <Shield className="icon" />
                Consent & Agreements
              </h3>
              <div className="space-y-4">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="dataConsent"
                    className="form-checkbox"
                    checked={formData.dataConsent}
                    onChange={(e) =>
                      handleInputChange("dataConsent", e.target.checked)
                    }
                  />
                  <div className="checkbox-label-content">
                    <label htmlFor="dataConsent" className="checkbox-label">
                      Data Processing Consent *
                    </label>
                    <p className="checkbox-description">
                      I consent to the processing of my personal data for tourist
                      safety monitoring purposes, in accordance with data
                      protection laws.
                    </p>
                  </div>
                </div>

                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="trackingConsent"
                    className="form-checkbox"
                    checked={formData.trackingConsent}
                    onChange={(e) =>
                      handleInputChange("trackingConsent", e.target.checked)
                    }
                  />
                  <div className="checkbox-label-content">
                    <label htmlFor="trackingConsent" className="checkbox-label">
                      Location Tracking Consent
                    </label>
                    <p className="checkbox-description">
                      I consent to optional real-time location tracking for enhanced
                      safety monitoring (can be disabled anytime).
                    </p>
                  </div>
                </div>

                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="emergencyConsent"
                    className="form-checkbox"
                    checked={formData.emergencyConsent}
                    onChange={(e) =>
                      handleInputChange("emergencyConsent", e.target.checked)
                    }
                  />
                  <div className="checkbox-label-content">
                    <label
                      htmlFor="emergencyConsent"
                      className="checkbox-label"
                    >
                      Emergency Response Authorization *
                    </label>
                    <p className="checkbox-description">
                      I authorize emergency services to access my location and
                      contact information in case of distress or emergency
                      situations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="alert-card">
              <Shield className="alert-icon" />
              <div className="alert-description">
                Your digital ID will be secured using blockchain technology and will be
                valid only for the duration of your visit to Northeast India. All data
                is encrypted and complies with privacy regulations.
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-header">
                <h2 className="summary-title">Registration Summary</h2>
              </div>
              <div className="summary-content">
                <div className="summary-item">
                  <span>Name:</span>
                  <span className="summary-value">
                    {formData.fullName || "Not provided"}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Nationality:</span>
                  <span className="summary-value">
                    {formData.nationality || "Not provided"}
                  </span>
                </div>
                <div className="summary-item">
                  <span>ID Verification:</span>
                  <span className="summary-value">
                    {formData.idType === "aadhaar" && otpVerified 
                      ? "Aadhaar Verified" 
                      : formData.idType || "Not provided"}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Visit Purpose:</span>
                  <span className="summary-value">
                    {formData.visitPurpose || "Not provided"}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <span className="summary-value">
                    {formData.duration || "Not provided"}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Documents Uploaded:</span>
                  <span className="summary-value">
                    {Object.values(uploadedDocs).filter(Boolean).length}/3
                  </span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.fullName &&
          formData.email &&
          formData.phone &&
          formData.dateOfBirth &&
          formData.nationality
        )
      case 2:
        const idFieldsValid = formData.idType && formData.idNumber;
        const documentsValid = uploadedDocs.photoId && uploadedDocs.idDocument;
        
        // For Aadhaar, require OTP verification
        if (formData.idType === "aadhaar") {
          return idFieldsValid && documentsValid && otpVerified;
        } else {
          return idFieldsValid && documentsValid;
        }
      case 3:
        return (
          formData.visitPurpose &&
          formData.duration &&
          formData.plannedDestinations &&
          formData.emergencyContact &&
          formData.emergencyPhone
        )
      case 4:
        return formData.dataConsent && formData.emergencyConsent
      default:
        return false
    }
  }

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <div className="header-section">
          <div className="header-logo-group">
            <div className="header-logo-bg">
              <Shield className="header-logo" />
            </div>
            <div>
              <h1 className="header-title">Digital Tourist ID Registration</h1>
              <p className="header-subtitle">
                Secure blockchain-based identification for Northeast India
              </p>
            </div>
          </div>

          <div className="badge-group">
            <span className="badge">Blockchain Secured</span>
            <span className="badge">KYC Verified</span>
            <span className="badge">Privacy Protected</span>
          </div>
        </div>

        {/* Progress */}
        <div className="card progress-card">
          <div className="progress-content">
            <div className="progress-text-container">
              <span className="progress-text">Registration Progress</span>
              <span className="progress-step-counter">
                Step {step} of {totalSteps}
              </span>
            </div>
            <progress
              className="progress-bar"
              value={progress}
              max="100"
            ></progress>
            <div className="progress-labels">
              <span>Personal Info</span>
              <span>Identity Verification</span>
              <span>Trip Details</span>
              <span>Consent</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-content">{renderStep()}</div>
        </div>

        {/* Navigation */}
        <div className="form-navigation">
          <button
            className="button button-outline"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            Previous
          </button>

          {step < totalSteps ? (
            <button
              className="button button-primary"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={handleSubmit}
              disabled={!isStepValid()}
            >
              Register Digital ID
            </button>
          )}
        </div>

        {/* Help */}
        <div className="card help-card">
          <div className="help-content">
            <AlertCircle className="help-icon" />
            <div>
              <h4 className="help-title">Need Help?</h4>
              <p className="help-description">
                If you encounter any issues during registration, our support team is
                available 24/7.
              </p>
              <div className="help-contact-info">
                <span>📞 1800-XXX-XXXX</span>
                <span>📧 support@touristsafety.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}