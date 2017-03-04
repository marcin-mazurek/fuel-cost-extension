const DRIVING_ICON_SELECTOR = '.section-directions-trip-travel-mode-icon.drive';
const DISTANCES_SELECTOR = '.section-directions-trip-distance > div:first-of-type';

// TODO: set as configurable
const FUEL_USAGE_PER_100_KM = 7;
const FUEL_PRICE = 4.69;
const CURRENCY = 'PLN';

function observeChildChanges(container, onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(container, { childList: true });
  return observer;
}

function getDrivingTravelPlanContainer() {
  const drivingIcon = document.querySelector(DRIVING_ICON_SELECTOR);

  if (drivingIcon) {
    return drivingIcon.parentNode.parentNode;
  } else {
    return null;
  }
}

function injectFuelEstimate(plan) {
  const distances = plan.querySelectorAll(DISTANCES_SELECTOR);

  distances.forEach(distance => {
    const parsedDistance = parseFloat(distance.textContent.replace(',', ''));
    const cost = calculateFuelUsage(parsedDistance);
    distance.parentNode.appendChild(createFuelCostLabel(cost));
  });
}

function createFuelCostLabel(cost) {
  const fuelUsageElement = document.createElement('div');
  fuelUsageElement.style.marginTop = '3px';
  fuelUsageElement.innerHTML = `Fuel cost: ${cost} zł`;
  return fuelUsageElement;
}

function calculateFuelUsage(distance) {
  return Math.round(distance * FUEL_USAGE_PER_100_KM/100 * FUEL_PRICE);
}

function watchTravelPlanChangesAndInjectFuelEstimate() {
  let previousPlan;
  let planObserver;

  setInterval(() => {
    const plan = getDrivingTravelPlanContainer();

    if (plan && plan !== previousPlan) {
      if (planObserver) {
        planObserver.disconnect();
      }

      injectFuelEstimate(plan);
      planObserver = observeChildChanges(plan, () => injectFuelEstimate(plan));
      previousPlan = plan;
    }
  }, 300);
}