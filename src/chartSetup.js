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

// Chart.js draws on a canvas, so it can't read our CSS variables. Read the brand
// colours once here and hand them over, so the charts match the dark theme.
const css = getComputedStyle(document.documentElement);
const color = (name) => css.getPropertyValue(name).trim();

Chart.defaults.color = color("--dark-medium"); // axis labels and legend
Chart.defaults.borderColor = color("--dark-disabled"); // grid lines
Chart.defaults.font.family = color("--font-body");
Chart.defaults.elements.line.borderColor = color("--dark-primary");
Chart.defaults.elements.line.backgroundColor = color("--dark-primary");
Chart.defaults.elements.point.pointStyle = "rect"; // square points, like everything else
Chart.defaults.plugins.tooltip.cornerRadius = 0;
