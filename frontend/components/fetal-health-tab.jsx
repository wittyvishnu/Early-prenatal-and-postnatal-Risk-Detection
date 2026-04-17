'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Info } from 'lucide-react';
import StatusBadge from './status-badge';
import InfoTooltip from './info-tooltip';

const STATUS_MAP = {
  NORMAL: 0,
  SUSPECT: 1,
  PATHOLOGICAL: 2,
};

const FIELD_DESCRIPTIONS = {
  baseline: 'The average resting heart rate shown on the monitor',
  fetal_movements: 'How many times the baby kicked in 10 minutes',
  uterine_contractions: 'How many contractions happened in 10 minutes',
  light_decelerations: 'Minor drops in heart rate observed',
  severe_decelerations: 'Deep, sudden drops in heart rate observed',
  prolonged_decelerations: 'Drops lasting more than 2 minutes',
  abnormal_short_term_variability: 'Percentage of time the line looked "flat" (ASTV)',
  mean_short_term_variability: 'The average "jitter" size (MSTV) from the machine',
};

// Helper function to calculate mode
function calculateMode(arr) {
  const counts = {};
  arr.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1;
  });
  let maxCount = 0;
  let mode = arr[0];
  Object.entries(counts).forEach(([val, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mode = parseFloat(val);
    }
  });
  return mode;
}

// Helper function to calculate median
function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export default function FetalHealthTab() {
  const [formData, setFormData] = useState({
    baseline: '',
    fetal_movements: '',
    uterine_contractions: '',
    light_decelerations: '',
    severe_decelerations: '',
    prolonged_decelerations: '',
    abnormal_short_term_variability: '',
    mean_short_term_variability: '',
    minute_bpm: ['', '', '', '', '', '', '', '', '', ''],
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value),
    }));
  };

  const handleMinuteBpmChange = (index, value) => {
    const newMinuteBpm = [...formData.minute_bpm];
    newMinuteBpm[index] = value === '' ? '' : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      minute_bpm: newMinuteBpm,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate all fields
    const required = [
      'baseline',
      'fetal_movements',
      'uterine_contractions',
      'light_decelerations',
      'severe_decelerations',
      'prolonged_decelerations',
      'abnormal_short_term_variability',
      'mean_short_term_variability',
    ];

    for (const field of required) {
      if (formData[field] === '' || formData[field] === null) {
        setError(`Please fill in ${field.replace(/_/g, ' ')}`);
        return;
      }
    }

    if (formData.minute_bpm.some((val) => val === '' || val === null)) {
      setError('Please fill in all 10 minute BPM values');
      return;
    }

    // Calculate rates (divide by 600 seconds for 10-minute window)
    const fetalMov = formData.fetal_movements / 600;
    const contractions = formData.uterine_contractions / 600;
    const lightDec = formData.light_decelerations / 600;
    const severeDec = formData.severe_decelerations / 600;
    const prolongDec = formData.prolonged_decelerations / 600;

    // Calculate histogram stats from minute BPM values
    const minuteBpmNumbers = formData.minute_bpm.map((val) => parseFloat(val));
    const histMean =
      minuteBpmNumbers.reduce((sum, val) => sum + val, 0) / minuteBpmNumbers.length;
    const histMedian = calculateMedian(minuteBpmNumbers);
    const histMode = calculateMode(minuteBpmNumbers);

    // Build features array in exact order
    const features = [
      formData.baseline,
      fetalMov,
      contractions,
      lightDec,
      severeDec,
      prolongDec,
      formData.abnormal_short_term_variability,
      formData.mean_short_term_variability,
      histMode,
      histMean,
      histMedian,
    ];

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/predict-fetal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching the prediction');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (prediction) => {
    if (prediction === 1) return 'NORMAL';
    if (prediction === 2) return 'SUSPECT';
    if (prediction === 3) return 'PATHOLOGICAL';
    return 'UNKNOWN';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Fetal Health Assessment (CTG)</CardTitle>
            <InfoTooltip content="Enter Cardiotocography (CTG) parameters from the fetal monitor to assess fetal health status" />
          </div>
          <CardDescription>
            Provide cardiotocography measurements for fetal monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Parameters */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Basic Parameters</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Baseline Heart Rate (BPM)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.baseline} />
                  </div>
                  <Input
                    type="number"
                    name="baseline"
                    value={formData.baseline}
                    onChange={handleInputChange}
                    placeholder="120"
                    step="0.1"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Total Fetal Movements (Count)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.fetal_movements} />
                  </div>
                  <Input
                    type="number"
                    name="fetal_movements"
                    value={formData.fetal_movements}
                    onChange={handleInputChange}
                    placeholder="5"
                    step="1"
                    min="0"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Total Uterine Contractions (Count)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.uterine_contractions} />
                  </div>
                  <Input
                    type="number"
                    name="uterine_contractions"
                    value={formData.uterine_contractions}
                    onChange={handleInputChange}
                    placeholder="3"
                    step="1"
                    min="0"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Light Decelerations (Count)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.light_decelerations} />
                  </div>
                  <Input
                    type="number"
                    name="light_decelerations"
                    value={formData.light_decelerations}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="1"
                    min="0"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Severe Decelerations (Count)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.severe_decelerations} />
                  </div>
                  <Input
                    type="number"
                    name="severe_decelerations"
                    value={formData.severe_decelerations}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="1"
                    min="0"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Prolonged Decelerations (Count)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.prolonged_decelerations} />
                  </div>
                  <Input
                    type="number"
                    name="prolonged_decelerations"
                    value={formData.prolonged_decelerations}
                    onChange={handleInputChange}
                    placeholder="0"
                    step="1"
                    min="0"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Abnormal Short-Term Variability (%)</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.abnormal_short_term_variability} />
                  </div>
                  <Input
                    type="number"
                    name="abnormal_short_term_variability"
                    value={formData.abnormal_short_term_variability}
                    onChange={handleInputChange}
                    placeholder="20"
                    step="0.1"
                    min="0"
                    max="100"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Mean Short-Term Variability</label>
                    <InfoTooltip content={FIELD_DESCRIPTIONS.mean_short_term_variability} />
                  </div>
                  <Input
                    type="number"
                    name="mean_short_term_variability"
                    value={formData.mean_short_term_variability}
                    onChange={handleInputChange}
                    placeholder="5.0"
                    step="0.1"
                    className="border-gray-300 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Minute-by-Minute BPM */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Minute-by-Minute BPM (10 Values)</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                {formData.minute_bpm.map((value, index) => (
                  <div key={index} className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Minute {index + 1}</label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleMinuteBpmChange(index, e.target.value)}
                      placeholder="120"
                      step="1"
                      className="border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-600">
                These values are used to calculate mean, median, and mode of heart rate patterns
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              {loading ? 'Analyzing...' : 'Analyze CTG Data'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Fetal Health Assessment Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <span className="font-medium">Fetal Health Status:</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={getStatusLabel(result.prediction)} />
                <span className="text-sm text-gray-600">({result.status})</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              {result.prediction === 0 && (
                <p>The fetus appears healthy with normal CTG parameters. Continue routine monitoring.</p>
              )}
              {result.prediction === 1 && (
                <p>
                  The fetus requires further monitoring. Some CTG parameters suggest potential concerns
                  that need clinical review and continued surveillance.
                </p>
              )}
              {result.prediction === 2 && (
                <p>
                  Critical findings detected. Immediate clinical intervention and specialist consultation
                  recommended. Consider urgent delivery if appropriate.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
