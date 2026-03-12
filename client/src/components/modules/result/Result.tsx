import React from 'react';
import { Feather, Sparkles, ArrowRight } from 'lucide-react';

const ComingSoonCard: React.FC = () => {
  return (
          <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        
        {/* Main Card */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Gradient Header */}
          <div className="relative h-48 bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/20 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-20 h-20 border-2 border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
            </div>
            
            {/* Feather Icon */}
            <div className="relative z-10 transform hover:scale-110 transition-transform duration-300">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 shadow-2xl">
                <Feather className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-green-700" />
              <span className="text-sm font-semibold text-green-800">Exciting Update</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Coming Soon!
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              We're crafting something extraordinary for you. Stay tuned for an amazing experience that will transform the way you work.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">Innovative features designed for you</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">Seamless and intuitive experience</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-gray-700">Built with attention to detail</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
              <span>Notify Me</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Footer Text */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Be the first to know when we launch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonCard;