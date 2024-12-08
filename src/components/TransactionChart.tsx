import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TransactionData {
  hour: string;
  count: number;
}

type ChartDataType = ChartData<'line', number[], string>;

/**
 * TransactionChart component to render a line chart displaying transaction counts per hour.
 *
 * This component uses Chart.js (via react-chartjs-2) to visualize the number of transactions
 * occurring each hour. The input `data` prop should contain an array of objects with `hour`
 * and `count` properties.
 *
 * @param {Object} props - The component props.
 * @param {TransactionData[]} props.data - Array of transaction data objects containing hour and count values.
 * @returns {JSX.Element} A line chart displaying transaction counts by hour.
 */
const TransactionChart = ({ data }: { data: TransactionData[] }) => {
  const [chartData, setChartData] = useState<ChartDataType | null>(null);

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

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Transaction Count by Hour',
      },
    },
  };

  return (
    <div>
      <h3>Transaction Count by Hour</h3>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TransactionChart;