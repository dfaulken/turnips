// TODO set minimum properties of inputs dynamically throughout evaluation
// TODO tables are hot garbage - be best David
// TODO better input feedback

$(document).ready(function(){
  loadCookieData();
  
  $('.clear-cookie').click(clearCookie);

  $('.toggle-calculations').click(toggleCalculations);
  
  $('input').keyup(setCookieData);
  $('.phase-1 input').keyup(evaluatePhase1Form);
  $('.phase-2 input').keyup(evaluatePhase2Form);
  $('.phase-3 input').keyup(evaluatePhase3Form);
});

function clearCookie() {
  for(var keyName in Cookies.get()) {
    Cookies.remove(keyName);
    var inputElement = $('input.' + keyName);
    if(inputElement.length !== 0) {
      inputElement.val('').change();
    }
  }
}

function evaluatePhase1Form(quickLoad){
  var turnipBuyPrice = readField($('.phase-1'), '.turnip-buy-price');
  var totalBellsSpend = readField($('.phase-1'), '.total-bells-spend');
  var maxBunchesTurnips = readField($('.phase-1'), '.max-bunches-turnips');
  
  var validBuyPrice = turnipBuyPrice != NaN && turnipBuyPrice > 0;
  var validBellsSpend = totalBellsSpend != NaN && totalBellsSpend > 0;
  var validMaxBunchesTurnips = maxBunchesTurnips != NaN && maxBunchesTurnips > 0;
  if(!(validBuyPrice && validBellsSpend)){
    hideRecommendation($('.phase-1'), quickLoad);
    toggleFormCalculations($('.phase-1'), false);
    hideForm($('.phase-2'), quickLoad);
    $('.phase-1').find('.maximum-potential-loss').text('');
    return false;
  }
  var turnipsBuyCountExact = Math.floor(totalBellsSpend / turnipBuyPrice);
  var turnipsBuyCountBunches = Math.floor(turnipsBuyCountExact / 100);
  if(validMaxBunchesTurnips && maxBunchesTurnips < turnipsBuyCountBunches){
    turnipsBuyCountBunches = maxBunchesTurnips;
    turnipsBuyCountExact = turnipsBuyCountBunches * 100;
  }
  $('.phase-1').find('.turnips-buy-count-exact').text(turnipsBuyCountExact);
  var turnipsBuyCountHundreds = turnipsBuyCountBunches * 100;
  $('.phase-1').find('.turnips-buy-count-hundreds').text(turnipsBuyCountHundreds);
  $('.phase-1').find('.turnips-buy-count-bunches').text(turnipsBuyCountBunches);
  var actualBuyCost = turnipsBuyCountHundreds * turnipBuyPrice;
  $('.phase-1').find('.actual-buy-cost').text(actualBuyCost);
  
  var safeSellPrice = readField($('.phase-1'), '.safe-sell-price')
  var riskySellPrice = readField($('.phase-1'), '.risky-sell-price');
  var recoupSellPoint = readField($('.phase-1'), '.recoup-sell-point');
  
  var validSafeSellPrice = safeSellPrice != NaN && safeSellPrice > turnipBuyPrice;
  var validRiskySellPrice = riskySellPrice != NaN && riskySellPrice > safeSellPrice;
  var validRecoupSellPoint = recoupSellPoint != NaN && recoupSellPoint < turnipBuyPrice;
  if(!(validSafeSellPrice && validRiskySellPrice && validRecoupSellPoint)){
    hideRecommendation($('.phase-1'), quickLoad);
    toggleFormCalculations($('.phase-1'), false);
    hideForm($('.phase-2'), quickLoad);
    $('.phase-1').find('.maximum-potential-loss').text('');
    return false;
  }
  var lossPerTurnip = turnipBuyPrice - recoupSellPoint;
  var maximumPotentialLoss = lossPerTurnip * turnipsBuyCountHundreds;
  $('.phase-1').find('.maximum-potential-loss').text(maximumPotentialLoss);
  $('.safe-sell-price-repeat').text(safeSellPrice);
  
  var maximumAcceptableLoss = readField($('.phase-1'), '.maximum-acceptable-loss');
  
  var validMaximumAcceptableLoss = maximumAcceptableLoss != NaN && maximumAcceptableLoss >= 0 && maximumAcceptableLoss <= maximumPotentialLoss;
  if(!validMaximumAcceptableLoss){
    hideRecommendation($('.phase-1'), quickLoad);
    toggleFormCalculations($('.phase-1'), false);
    hideForm($('.phase-2'), quickLoad);
    return false;
  }
  var minimumAcceptableTotalSales = actualBuyCost - maximumAcceptableLoss;
  $('.phase-1').find('.minimum-acceptable-total-sales').text(minimumAcceptableTotalSales);
  var totalTurnipsRecoupSalePrice = turnipsBuyCountHundreds * recoupSellPoint;
  $('.phase-1').find('.total-turnips-recoup-sale-price').text(totalTurnipsRecoupSalePrice);
  var safeSaleCoverAmount = minimumAcceptableTotalSales - totalTurnipsRecoupSalePrice;
  $('.phase-1').find('.safe-sale-cover-amount').text(safeSaleCoverAmount);
  var safeOverRecoupPricePerTurnip = safeSellPrice - recoupSellPoint;
  $('.phase-1').find('.safe-over-recoup-price-per-turnip').text(safeOverRecoupPricePerTurnip);
  var safeSellAmountExact = Math.ceil(safeSaleCoverAmount / safeOverRecoupPricePerTurnip);
  $('.phase-1').find('.safe-sell-amount-exact').text(safeSellAmountExact);
  var safeSellAmountBunches = Math.ceil(safeSellAmountExact / 100);
  var safeSellAmountHundreds = safeSellAmountBunches * 100;
  $('.phase-1').find('.safe-sell-amount-hundreds').text(safeSellAmountHundreds);
  $('.phase-1').find('.safe-sell-amount-bunches').text(safeSellAmountBunches);
  var safeSaleGross = safeSellPrice * safeSellAmountHundreds;
  $('.phase-1').find('.safe-sale-gross').text(safeSaleGross);
  var turnipsCountAfterSafeSale = turnipsBuyCountHundreds - safeSellAmountHundreds;
  $('.phase-1').find('.turnips-count-after-safe-sale').text(turnipsCountAfterSafeSale);
  evaluateProjections($('.phase-1'), turnipsCountAfterSafeSale, safeSaleGross);
  showRecommendation($('.phase-1'), quickLoad);
  showForm($('.phase-2'), quickLoad);
  return true;
}

