// Chart.js only draws the parts you register, to keep the bundle small.
// Importing this file once (from each chart component) registers what our line charts need.

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);
