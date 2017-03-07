const DRIVING_ICON_SELECTOR = '.section-directions-trip-travel-mode-icon.drive';
const DISTANCES_SELECTOR = '.section-directions-trip-distance > div:first-of-type';

// TODO: set as configurable
const FUEL_USAGE_PER_100_KM = 7;
const CURRENCY = 'PLN';
const LOCALE = 'pl-PL';

const fuelType = { PB98: 2, PB95: 3, ON: 4, LPG: 5 };

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

  fetchFuelPrice().then(fuelPrice => {
    distances.forEach(distance => {
      const parsedDistance = parseFloat(distance.textContent.replace(',', ''));
      const cost = calculateFuelUsage(parsedDistance, fuelPrice);
      distance.parentNode.appendChild(createFuelCostLabel(cost));
    });
  });
}

const formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

function createFuelCostLabel(cost) {
  const fuelUsageElement = document.createElement('div');
  fuelUsageElement.style.marginTop = '3px';
  const formattedCost = formatter.format(cost);
  fuelUsageElement.innerHTML = `Fuel cost: ${formattedCost}`;
  return fuelUsageElement;
}

function calculateFuelUsage(distance, fuelPrice) {
  return Math.round(distance * FUEL_USAGE_PER_100_KM/100 * fuelPrice);
}

function fetchFuelPrice() {
  return new Promise((resolve, reject) => {
    const date = new Date();
    const cacheKey = 'fuel_cost_calculator_' + date.getDay() + '-' + date.getMonth() + '-' + date.getFullYear();

    try {
      const cachedFuelPrice = localStorage.getItem(cacheKey);
      if (cachedFuelPrice) {
        resolve(Number(cachedFuelPrice));
      }
    } catch (e) {
      // ignore local storage errors
    }

    fetch('https://www.e-petrol.pl/notowania/rynek-krajowy/ceny-stacje-paliw')
      .then(response => response.text())
      .then(text => {
        const fuelPricesPage = document.createElement('div');
        fuelPricesPage.innerHTML = text;
        const fuelPriceList = fuelPricesPage.querySelector('#tablesort249 tbody tr:first-child');
        let fuelPrice;

        try {
          const fuelPriceAsString = fuelPriceList.children[fuelType.PB95].textContent;
          fuelPrice = parseFloat(fuelPriceAsString.replace(',', '.'));
        } catch (e) {
          reject(e);
          return;
        }

        try {
          localStorage.setItem(cacheKey, fuelPrice);
        } catch (e) {
          // ignore local storage errors
        }

        resolve(fuelPrice);
      })
      .catch(reject);
  });
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