function evaluatePhase2Form(quickLoad){
  if(!evaluatePhase1Form()){
    hideRecommendation($('.phase-2'), quickLoad);
    toggleFormCalculations($('.phase-2'), false);
    hideForm($('.phase-3'), quickLoad);
    return false;
  }
  var actualSafeSellPoint = readField($('.phase-2'), '.actual-safe-sell-price');
  var safeSellPoint = readField($('.phase-1'), '.safe-sell-price');
  var recoupSellPoint = readField($('.phase-1'), '.recoup-sell-point');
  var safeSaleCoverAmount = readField($('.phase-1'), '.safe-sale-cover-amount');
  var turnipsBuyCountHundreds = readField($('.phase-1'), '.turnips-buy-count-hundreds');
  
  var validActualSafeSellPoint = actualSafeSellPoint != NaN && actualSafeSellPoint >= safeSellPoint;
  if(!validActualSafeSellPoint){
    hideRecommendation($('.phase-2'), quickLoad);
    toggleFormCalculations($('.phase-2'), false);
    hideForm($('.phase-3'), quickLoad);
    return false;
  }
  var adjustedRiskAbatementPerTurnip = actualSafeSellPoint - recoupSellPoint;
  $('.phase-2').find('.adjusted-risk-abatement-per-turnip').text(adjustedRiskAbatementPerTurnip);
  var adjustedTurnipsSafeSaleCountExact = safeSaleCoverAmount / adjustedRiskAbatementPerTurnip;
  $('.phase-2').find('.adjusted-turnips-safe-sale-count-exact').text(adjustedTurnipsSafeSaleCountExact);
  var adjustedTurnipsSafeSaleCountBunches = Math.ceil(adjustedTurnipsSafeSaleCountExact / 100);
  var adjustedTurnipsSafeSaleCountHundreds = adjustedTurnipsSafeSaleCountBunches * 100;
  $('.phase-2').find('.adjusted-turnips-safe-sale-count-hundreds').text(adjustedTurnipsSafeSaleCountHundreds);
  $('.phase-2').find('.adjusted-turnips-safe-sale-count-bunches').text(adjustedTurnipsSafeSaleCountBunches);
  var adjustedSafeSellPrice = adjustedTurnipsSafeSaleCountHundreds * actualSafeSellPoint;
  $('.phase-2').find('.adjusted-safe-sell-price').text(adjustedSafeSellPrice);
  var remainingAfterSafeSale = turnipsBuyCountHundreds - adjustedTurnipsSafeSaleCountHundreds;
  $('.phase-2').find('.remaining-after-safe-sale').text(remainingAfterSafeSale);
  evaluateProjections($('.phase-2'), remainingAfterSafeSale, adjustedSafeSellPrice);
  showRecommendation($('.phase-2'), quickLoad);
  showForm($('.phase-3'), quickLoad);
  return true;
}

