import React, { useState } from "react";
import axios from "axios";

function Upload() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [probability, setProbability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageRotation, setImageRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is a valid image type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setError("Unknown image format. Please upload a valid image (PNG, JPG, GIF, or WebP).");
      setImage(null);
      setPreviewUrl(null);
      setResult(null);
      setProbability(null);
      return;
    }

    // Check file size (max 5MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`);
      setImage(null);
      setPreviewUrl(null);
      setResult(null);
      setProbability(null);
      return;
    }

    setImage(file);
    setResult(null);
    setProbability(null);
    setError(null);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!validImageTypes.includes(file.type)) {
        setError("Unknown image format. Please upload a valid image (PNG, JPG, GIF, or WebP).");
        setImage(null);
        setPreviewUrl(null);
        return;
      }

      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`);
        setImage(null);
        setPreviewUrl(null);
        return;
      }

      setImage(file);
      setResult(null);
      setProbability(null);
      setError(null);
      setUploadProgress(0);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProbability(null);

    try {
      const formData = new FormData();
      formData.append("file", image);

      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        setUploadProgress(progress);
      }, 100);

      // TODO: Change this URL if your backend runs on a different host/port
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Backend (Flask) returns: { disease: "MEASLES" | "RUBELLA" | "UNCERTAIN", confidence: 87.5 }
      const { disease, confidence } = response.data;
      setResult(disease);
      const conf = typeof confidence === "number" ? confidence / 100 : null;
      setProbability(conf);
      saveToHistory(disease, conf);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing the image.");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultText = () => {
    if (!result) return "";
    const r = result.toUpperCase();
    if (r === "RUBELLA") return "Rubella detected";
    if (r === "MEASLES") return "Measles detected";
    if (r === "UNCERTAIN") return "Not sure (borderline between Rubella / Measles)";
    return result;
  };

  const getResultColor = () => {
    if (!result) return "bg-gray-100 text-gray-800";
    const r = result.toUpperCase();
    if (r === "RUBELLA") return "bg-red-100 text-red-700 border-red-300";
    if (r === "MEASLES") return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  // returns an object with extra interpretation based on current result and probability
  const getImageSpecificAnalysis = () => {
    if (!result || probability === null) return null;

    const confidenceLevel = probability * 100;
    const r = result.toUpperCase();

    let analysis = {
      imageObservations: [],
      confidenceMessage: "",
      recommendedAction: "",
      urgencyLevel: ""
    };

    // Determine confidence message and urgency
    if (confidenceLevel >= 85) {
      analysis.confidenceMessage = "High confidence match found";
      analysis.urgencyLevel = "🔴 High";
      analysis.recommendedAction = "Seek medical attention soon";
    } else if (confidenceLevel >= 70) {
      analysis.confidenceMessage = "Good confidence match detected";
      analysis.urgencyLevel = "🟠 Moderate";
      analysis.recommendedAction = "Schedule a doctor's appointment";
    } else if (confidenceLevel >= 50) {
      analysis.confidenceMessage = "Possible match with lower confidence";
      analysis.urgencyLevel = "🟡 Low-Moderate";
      analysis.recommendedAction = "Monitor symptoms and consult if worsens";
    } else {
      analysis.confidenceMessage = "Weak match - additional evaluation needed";
      analysis.urgencyLevel = "🟢 Requires specialist review";
      analysis.recommendedAction = "Professional medical examination recommended";
    }

    // Simple observations based on disease
    if (r === "RUBELLA") {
      analysis.imageObservations = ["Rash pattern consistent with Rubella"];
      analysis.specificNote = `This image shows signs of Rubella.`;
    } 
    else if (r === "MEASLES") {
      analysis.imageObservations = ["Characteristic rash identified"];
      analysis.specificNote = `This image displays indicators of Measles.`;
    } 
    else if (r === "UNCERTAIN") {
      analysis.imageObservations = ["Rash characteristics are ambiguous"];
      analysis.specificNote = `This image shows mixed characteristics.`;
    }

    return analysis;
  };

  const getDiseaseInfo = () => {
    if (!result) return null;
    const r = result.toUpperCase();
    const info = {
      RUBELLA: {
        name: "Rubella (German Measles)",
        symptoms: "Pink/red rash, fever, swollen lymph nodes",
        description: "A mild viral infection with pink rash",
        note: "Usually milder than measles"
      },
      MEASLES: {
        name: "Measles (Rubeola)",
        symptoms: "Bright red rash, high fever, cough",
        description: "A highly contagious viral infection",
        note: "More severe than rubella"
      },
      UNCERTAIN: {
        name: "Analysis Uncertain",
        symptoms: "Borderline characteristics detected",
        description: "Cannot determine disease type",
        note: "Consult medical professional"
      },
    };
    return info[r] || null;
  };

  const rotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // derive analysis object so eslint knows the function is used
  const imageAnalysis = getImageSpecificAnalysis();

  const resetImage = () => {
    setImageRotation(0);
    setZoomLevel(1);
  };

  const exportResults = () => {
    if (!result) return;
    const diseaseInfo = getDiseaseInfo();
    const text = `Disease Analysis Report
