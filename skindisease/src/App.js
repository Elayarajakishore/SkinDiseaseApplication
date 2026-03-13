import React from "react";
import Upload from "./components/Upload";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 card-enter border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-2xl mr-0 md:mr-6 mb-4 md:mb-0 float-animation shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Skin Disease Detection
              </h1>
              <p className="text-lg text-gray-600"> For Measles & Rubella</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-2 rounded-xl stats-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold mb-1">99%</div>
              <div className="text-sm opacity-90 font-medium">Accuracy Rate</div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-2 rounded-xl stats-card shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold mb-1">2</div>
              <div className="text-sm opacity-90 font-medium">Disease Types</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-2 rounded-xl stats-card shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm opacity-90 font-medium">Available</div>
            </div>
          </div>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden upload-card border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload & Analyze Image
            </h2>
            <p className="text-blue-100 mt-2 text-sm">Secure AI-powered skin disease detection</p>
          </div>
          <div className="p-8">
            <Upload />
          </div>
        </div>

        {/* Footer Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 footer-card border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">Secure & Private</span>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">Fast Results</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-yellow-800 font-medium">
                  This tool is for educational purposes only. Always consult a medical professional for accurate diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;