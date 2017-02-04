const DRIVING_ICON_SELECTOR = '.section-directions-trip-travel-mode-icon.drive';
const DISTANCES_SELECTOR = '.section-directions-trip-distance > div:first-of-type';

// TODO: set as configurable
const FUEL_USAGE_PER_100_KM = 7;
const FUEL_PRICE = 4.69;
const CURRENCY = 'PLN';

function getDrivingTravelPlanContainer() {
  const drivingIcon = document.querySelector(DRIVING_ICON_SELECTOR);
      
  if (drivingIcon) {
    return drivingIcon.parentNode.parentNode;
  } else {
    return null;
  }
}

function getDrivingTravelPlan() {
  return new Promise(resolve => {
    const lookForTravelPlanUntilFound = setInterval(() => {
      const plan = getDrivingTravelPlanContainer();

      if (plan) {
        clearInterval(lookForTravelPlanUntilFound);
        resolve(plan);
      }
    }, 500);
  });
}

function injectFuelEstimation(plan) {
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

function observeTextChanges(container, onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(container, { childList: true });
}