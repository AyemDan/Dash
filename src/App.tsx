import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css"
import { appRoutes } from "./router";

const router = createBrowserRouter([...appRoutes]);

const App = () => {
  return (
    <main className="leading-normal">
      <RouterProvider router={router} />
    </main>
  )
};

export default App;