// Session analytics dashboard container
import MetricCards from "./MetricCards";
import ViolationChart from "./ViolationChart";
import VehicleDonut from "./VehicleDonut";

export default function Dashboard() {
  return (
    <div className="analytics-dashboard" id="analytics-dashboard">
      <MetricCards />
      <div className="charts-row">
        <ViolationChart />
        <VehicleDonut />
      </div>
    </div>
  );
}
