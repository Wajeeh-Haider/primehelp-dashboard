import { useState } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { API_URL, fetcherWithCredentials } from "../../constants"; // Update paths as needed
import Loader from "../common/Loader";

const EarningsDashboard = () => {
  const [filter, setFilter] = useState("1 month"); // Default filter

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    `${API_URL}/admin-dashboard?filter=${filter}`,
    fetcherWithCredentials
  );

  // if (isLoading) return <Loader />;
  if (error) return <div>Error loading data</div>;

  const {
    graphData = [],
    totalBookings = 0,
    canceledBookings = 0,
    expectedEarnings = 0,
    totalEarnings = 0,
    pendingBookings = 0,
  } = data || {};

  // Ensure all graph data is filled with zero values when missing
  const filledGraphData = graphData.length
    ? graphData
    : [
        {
          _id: "No Data",
          totalEarnings: 0,
          expectedEarnings: 0,
          totalBookings: 0,
          canceledBookings: 0,
          pendingBookings: 0,
        },
      ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="text-2xl font-bold mb-4">Earnings Dashboard</h2>

      {/* Filter Buttons */}
      <div className="mb-5">
        {["week", "1 month", "3 months", "6 months", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setFilter(range)}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              background: filter === range ? "#007bff" : "#f0f0f0",
              color: filter === range ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {range}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {/* Summary Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              marginBottom: "20px",
              gap: "20px", // Add spacing between boxes
            }}
          >
            {[
              { title: "Total Bookings", value: totalBookings },
              { title: "Canceled Bookings", value: canceledBookings },
              {
                title: "Expected Earnings",
                value: `$${expectedEarnings.toFixed(2)}`,
              },
              {
                title: "Total Earnings",
                value: `$${totalEarnings.toFixed(2)}`,
              },
              { title: "Pending Bookings", value: pendingBookings },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-white p-4 rounded-md"
                style={{
                  flex: 1, // Ensures equal size
                  minWidth: "150px", // Optional: Minimum size for small screens
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Add subtle shadow for better appearance
                }}
              >
                <h4>{item.title}</h4>
                <p>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Earnings Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filledGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="_id"
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Earnings",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalEarnings"
                stroke="#8884d8"
                strokeWidth={2}
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="expectedEarnings"
                stroke="#82ca9d"
                strokeWidth={2}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-10" />

          {/* Bookings Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filledGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="_id"
                label={{ value: "Date", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Bookings",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalBookings"
                stroke="#8884d8"
                strokeWidth={2}
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="pendingBookings"
                stroke="#82ca9d"
                strokeWidth={2}
                animationDuration={500}
              />
              <Line
                type="monotone"
                dataKey="canceledBookings"
                stroke="#ff0000"
                strokeWidth={2}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default EarningsDashboard;
