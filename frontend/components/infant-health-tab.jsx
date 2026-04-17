'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';
import { INFANT_FIELDS, INFANT_CONDITIONS } from '@/lib/field-config';
import InfoTooltip from './info-tooltip';
import ProbabilityChart from './probability-chart';
import SelectField from './select-field';

export default function InfantHealthTab() {
  const [formData, setFormData] = useState({
    BirthAsphyxia: '',
    HypDistrib: '',
    HypoxiaInO2: '',
    CO2: '',
    ChestXray: '',
    Grunting: '',
    LVHreport: '',
    LowerBodyO2: '',
    RUQO2: '',
    CO2Report: '',
    XrayReport: '',
    GruntingReport: '',
    Age: '',
    LVH: '',
    DuctFlow: '',
    CardiacMixing: '',
    LungParench: '',
    LungFlow: '',
    Sick: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const allFilled = Object.values(formData).every((val) => val !== '');
    if (!allFilled) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5001/predict-infant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Infant Health Assessment</CardTitle>
            <InfoTooltip content="Evaluate clinical parameters to identify cardiac and pulmonary conditions in infants" />
          </div>
          <CardDescription>
            Select clinical findings from the infant examination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(INFANT_FIELDS).map(([key, field]) => (
                <SelectField
                  key={key}
                  name={key}
                  label={field.label}
                  options={field.options}
                  value={formData[key]}
                  onChange={(value) => handleChange(key, value)}
                  info={field.info}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
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
              {loading ? 'Analyzing...' : 'Predict Condition'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-600">Primary Prediction:</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-700">{result.prediction}</span>
                <span className="text-sm text-blue-600">
                  {INFANT_CONDITIONS[result.prediction] || result.prediction}
                </span>
              </div>
            </div>

            {result.probabilities_percent && (
              <div className="space-y-4">
                <p className="font-semibold text-gray-900">Confidence by Condition:</p>
                <ProbabilityChart data={result.probabilities_percent} />

                <div className="grid gap-2">
                  {Object.entries(result.probabilities_percent)
                    .sort(([, a], [, b]) => b - a)
                    .map(([condition, probability]) => (
                      <div
                        key={condition}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <span className="text-sm text-gray-700">{condition}</span>
                        <span className="font-semibold text-blue-600">{probability.toFixed(2)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              Clinical assessment shows{' '}
              <span className="font-semibold text-blue-700">{result.prediction}</span> as the
              primary suspected condition. Cross-reference with clinical findings and consult
              pediatric specialist.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
