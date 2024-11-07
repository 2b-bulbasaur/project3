// components/TransactionChart.tsx

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TransactionData {
  hour: string;
  count: number;
}

const TransactionChart = ({ data }: { data: TransactionData[] }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Map the data into x (hour) and y (count)
    const labels = data.map(item => item.hour);
    const counts = data.map(item => item.count);

    setChartData({
      labels, // X-axis labels (hours)
      datasets: [
        {
          label: 'Transactions Count',
          data: counts, // Y-axis data (counts)
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    });
  }, [data]);

  if (!chartData) return <div>Loading...</div>;

  return (
    <div>
      <h3>Transaction Count by Hour</h3>
      <Line data={chartData} />
    </div>
  );
};

export default TransactionChart;
