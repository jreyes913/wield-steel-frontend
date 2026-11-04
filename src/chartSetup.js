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
import { formatWeight } from "./formHelpers.js";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

// Chart.js draws on a canvas, so it can't read our CSS variables. Read the brand
// colours once here and hand them over, so the charts match the dark theme.
const css = getComputedStyle(document.documentElement);
const color = (name) => css.getPropertyValue(name).trim();

Chart.defaults.color = color("--dark-medium"); // axis labels and legend
Chart.defaults.borderColor = color("--dark-disabled") + "99"; // grid lines, quieter than a table border
Chart.defaults.font.family = color("--font-body");
Chart.defaults.font.size = 13; // Chart.js sizes are pixels; this is --text-label
Chart.defaults.elements.line.borderColor = color("--chart-line");
Chart.defaults.elements.line.backgroundColor = color("--chart-line");
Chart.defaults.elements.point.pointStyle = "rect"; // square points, like everything else
Chart.defaults.plugins.tooltip.cornerRadius = 0;

// Tooltip: a boxed panel like the rest of the app, with figures trimmed like the tables.
const tooltip = Chart.defaults.plugins.tooltip;
tooltip.backgroundColor = color("--dark-background");
tooltip.borderColor = color("--dark-disabled");
tooltip.borderWidth = 1;
tooltip.titleColor = color("--dark-neutral");
tooltip.bodyColor = color("--dark-medium");
tooltip.padding = 12;
tooltip.displayColors = false;
tooltip.callbacks.label = (item) => `${item.dataset.label}: ${formatWeight(item.parsed.y)}`;

Chart.defaults.plugins.legend.labels.boxWidth = 12; // square swatch
Chart.defaults.scale.ticks.maxTicksLimit = 8; // keeps dates from colliding on a phone
