'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Baby, Volume2 } from 'lucide-react';
import FetalHealthTab from './fetal-health-tab';
import InfantHealthTab from './infant-health-tab';
import BabyCryTab from './baby-cry-tab';

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('fetal');

  return (
    <div className="w-full">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Early prenatal and postnatal Risk Detection</h1>
        <p className="text-gray-600">
          AI-powered assessment tools for fetal and infant health monitoring
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 border border-gray-200">
          <TabsTrigger value="fetal" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Fetal Health</span>
            <span className="sm:hidden">Fetal</span>
          </TabsTrigger>
          <TabsTrigger value="infant" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Baby className="h-4 w-4" />
            <span className="hidden sm:inline">Infant Health</span>
            <span className="sm:hidden">Infant</span>
          </TabsTrigger>
          <TabsTrigger value="cry" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
            <Volume2 className="h-4 w-4" />
            <span className="hidden sm:inline">Cry Analysis</span>
            <span className="sm:hidden">Cry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fetal" className="mt-6">
          <FetalHealthTab />
        </TabsContent>

        <TabsContent value="infant" className="mt-6">
          <InfantHealthTab />
        </TabsContent>

        <TabsContent value="cry" className="mt-6">
          <BabyCryTab />
        </TabsContent>
      </Tabs>

      <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">About This Tool</h3>
        <p className="mt-2 text-sm text-gray-700">
          This is a comprehensive AI-powered assessment platform for early infant risk detection,
          combining multiple diagnostic modalities:
        </p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
              1
            </span>
            <span className="text-gray-700">
              <strong>Fetal Health Check:</strong> Analyzes cardiotocography (CTG) parameters to
              assess fetal well-being during pregnancy
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
              2
            </span>
            <span className="text-gray-700">
              <strong>Infant Health Check:</strong> Evaluates clinical findings to identify
              congenital heart diseases and pulmonary conditions
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
              3
            </span>
            <span className="text-gray-700">
              <strong>Baby Cry Analysis:</strong> Uses CNN-based deep learning to classify cry
              patterns and identify infant distress types
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
