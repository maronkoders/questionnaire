import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    consent: '',
    age: '',
    gender: '',
    jobTitle: '',
    experience: '',
    careerSatisfaction: '',
    selfAwareness: '',
    selfManagement: '',
    socialAwareness: '',
    relationshipManagement: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Please connect to Supabase first');
      return;
    }
    
    const { error } = await supabase
      .from('survey_responses')
      .insert([formData]);
    
    if (error) {
      alert('Error submitting response');
    } else {
      alert('Thank you for your response!');
      setStep(1);
      setFormData({
        consent: '',
        age: '',
        gender: '',
        jobTitle: '',
        experience: '',
        careerSatisfaction: '',
        selfAwareness: '',
        selfManagement: '',
        socialAwareness: '',
        relationshipManagement: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Supabase Connection Required</h1>
          <p className="mb-4">Please click the "Connect to Supabase" button in the top right corner to set up your Supabase project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-8">Emotional Intelligence and Career Success Survey</h1>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Consent</h2>
              <div className="mb-6">
                <label className="block mb-2">
                  <input
                    type="radio"
                    name="consent"
                    value="yes"
                    onChange={handleChange}
                    required
                    className="mr-2"
                  />
                  I consent to participate in this survey
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="consent"
                    value="no"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  I do not consent
                </label>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={formData.consent !== 'yes'}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Biographical Data</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer-not-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">EI Assessment</h2>
              <div className="space-y-6">
                {['Career Satisfaction', 'Self Awareness', 'Self Management', 'Social Awareness', 'Relationship Management'].map((category) => (
                  <div key={category}>
                    <label className="block mb-2">{category}</label>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Strongly Disagree</span>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className="flex flex-col items-center">
                          <input
                            type="radio"
                            name={category.toLowerCase().replace(' ', '')}
                            value={value}
                            onChange={handleChange}
                            required
                            className="mb-1"
                          />
                          {value}
                        </label>
                      ))}
                      <span className="text-sm">Strongly Agree</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;