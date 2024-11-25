"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler  
);

interface ReportData {
  hour: string;
  count: number;
}

interface ProductUsageData {
  ingredient: string;
  count: number;
}

interface SalesData {
  item: string;
  count: number;
}

const GenerateReport: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingX, setIsLoadingX] = useState(false);
  const [isLoadingZ, setIsLoadingZ] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [productUsageData, setProductUsageData] = useState<ProductUsageData[] | null>(null);
  const [salesData, setSalesData] = useState<SalesData[] | null>(null);
  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [xReportData, setXReportData] = useState<ReportData[] | null>(null);
  const [zReportData, setZReportData] = useState<ReportData[] | null>(null);

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Report Visualization',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        },
        ticks: {
          stepSize: 1,
          callback: function(tickValue: string | number) {
            if (typeof tickValue === 'number' && Math.floor(tickValue) === tickValue) {
              return tickValue;
            }
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Category'
        }
      }
    }
  };

  const updateChartData = (
    data: ReportData[] | ProductUsageData[] | SalesData[] | null, 
    type: 'x' | 'z' | 'product' | 'sales'
  ) => {
    if (!data) return;

    let labels: string[] = [];
    let values: number[] = [];
    let chartTitle = '';
    let yAxisLabel = '';
    let chartColor = '';

    switch (type) {
      case 'x':
        labels = (data as ReportData[]).map(item => item.hour);
        values = (data as ReportData[]).map(item => item.count);
        chartTitle = 'X Report Transactions';
        yAxisLabel = 'Number of Transactions';
        chartColor = 'rgba(75, 192, 192, 1)';
        setChartType('line');
        break;
      case 'z':
        labels = (data as ReportData[]).map(item => item.hour);
        values = (data as ReportData[]).map(item => item.count);
        chartTitle = 'Z Report Transactions';
        yAxisLabel = 'Number of Transactions';
        chartColor = 'rgba(255, 99, 132, 1)';
        setChartType('line');
        break;
      case 'product':
        labels = (data as ProductUsageData[]).map(item => item.ingredient);
        values = (data as ProductUsageData[]).map(item => item.count);
        chartTitle = 'Product Usage Report';
        yAxisLabel = 'Usage Count';
        chartColor = 'rgba(153, 102, 255, 1)';
        setChartType('bar');
        break;
      case 'sales':
        labels = (data as SalesData[]).map(item => item.item);
        values = (data as SalesData[]).map(item => item.count);
        chartTitle = 'Sales Report';
        yAxisLabel = 'Sales Count';
        chartColor = 'rgba(255, 159, 64, 1)';
        setChartType('bar');
        break;
    }

    const newChartOptions = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          ...chartOptions.plugins.title,
          text: chartTitle,
        },
      },
      scales: {
        ...chartOptions.scales,
        y: {
          ...chartOptions.scales.y,
          title: {
            ...chartOptions.scales.y.title,
            text: yAxisLabel,
          },
        },
      },
    };

    const backgroundColor = chartColor.replace('1)', '0.2)');

    setChartData({
      labels,
      datasets: [{
        label: chartTitle,
        data: values,
        borderColor: chartColor,
        backgroundColor: backgroundColor,
        fill: true,
        tension: 0.4,
        pointRadius: chartType === 'line' ? 4 : 0,
        pointBackgroundColor: chartColor,
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      }],
    });
  };


  const resetReport = () => {
    setReportData(null);
    setShowForm1(false);
    setShowForm2(false);
    setProductUsageData(null);
    setSalesData(null);
    setInput1('');
    setInput2('');
    setError(null);
  };

  const resetGraphData = () => {
    setXReportData(null);
    setZReportData(null);
    setChartData(null);
  };

  const handleProductUsageClick1 = () => {
    resetGraphData();
    resetReport();
    setShowForm1(true);
  };

  const handleProductUsageClick2 = () => {
    resetGraphData();
    resetReport();
    setShowForm2(true);
  }

  const generateXReport = async () => {
    try {
      resetGraphData();
      setIsLoadingX(true);
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
      setXReportData(data);
      updateChartData(data, 'x');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoadingX(false);
    }
  };

  const generateZReport = async () => {
    try {
      resetGraphData();
      setIsLoadingZ(true);
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
      setZReportData(data);
      updateChartData(data, 'z');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      // console.error('Error generating report:', err);
    } finally {
      setIsLoadingZ(false);
    }
  };


  const generateProductUsage = async () => {
    try {
      setIsLoadingProduct(true);
      setError(null);

      const response = await fetch('/api/reports/product-usage', {
        method: 'POST',
        body: JSON.stringify({ input1, input2 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Product Usage Report');
      }

      const data = await response.json();
      setProductUsageData(data);
      updateChartData(data, 'product');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const generateSalesReport = async () => {
    try {
      setIsLoadingSales(true);
      setError(null);

      const response = await fetch('/api/reports/sales-report', {
        method: 'POST',
        body: JSON.stringify({ input1, input2 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate Sales Report');
      }

      const data = await response.json();
      setSalesData(data);
      updateChartData(data, 'sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setIsLoadingSales(false);
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
                onClick={() => { resetReport(); generateXReport(); }}
                disabled={isLoadingX}
                className="bg-primary"
              >
                {isLoadingX ? 'Generating...' : 'X-Report'}
              </Button>
              <Button
                type="button"
                onClick={() => { resetReport(); generateZReport();}}
                disabled={isLoadingZ}
                className="bg-primary"
              >
                {isLoadingZ ? 'Generating...' : 'Z-Report'}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => { resetReport(); handleProductUsageClick1(); }}
                    >
                      {isLoadingProduct ? 'Generating...' : 'Product Usage Report'}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enter Time Range</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={() => {resetReport(); generateProductUsage();}} className="flex flex-col space-y-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        >
                          {input1 ? format(input1, "PPP") : <span>Click to Select a Start Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={input1 ? new Date(input1) : undefined}
                          onSelect={(day) => setInput1(day ? day.toISOString() : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        >
                          {input2 ? format(input2, "PPP") : <span>Click to Select End Date</span>} 
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={input2 ? new Date(input2) : undefined}
                          onSelect={(day) => setInput2(day ? day.toISOString() : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <DialogClose asChild>
                      <Button type="submit" className="bg-primary">
                        Generate Report
                      </Button>
                    </DialogClose>
                  </form>
                </DialogContent>
                
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => { resetReport(); handleProductUsageClick2(); }}
                    >
                      {isLoadingSales ? 'Generating...' : 'Itemized Sales Report'}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enter Time Range</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={() => {resetReport(); generateSalesReport();}} className="flex flex-col space-y-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        >
                          {input1 ? format(input1, "PPP") : <span>Click to Select a Start Date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={input1 ? new Date(input1) : undefined}
                          onSelect={(day) => setInput1(day ? day.toISOString() : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        >
                          {input2 ? format(input2, "PPP") : <span>Click to Select End Date</span>} 
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={input2 ? new Date(input2) : undefined}
                          onSelect={(day) => setInput2(day ? day.toISOString() : '')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <DialogClose asChild>
                      <Button type="submit" className="bg-primary">
                        Generate Report
                      </Button>
                    </DialogClose>
                  </form>
                </DialogContent>
                
              </Dialog>
            </form>
          </CardContent>
        </Card>

        {chartData && (
        <div className="flex justify-center w-full mb-6">
          <Card className="w-full max-w-5xl">
            <CardHeader>
              <CardTitle className="text-center">Report Visualization</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full">
                {chartType === 'line' ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

            {productUsageData && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Ingredient</th>
                      <th className="border p-2 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productUsageData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.ingredient}</td>
                        <td className="border p-2">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {salesData && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Item</th>
                      <th className="border p-2 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((item, index) => (
                      <tr key={index}>
                        <td className="border p-2">{item.item}</td>
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