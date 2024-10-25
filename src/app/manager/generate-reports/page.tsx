"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportData {
  hour: string;
  count: number;
}

const GenerateReport: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[] | null>(null);

  const generateXReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/reports/x-report', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate X Report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateZReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/reports/z-report', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Z Report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProductUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/reports/product-usage', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Product Usage Report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/manager')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">Generate Report</h2>
      </div>

      <div className="rounded-lg">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardTitle className="text-center pt-4">Report to Generate</CardTitle>
          <CardContent>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex justify-center items-center gap-4 p-5"
            >
              <Button
                type="button"
                onClick={generateXReport}
                disabled={isLoading}
                className="bg-primary"
              >
                {isLoading ? 'Generating...' : 'X-Report'}
              </Button>
              <Button
                type="button"
                onClick={generateZReport}
                disabled={isLoading}
                className="bg-primary"
              >
                Z-Report
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                className="bg-primary"
              >
                Product Usage Chart
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                className="bg-primary"
              >
                Itemized Sales Report
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Generated Report</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Hour</th>
                      <th className="border p-2 text-left">Transaction Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.hour}</td>
                        <td className="border p-2">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateReport;