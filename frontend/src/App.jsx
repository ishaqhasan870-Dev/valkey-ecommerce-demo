import { BrowserRouter } from "react-router-dom";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import { CommerceApp } from "./commerce/CommerceApp";
import { CommerceProvider } from "./commerce/CommerceContext";
import { ErrorBoundary } from "./commerce/ErrorBoundary";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteScrollToTop />
      <ErrorBoundary>
        <CommerceProvider>
          <CommerceApp />
        </CommerceProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
