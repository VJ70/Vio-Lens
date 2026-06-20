// VioLens root component
import { AppProvider } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import "./index.css";

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
