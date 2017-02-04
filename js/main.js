getDrivingTravelPlan().then(plan => {
  injectFuelEstimation(plan);
  observeTextChanges(plan, () => injectFuelEstimation(plan));
});