function evaluatePhase3Form(quickLoad){
  if(!(evaluatePhase1Form() && evaluatePhase2Form())){
    hideRecommendation($('.phase-3'), quickLoad);
    toggleFormCalculations($('.phase-3'), false);
    hideForm($('.phase-4'), quickLoad);
    return false;
  }
  var actualFinalSellPoint = readField($('.phase-3'), '.actual-final-sell-point');
  var remainingAfterSafeSale = readField($('.phase-2'), '.remaining-after-safe-sale');
  var adjustedSafeSellPrice = readField($('.phase-2'), '.adjusted-safe-sell-price');
  var actualBuyCost = readField($('.phase-1'), '.actual-buy-cost');
  
  var validActualFinalSellPoint = actualFinalSellPoint != NaN;
  if(!validActualFinalSellPoint){
    hideRecommendation($('.phase-3'), quickLoad);
    toggleFormCalculations($('.phase-3'), false);
    hideForm($('.phase-4'), quickLoad);
    return false;
  }
  var finalSalePrice = actualFinalSellPoint * remainingAfterSafeSale;
  $('.phase-3').find('.final-sale-price').text(finalSalePrice);
  var totalSales = finalSalePrice + adjustedSafeSellPrice;
  $('.phase-3').find('.total-sales').text(totalSales);
  var totalProfit = totalSales - actualBuyCost;
  $('.phase-3').find('.total-profit').text(totalProfit);
  showRecommendation($('.phase-3'), quickLoad);
  showForm($('.phase-4'), quickLoad);
  return true;
}

// This assumes that the preceding fields have been validated.
function evaluateProjections(form, remainingTurnips, safeSaleGross){
  var recoupSellPoint = readField($('.phase-1'), '.recoup-sell-point');
  var actualBuyCost = readField($('.phase-1'), '.actual-buy-cost');
  var riskySellPrice = readField($('.phase-1'), '.risky-sell-price');

  var riskNoRecoupSalePriceRemaining = remainingTurnips * recoupSellPoint;
  form.find('.risk-no-recoup-sale-price-remaining').text(riskNoRecoupSalePriceRemaining);
  var riskNoTotalGrossSales = riskNoRecoupSalePriceRemaining + safeSaleGross;
  form.find('.risk-no-total-gross-sales').text(riskNoTotalGrossSales);
  var riskNoTotalPotentialLoss = actualBuyCost - riskNoTotalGrossSales;
  form.find('.risk-no-total-potential-loss').text(riskNoTotalPotentialLoss);
  var riskYesRiskySalePriceRemaining = remainingTurnips * riskySellPrice;
  form.find('.risk-yes-risky-sale-price-remaining').text(riskYesRiskySalePriceRemaining);
  var riskYesTotalGrossSales = riskYesRiskySalePriceRemaining + safeSaleGross;
  form.find('.risk-yes-total-gross-sales').text(riskYesTotalGrossSales);
  var riskYesTotalPotentialProfit = riskYesTotalGrossSales - actualBuyCost;
  form.find('.risk-yes-total-potential-profit').text(riskYesTotalPotentialProfit);
}

function fakeData(){
  $('.phase-1').find('.turnip-buy-price').val(92);
  $('.phase-1').find('.total-bells-spend').val(300000);
  $('.phase-1').find('.max-bunches-turnips').val(null);
  $('.phase-1').find('.safe-sell-price').val(125);
  $('.phase-1').find('.risky-sell-price').val(160);
  $('.phase-1').find('.recoup-sell-point').val(50);
  $('.phase-1').find('.maximum-acceptable-loss').val(50000).change();
  toggleFormCalculations($('.phase-1'), true);
  
  $('.phase-2').find('.actual-safe-sell-price').val(127).change();
  toggleFormCalculations($('.phase-2'), true);
  
  $('.phase-3').find('.actual-final-sell-point').val(177).change();
  toggleFormCalculations($('.phase-3'), true);
}

function hideForm(form, quickLoad){
  if(quickLoad === true){
    form.hide();
  }
  else form.slideUp();
}

function hideRecommendation(form, quickLoad){
  if(quickLoad === true){
    form.find('.recommendation').hide();
  }
  else form.find('.recommendation').slideUp();
}

function loadCookieData(){
  for(var keyName in Cookies.get()){
    var inputElement = $('input.' + keyName);
    if(inputElement.length === 0) {
      Cookies.remove(keyName);
    }
    else inputElement.val(Cookies.get(keyName));
  }
  // Hide elements on page load, not slide.
  evaluatePhase1Form(true);
  evaluatePhase2Form(true);
  evaluatePhase3Form(true);
}

function toggleCalculations(){
  var form = $(this).parents('.phase-1,.phase-2,.phase-3,.phase-4').first();
  toggleFormCalculations(form);
}

function toggleFormCalculations(form, setVisible){
  if(setVisible === undefined) {
    setVisible = !form.find('.calculation').is(':visible');
  }
  if(setVisible){
    form.find('.calculation').slideDown();
    form.find('.toggle-calculations').text('Hide calculations');
  }
  else {
    form.find('.calculation').slideUp();
    form.find('.toggle-calculations').text('Show calculations');
  }
}

function readField(phase, fieldName){
  var field = phase.find(fieldName).first();
  if(field.is('input')){
    var value = field.val();
  }
  else var value = field.text();
  return parseInt(value);
}

function setCookieData(){
  Cookies.set($(this).attr('class'), $(this).val());
}

function showForm(form, quickLoad){
  if(quickLoad === true){
    form.show();
  }
  else form.slideDown();
}

function showRecommendation(form, quickLoad){
  if(quickLoad === true){
    form.find('.recommendation').show();
  }
  else form.find('.recommendation').slideDown();
}