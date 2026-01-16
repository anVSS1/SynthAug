import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

const LegalPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isTerms = location.pathname === '/terms';
  
  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              {isTerms ? <FileText className="text-white" size={24} /> : <Shield className="text-white" size={24} />}
            </div>
            <h1 className="text-4xl font-display font-bold">
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </span>
            </h1>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 text-lg mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">1. Introduction</h2>
                <p>
                  Welcome to SynthAug. By using our AI-powered dataset augmentation service, you agree to these {isTerms ? 'terms' : 'privacy practices'}.
                </p>
              </section>
              
              {isTerms ? (
                <>
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">2. Service Description</h2>
                    <p>
                      SynthAug provides AI-powered dataset augmentation using Projected GAN technology. We process your uploaded datasets to generate synthetic variations for machine learning applications.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">3. User Responsibilities</h2>
                    <p>
                      You are responsible for the content you upload. You must have the rights to use and process all uploaded data. You agree not to upload illegal, harmful, or copyrighted content without permission.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">4. Intellectual Property</h2>
                    <p>
                      You retain all rights to your original data. Generated synthetic data is provided for your use. Our AI models and technology remain our intellectual property.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">5. Limitation of Liability</h2>
                    <p>
                      SynthAug is provided "as is" without warranties. We are not liable for any damages arising from the use of our service or generated data.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">2. Data Collection</h2>
                    <p>
                      We collect account information (email, username) and uploaded datasets. We use this data solely to provide our augmentation service.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">3. Data Usage</h2>
                    <p>
                      Your uploaded datasets are processed by our AI models to generate synthetic variations. We do not use your data to train our models or share it with third parties.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">4. Data Storage</h2>
                    <p>
                      Uploaded data is stored securely during processing and for project history. You can delete your projects and data at any time from your dashboard.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">5. Data Security</h2>
                    <p>
                      We implement industry-standard security measures to protect your data. All data transmission is encrypted. However, no method is 100% secure.
                    </p>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-200 mb-3">6. Your Rights</h2>
                    <p>
                      You have the right to access, modify, or delete your data. Contact us to exercise these rights or for any privacy concerns.
                    </p>
                  </section>
                </>
              )}
              
              <section>
                <h2 className="text-2xl font-semibold text-gray-200 mb-3">{isTerms ? '6' : '7'}. Contact</h2>
                <p>
                  For questions about these {isTerms ? 'terms' : 'policies'}, contact us at: <span className="text-primary-400">legal@synthaug.ai</span>
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;