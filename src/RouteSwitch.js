import { BrowserRouter, Routes, Route} from "react-router-dom";
import Builder from "./Components/Builder"
const RouteSwitch = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Builder />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouteSwitch;