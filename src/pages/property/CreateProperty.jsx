import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Home,
  DollarSign,
  Image as ImageIcon,
  User,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import apiUrl from "../../constants/apiUrl";
import Navbar from "../../components/Navbar";

const CreateProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");

  const initialForm = {
    userId: "",
    purpose: "For Sale",
    name: "",
    duration: "",
    typeOfProject: "Residential",
    plotSize: "",
    plotStage: "Developed",
    possessionType: "Immediate",
    otherDetails: "",
    specificDetails: "",
    typeOfProperty: "House",
    address: "",
    longitude: "",
    latitude: "",
    areaSize: "",
    price: 0,
    readyForPossession: "Yes",
    advanceAmount: "",
    noOfInstallment: 0,
    monthlyInstallment: 0,
    builtInYear: new Date().getFullYear(),
    flooring: "Tile",
    floors: 1,
    parkingSpace: "",
    electricityBackup: "None",
    furnished: "No",
    view: "",
    wasteDisposal: "Municipal",
    bedRooms: "",
    bathrooms: "",
    kitchens: "",
    storeRooms: "",
    drawingRooms: "",
    diningRooms: "",
    studyRooms: "",
    prayerRooms: "",
    servantQuarters: "",
    sittingRooms: "",
    communityLawn: "No",
    medicalCentre: "No",
    dayCare: "No",
    communityPool: "No",
    kidsPlayArea: "No",
    mosque: "No",
    communityGym: "No",
    bbqArea: "No",
    communityCentre: "No",
    nearBySchools: "",
    nearByHospitals: "",
    nearByShoppingMalls: "",
    nearByColleges: "",
    nearByRestaurants: "",
    nearByPublicTransport: "",
    nearByUniversity: "",
    adTitle: "",
    adDescription: "",
    images: [],
    fullName: "",
    mobile: "",
    email: "",
    landLine: "",
    anyMessage: "",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.userId || user.userId || "");
      setForm((prev) => ({
        ...prev,
        userId: user.userId || user.userId || "",
        fullName: user.name || "",
        email: user.email || "",
        mobile: user.phoneNumber || "",
      }));
    }
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("userToken");
      for (let file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${apiUrl}/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        const imageUrl =
          data.imageUrl || data.url || data.data?.url || data.data;

        if (imageUrl) {
          setForm((prev) => ({ ...prev, images: [...prev.images, imageUrl] }));
        }
      }
    } catch (err) {
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validation
    if (!form.name || !form.address || !form.price) {
      setError("Please fill in all required fields (Name, Address, Price)");
      setLoading(false);
      return;
    }

    // Validate installment fields if purpose is "On Installment"
    if (form.purpose === "On Installment") {
      if (!form.noOfInstallment || form.noOfInstallment <= 0) {
        setError("Please enter the number of installments");
        setLoading(false);
        return;
      }
      if (!form.monthlyInstallment || form.monthlyInstallment <= 0) {
        setError("Please enter the monthly installment amount");
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${apiUrl}/createProperty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: form }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Property created successfully!");
        setTimeout(() => {
          navigate("/property");
        }, 2000);
      } else {
        setError(result.message || "Failed to create property");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={Building2} title="Basic Property Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField
                label="User ID"
                name="userId"
                value={form.userId}
                onChange={handleInput}
                disabled
                readOnly
              />
              <SelectField
                label="Purpose *"
                name="purpose"
                value={form.purpose}
                onChange={handleInput}
                options={["For Sale", "For Rent", "On Installment"]}
              />
              <InputField
                label="Property Name *"
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="e.g. Madadgaar Heights"
              />
              <InputField
                label="Project Duration"
                name="duration"
                value={form.duration}
                onChange={handleInput}
                placeholder="e.g. 5 Years / Ready"
              />
              <SelectField
                label="Project Type"
                name="typeOfProject"
                value={form.typeOfProject}
                onChange={handleInput}
                options={["Residential", "Commercial", "Mixed Use"]}
              />
              <SelectField
                label="Property Type *"
                name="typeOfProperty"
                value={form.typeOfProperty}
                onChange={handleInput}
                options={[
                  "House",
                  "Flat",
                  "Residential Plot",
                  "Commercial Plot",
                  "Agricultural Land",
                ]}
              />
              <InputField
                label="Area Size *"
                name="areaSize"
                value={form.areaSize}
                onChange={handleInput}
                placeholder="e.g. 10 Marla / 500 Sqft"
              />
              <InputField
                label="Plot Size"
                name="plotSize"
                value={form.plotSize}
                onChange={handleInput}
                placeholder="e.g. 5 Marla"
              />
              <SelectField
                label="Plot Stage"
                name="plotStage"
                value={form.plotStage}
                onChange={handleInput}
                options={["Developed", "Under Construction", "Open Land"]}
              />
              <SelectField
                label="Possession Type"
                name="possessionType"
                value={form.possessionType}
                onChange={handleInput}
                options={["Immediate", "On Full Payment", "Under Contract"]}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={DollarSign} title="Pricing & Location Details" />

            {/* Info Box */}
            <div
              className={`p-4 rounded-xl border-2 ${
                form.purpose === "For Sale"
                  ? "bg-green-50 border-green-200"
                  : form.purpose === "For Rent"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p className="text-sm font-semibold text-gray-700">
                {form.purpose === "For Sale" &&
                  "💰 For Sale - Enter the total selling price"}
                {form.purpose === "For Rent" &&
                  "🏠 For Rent - Enter monthly rent amount"}
                {form.purpose === "On Installment" &&
                  "📅 On Installment - Enter total price and installment details"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label={
                  form.purpose === "For Rent"
                    ? "Monthly Rent (PKR) *"
                    : "Price (PKR) *"
                }
                name="price"
                type="number"
                value={form.price}
                onChange={handleInput}
                placeholder="0"
              />

              {form.purpose === "On Installment" && (
                <>
                  <InputField
                    label="Advance Amount"
                    name="advanceAmount"
                    value={form.advanceAmount}
                    onChange={handleInput}
                    placeholder="e.g. 25% Upfront or 500000"
                  />
                  <InputField
                    label="Number of Installments *"
                    name="noOfInstallment"
                    type="number"
                    value={form.noOfInstallment}
                    onChange={handleInput}
                    placeholder="e.g. 12, 24, 36"
                  />
                  <InputField
                    label="Monthly Installment (PKR) *"
                    name="monthlyInstallment"
                    type="number"
                    value={form.monthlyInstallment}
                    onChange={handleInput}
                    placeholder="e.g. 50000"
                  />
                </>
              )}

              {form.purpose === "For Rent" && (
                <InputField
                  label="Security Deposit (PKR)"
                  name="advanceAmount"
                  value={form.advanceAmount}
                  onChange={handleInput}
                  placeholder="e.g. 2 months rent"
                />
              )}

              <InputField
                label="Address *"
                name="address"
                value={form.address}
                onChange={handleInput}
                className="md:col-span-2"
                placeholder="Complete address"
              />
              <InputField
                label="Latitude"
                name="latitude"
                value={form.latitude}
                onChange={handleInput}
                placeholder="e.g. 24.8607"
              />
              <InputField
                label="Longitude"
                name="longitude"
                value={form.longitude}
                onChange={handleInput}
                placeholder="e.g. 67.0011"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={Home} title="Property Features & Layout" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <InputField
                label="Bedrooms"
                name="bedRooms"
                type="number"
                value={form.bedRooms}
                onChange={handleInput}
              />
              <InputField
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={form.bathrooms}
                onChange={handleInput}
              />
              <InputField
                label="Kitchens"
                name="kitchens"
                type="number"
                value={form.kitchens}
                onChange={handleInput}
              />
              <InputField
                label="Floors"
                name="floors"
                type="number"
                value={form.floors}
                onChange={handleInput}
              />
              <InputField
                label="Drawing Rooms"
                name="drawingRooms"
                type="number"
                value={form.drawingRooms}
                onChange={handleInput}
              />
              <InputField
                label="Dining Rooms"
                name="diningRooms"
                type="number"
                value={form.diningRooms}
                onChange={handleInput}
              />
              <InputField
                label="Store Rooms"
                name="storeRooms"
                type="number"
                value={form.storeRooms}
                onChange={handleInput}
              />
              <InputField
                label="Servant Quarters"
                name="servantQuarters"
                type="number"
                value={form.servantQuarters}
                onChange={handleInput}
              />
              <SelectField
                label="Flooring"
                name="flooring"
                value={form.flooring}
                onChange={handleInput}
                options={["Tile", "Marble", "Wood", "Concrete"]}
              />
              <SelectField
                label="Furnished"
                name="furnished"
                value={form.furnished}
                onChange={handleInput}
                options={["No", "Yes", "Semi"]}
              />
              <InputField
                label="Parking Space"
                name="parkingSpace"
                value={form.parkingSpace}
                onChange={handleInput}
                placeholder="e.g. 2 Cars"
              />
              <SelectField
                label="Electricity Backup"
                name="electricityBackup"
                value={form.electricityBackup}
                onChange={handleInput}
                options={["None", "Generator", "UPS", "Solar"]}
              />
              <SelectField
                label="Waste Disposal"
                name="wasteDisposal"
                value={form.wasteDisposal}
                onChange={handleInput}
                options={["Treated", "Municipal", "Private"]}
              />
              <InputField
                label="View"
                name="view"
                value={form.view}
                onChange={handleInput}
                placeholder="e.g. Park View"
              />
              <InputField
                label="Built In Year"
                name="builtInYear"
                type="number"
                value={form.builtInYear}
                onChange={handleInput}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={Building2} title="Community Amenities" />

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Available Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <CheckboxField
                    label="Community Lawn"
                    name="communityLawn"
                    checked={form.communityLawn === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        communityLawn: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Swimming Pool"
                    name="communityPool"
                    checked={form.communityPool === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        communityPool: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Gym"
                    name="communityGym"
                    checked={form.communityGym === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        communityGym: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Mosque"
                    name="mosque"
                    checked={form.mosque === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        mosque: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Kids Play Area"
                    name="kidsPlayArea"
                    checked={form.kidsPlayArea === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        kidsPlayArea: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Medical Centre"
                    name="medicalCentre"
                    checked={form.medicalCentre === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        medicalCentre: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Day Care"
                    name="dayCare"
                    checked={form.dayCare === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        dayCare: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="BBQ Area"
                    name="bbqArea"
                    checked={form.bbqArea === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        bbqArea: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                  <CheckboxField
                    label="Community Centre"
                    name="communityCentre"
                    checked={form.communityCentre === "Yes"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        communityCentre: e.target.checked ? "Yes" : "No",
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Nearby Facilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nearby Schools"
                    name="nearBySchools"
                    value={form.nearBySchools}
                    onChange={handleInput}
                    placeholder="e.g. ABC School (1 km)"
                  />
                  <InputField
                    label="Nearby Hospitals"
                    name="nearByHospitals"
                    value={form.nearByHospitals}
                    onChange={handleInput}
                    placeholder="e.g. XYZ Hospital (2 km)"
                  />
                  <InputField
                    label="Public Transport"
                    name="nearByPublicTransport"
                    value={form.nearByPublicTransport}
                    onChange={handleInput}
                    placeholder="e.g. Bus Stop (500m)"
                  />
                  <InputField
                    label="Shopping Malls"
                    name="nearByShoppingMalls"
                    value={form.nearByShoppingMalls}
                    onChange={handleInput}
                    placeholder="e.g. Mega Mall (3 km)"
                  />
                  <InputField
                    label="Nearby Colleges"
                    name="nearByColleges"
                    value={form.nearByColleges}
                    onChange={handleInput}
                  />
                  <InputField
                    label="Nearby University"
                    name="nearByUniversity"
                    value={form.nearByUniversity}
                    onChange={handleInput}
                  />
                  <InputField
                    label="Nearby Restaurants"
                    name="nearByRestaurants"
                    value={form.nearByRestaurants}
                    onChange={handleInput}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader
              icon={ImageIcon}
              title="Property Images & Description"
            />

            <div className="space-y-6">
              <InputField
                label="Ad Title *"
                name="adTitle"
                value={form.adTitle}
                onChange={handleInput}
                placeholder="Attractive headline for your property"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Description
                </label>
                <textarea
                  name="adDescription"
                  value={form.adDescription}
                  onChange={handleInput}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Describe your property in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Property Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group border-2 border-gray-200"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      >
                        <X className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all group">
                    <ImageIcon className="w-10 h-10 text-gray-400 group-hover:text-red-500 mb-2" />
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-red-600">
                      {uploading ? "Uploading..." : "Add Image"}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <StepHeader icon={User} title="Contact Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name *"
                name="fullName"
                value={form.fullName}
                onChange={handleInput}
              />
              <InputField
                label="Mobile Number *"
                name="mobile"
                value={form.mobile}
                onChange={handleInput}
              />
              <InputField
                label="Email Address *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInput}
              />
              <InputField
                label="Landline"
                name="landLine"
                value={form.landLine}
                onChange={handleInput}
                placeholder="Optional"
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  name="anyMessage"
                  value={form.anyMessage}
                  onChange={handleInput}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    "Basic Info",
    "Pricing & Location",
    "Features",
    "Amenities",
    "Images & Description",
    "Contact Info",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create New Property
              </h1>
              <p className="text-gray-600">
                Step {step} of 6: {stepTitles[step - 1]}
              </p>
            </div>
            <button
              onClick={() => navigate("/property")}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  step >= i
                    ? "bg-gradient-to-r from-red-600 to-red-700"
                    : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-2xl font-semibold flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
            {error}
          </div>
        )}

        {/* Form Area */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-100">
            <button
              onClick={() =>
                step > 1 ? setStep((s) => s - 1) : navigate("/property")
              }
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              {step === 1 ? "Cancel" : "Previous"}
            </button>

            {step < 6 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? "Creating..." : "Create Property"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StepHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-100">
    <div className="p-3 bg-red-100 rounded-xl">
      <Icon className="w-6 h-6 text-red-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  readOnly = false,
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={`w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
        disabled || readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div
      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
        checked
          ? "bg-red-600 border-red-600"
          : "bg-white border-gray-300 group-hover:border-red-400"
      }`}
    >
      {checked && (
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
    <span
      className={`text-sm font-medium ${
        checked ? "text-gray-900" : "text-gray-600"
      }`}
    >
      {label}
    </span>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="hidden"
    />
  </label>
);

export default CreateProperty;
