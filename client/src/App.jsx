import TextEditor from "./components/TextEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

export default function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" exact element={<Navigate to={`/doc/${uuidV4()}`} />}/>
          <Route path="/doc/:id" element={<TextEditor />}/>
        </Routes>
      </Router>
  );
}