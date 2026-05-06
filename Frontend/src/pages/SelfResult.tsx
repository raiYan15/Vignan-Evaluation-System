import { Link } from "react-router-dom";
import BatchResultsDisplay from "./BatchResultsDisplay";

export default function SelfResult() {
  return (
    <div className="space-y-4">
      <div className="page-header">
        <h1 className="page-title">Self Result</h1>
        <p className="page-subtitle">Your evaluated scripts, marks, confidence, and feedback</p>
      </div>
      <div className="flex justify-end">
        <Link to="/results?scope=self" className="text-sm text-primary font-medium">Open professional batch results view →</Link>
      </div>
      <BatchResultsDisplay scope="self" />
    </div>
  );
}
