// TODO set minimum properties of inputs dynamically throughout evaluation
// TODO abstract function for reading field OR text
// TODO cleanup 'price' vs. 'point'
// TODO CSS in general
// TODO page footer
// TODO tables are hot garbage - be best David

$(document).ready(function(){
  $('.fake').click(fakeData);

  $('.toggle-calculations').click(toggleCalculations);
  
  $('.phase-1 input').change(evaluatePhase1Form);
  $('.phase-2 input').change(evaluatePhase2Form);
  $('.phase-3 input').change(evaluatePhase3Form);
});

function evaluatePhase1Form(){
  var turnipBuyPrice = parseInt($('.phase-1').find('.turnip-buy-price').first().val());
  var totalBellsSpend = parseInt($('.phase-1').find('.total-bells-spend').first().val());
  var maxBunchesTurnips = parseInt($('.phase-1').find('.max-bunches-turnips').first().val());
  
  var validBuyPrice = turnipBuyPrice != NaN && turnipBuyPrice > 0;
  var validBellsSpend = totalBellsSpend != NaN && totalBellsSpend > 0;
  var validMaxBunchesTurnips = maxBunchesTurnips != NaN && maxBunchesTurnips > 0;
  if(!(validBuyPrice && validBellsSpend)){
    hideRecommendation($('.phase-1'));
    hideForm($('.phase-2'));
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
  
  var safeSellPrice = parseInt($('.phase-1').find('.safe-sell-price').first().val());
  var riskySellPrice = parseInt($('.phase-1').find('.risky-sell-price').first().val());
  var recoupSellPoint = parseInt($('.phase-1').find('.recoup-sell-point').first().val());
  
  var validSafeSellPrice = safeSellPrice != NaN && safeSellPrice > turnipBuyPrice;
  var validRiskySellPrice = riskySellPrice != NaN && riskySellPrice > safeSellPrice;
  var validRecoupSellPoint = recoupSellPoint != NaN && recoupSellPoint < turnipBuyPrice;
  if(!(validSafeSellPrice && validRiskySellPrice && validRecoupSellPoint)){
    hideRecommendation($('.phase-1'));
    hideForm($('.phase-2'));
    return false;
  }
  var lossPerTurnip = turnipBuyPrice - recoupSellPoint;
  var maximumPotentialLoss = lossPerTurnip * turnipsBuyCountHundreds;
  $('.phase-1').find('.maximum-potential-loss').text(maximumPotentialLoss);
  $('.safe-sell-price-repeat').text(safeSellPrice);
  
  var maximumAcceptableLoss = parseInt($('.phase-1').find('.maximum-acceptable-loss').first().val());
  
  var validMaximumAcceptableLoss = maximumAcceptableLoss != NaN && maximumAcceptableLoss >= 0 && maximumAcceptableLoss <= maximumPotentialLoss;
  if(!validMaximumAcceptableLoss){
    hideRecommendation($('.phase-1'));
    hideForm($('.phase-2'));
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
  showRecommendation($('.phase-1'));
  showForm($('.phase-2'));
  return true;
}

function evaluatePhase2Form(){
  if(!evaluatePhase1Form()){
    hideRecommendation($('.phase-2'));
    hideForm($('.phase-3'));
    return false;
  }
  var actualSafeSellPoint = parseInt($('.phase-2').find('.actual-safe-sell-price').first().val());
  var safeSellPoint = parseInt($('.phase-1').find('.safe-sell-price').first().val());
  var recoupSellPoint = parseInt($('.phase-1').find('.recoup-sell-point').first().val());
  var safeSaleCoverAmount = parseInt($('.phase-1').find('.safe-sale-cover-amount').first().text());
  var turnipsBuyCountHundreds = parseInt($('.phase-1').find('.turnips-buy-count-hundreds').first().text());
  
  var validActualSafeSellPoint = actualSafeSellPoint != NaN && actualSafeSellPoint >= safeSellPoint;
  if(!validActualSafeSellPoint){
    hideRecommendation($('.phase-2'));
    hideForm($('.phase-3'));
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
  showRecommendation($('.phase-2'));
  showForm($('.phase-3'));
  return true;
}

function evaluatePhase3Form(){
  if(!(evaluatePhase1Form() && evaluatePhase2Form())){
    hideRecommendation($('.phase-3'));
    hideForm($('.phase-4'));
    return false;
  }
  var actualFinalSellPoint = parseInt($('.phase-3').find('.actual-final-sell-point').first().val());
  var remainingAfterSafeSale = parseInt($('.phase-2').find('.remaining-after-safe-sale').first().text());
  var adjustedSafeSellPrice = parseInt($('.phase-2').find('.adjusted-safe-sell-price').first().text());
  var actualBuyCost = parseInt($('.phase-1').find('.actual-buy-cost').first().text());
  
  var validActualFinalSellPoint = actualFinalSellPoint != NaN;
  if(!validActualFinalSellPoint){
    hideRecommendation($('.phase-3'));
    hideForm($('.phase-4'));
    return false;
  }
  var finalSalePrice = actualFinalSellPoint * remainingAfterSafeSale;
  $('.phase-3').find('.final-sale-price').text(finalSalePrice);
  var totalSales = finalSalePrice + adjustedSafeSellPrice;
  $('.phase-3').find('.total-sales').text(totalSales);
  var totalProfit = totalSales - actualBuyCost;
  $('.phase-3').find('.total-profit').text(totalProfit);
  showRecommendation($('.phase-3'));
  showForm($('.phase-4'));
  return true;
}

// This assumes that the preceding fields have been validated.
function evaluateProjections(form, remainingTurnips, safeSaleGross){
  var recoupSellPoint = parseInt($('.phase-1').find('.recoup-sell-point').first().val());
  var actualBuyCost = parseInt($('.phase-1').find('.actual-buy-cost').first().text());
  var riskySellPrice = parseInt($('.phase-1').find('.risky-sell-price').first().val());

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
  
  $('.phase-2').find('.actual-safe-sell-price').val(127).change();
}

function hideForm(form){
  form.hide();
}

function hideRecommendation(form){
  form.find('.recommendation').hide();
}

function toggleCalculations(){
  var phase = $(this).parents('.phase-1,.phase-2,.phase-3,.phase-4').first();
  if(phase.find('.calculation').is(':visible')){
    phase.find('.calculation').hide();
    phase.find('.toggle-calculations').text('Show calculations');
  }
  else {
    phase.find('.calculation').show();
    phase.find('.toggle-calculations').text('Hide calculations');
  }
}

function showForm(form){
  form.show();
}

function showRecommendation(form){
  form.find('.recommendation').show();
}