Date: ${new Date().toLocaleString()}
Detected Disease: ${result.toUpperCase()}
Confidence: ${(probability * 100).toFixed(1)}%
Description: ${diseaseInfo?.description || "No description available"}
Symptoms: ${diseaseInfo?.symptoms || "No symptoms listed"}
Note: ${diseaseInfo?.note || "Please consult a medical professional"}

This report is for educational purposes only.
Always consult a medical professional for accurate diagnosis.`;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", `skin_analysis_${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveToHistory = (disease, conf) => {
    const entry = {
      id: Date.now(),
      disease,
      confidence: conf,
      timestamp: new Date().toLocaleString(),
      imageName: image?.name || "Unknown",
    };
    setAnalysisHistory((prev) => [entry, ...prev].slice(0, 10));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all analysis history?")) {
      setAnalysisHistory([]);
      setShowHistory(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload a skin lesion image
          </label>

          <div 
            className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
              isDragging 
                ? "border-blue-500 bg-blue-50 scale-105" 
                : "border-gray-300 bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8a4 4 0 01-4 4H12m24-24h-8m8 0v8m0-8L24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 px-2"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG max 5MB dhan</p>
              {image && (
                <p className="text-xs text-gray-700 mt-1">
                  Selected: <span className="font-medium">{image.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Preview</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rotateImage}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  title="Rotate image"
                >
                  🔄 Rotate
                </button>
                <button
                  type="button"
                  onClick={resetImage}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  title="Reset image"
                >
                  ↺ Reset
                </button>
              </div>
            </div>
            <div className="w-full h-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center relative">
              <div className="flex gap-2 absolute top-2 right-2 z-10">
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                  className="bg-white hover:bg-gray-100 rounded px-2 py-1 text-sm border"
                  title="Zoom out"
                >
                  −
                </button>
                <span className="bg-white px-2 py-1 text-xs border rounded min-w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
                  className="bg-white hover:bg-gray-100 rounded px-2 py-1 text-sm border"
                  title="Zoom in"
                >
                  +
                </button>
              </div>
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="object-contain hover:scale-105 transition-transform duration-300"
                style={{
                  transform: `rotate(${imageRotation}deg) scale(${zoomLevel})`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {image && (
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
                setResult(null);
                setProbability(null);
                setError(null);
                setUploadProgress(0);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !image}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
              isLoading || !image
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105 active:scale-95"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      </form>

      {(result || error) && (
        <div className="mt-6 animate-fade-in">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div
              className={`mt-3 rounded-lg border px-4 py-3 text-sm font-medium animate-pulse-once ${getResultColor()}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-bold">{getResultText()}</p>
                <button
                  onClick={exportResults}
                  className="text-xs bg-white bg-opacity-50 hover:bg-opacity-100 px-3 py-1 rounded transition-all"
                  title="Download report"
                >
                   Download
                </button>
              </div>

              {typeof probability === "number" && (
                <div>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs opacity-80">Confidence</span>
                        <span className="font-bold">{(probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${probability * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-current">
                      <div className="text-center">
                        <div className="text-lg font-bold">{Math.round(probability * 100)}</div>
                        <div className="text-xs opacity-75">%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {getDiseaseInfo() && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-xs font-semibold mb-1">ℹ️ About this disease:</p>
                  <p className="text-xs opacity-80">{getDiseaseInfo().description}</p>
                  <p className="text-xs opacity-80 mt-1"><strong>Symptoms:</strong> {getDiseaseInfo().symptoms}</p>
                  <p className="text-xs italic opacity-70 mt-1">Note: {getDiseaseInfo().note}</p>
                </div>
              )}

              {imageAnalysis && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20 text-xs space-y-2">
                  <p className="font-semibold">🔍 Image-specific analysis:</p>
                  <p>{imageAnalysis.confidenceMessage} ({imageAnalysis.urgencyLevel})</p>
                  <ul className="list-disc list-inside">
                    {imageAnalysis.imageObservations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                  <p className="italic">{imageAnalysis.recommendedAction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {analysisHistory.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
               Analysis History ({analysisHistory.length})
              <span className="text-xs">{showHistory ? "▼" : "▶"}</span>
            </button>
            <button
              onClick={clearHistory}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
              title="Clear all history"
            >
               Clear
            </button>
          </div>

          {showHistory && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {analysisHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-700">{entry.disease}</p>
                      <p className="text-gray-500">{entry.imageName}</p>
                      <p className="text-gray-400 text-xs mt-1">{entry.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{(entry.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && uploadProgress > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading & Analyzing</span>
            <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;