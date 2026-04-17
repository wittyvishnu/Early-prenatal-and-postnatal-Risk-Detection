'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Upload, X } from 'lucide-react';
import { CRY_TYPES } from '@/lib/field-config';
import InfoTooltip from './info-tooltip';

export default function BabyCryTab() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'audio/wav' || file.name.endsWith('.wav')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a .wav file');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'audio/wav' || file.name.endsWith('.wav')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a .wav file');
        setSelectedFile(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a .wav file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

      const response = await fetch('http://localhost:5002/predict-baby-cry', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze cry');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the cry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Baby Cry Analysis</CardTitle>
            <InfoTooltip content="Upload a .wav audio file of baby cry to identify the type of cry" />
          </div>
          <CardDescription>
            Analyze audio recordings to classify baby cry patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedFile ? (
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop your audio file here
                </p>
                <p className="mt-1 text-xs text-gray-600">or click to browse</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,audio/wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-3 text-xs text-gray-600">Accepted format: .wav</p>
              </div>
            ) : (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="rounded-lg p-2 hover:bg-blue-200"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              {loading ? 'Analyzing...' : 'Analyze Cry'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-purple-600">Detected Cry Type:</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-2xl font-bold capitalize text-purple-900">
                  {result.prediction}
                </span>
                <div
                  className={`rounded-full px-4 py-2 ${
                    CRY_TYPES[result.prediction]?.color ||
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {CRY_TYPES[result.prediction]?.label || result.prediction}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Confidence Level:</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              {result.prediction === 'discomfort' && (
                <p>
                  The baby is crying due to general discomfort. Check for wet diaper, temperature,
                  or uncomfortable clothing.
                </p>
              )}
              {result.prediction === 'hunger' && (
                <p>The baby is likely hungry. Consider feeding the baby.</p>
              )}
              {result.prediction === 'pain' && (
                <p>
                  The baby appears to be in pain. Consult with a pediatrician if pain persists.
                </p>
              )}
              {result.prediction === 'tired' && (
                <p>The baby is likely tired. Create a calm environment for sleep.</p>
              )}
              {result.prediction === 'normal' && (
                <p>The baby&apos;s cry pattern appears normal and healthy.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
