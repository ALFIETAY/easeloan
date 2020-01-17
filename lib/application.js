/**
 * Mortgage Loan transction processor functions for loan application (Bank)
 */

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {mortgage.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const namespace = 'mortgage';

    // create the credit assessor
    const creditAssessor = factory.newResource(namespace, 'CreditAssessor', 'CA001');
    creditAssessor.name = 'John';
    creditAssessor.role = 'Credit_Assessor';

    // create the valuation assessor
    const valuationAssessor = factory.newResource(namespace, 'ValuationAssessor', 'VA001');
    valuationAssessor.name = 'Roland';
    valuationAssessor.role = 'Valuation_Assessor';

    // create the land authority
    const landAuthority = factory.newResource(namespace, 'LandAuthority', 'LA001');
    landAuthority.name = 'Winson';
    landAuthority.role = 'Land_Authority';

    // add the credit assessor
    const creditAssessorRegistry = await getParticipantRegistry(namespace + '.CreditAssessor');
    await creditAssessorRegistry.addAll([creditAssessor]);

    // add the valuation assessor
    const valuationAssessorRegistry = await getParticipantRegistry(namespace + '.ValuationAssessor');
    await valuationAssessorRegistry.addAll([valuationAssessor]);

    // add the land authority
    const landRegistryAuthority = await getParticipantRegistry(namespace + '.LandAuthority');
    await landRegistryAuthority.addAll([landAuthority]);
}

/**
 * Create Loan Application Transaction
 * @param {mortgage.CreateLoanApplication} createLoanApplication
 * @transaction
 */
async function createLoanApplication(transaction){
    console.log('Creating Loan Application');

    const factory = getFactory();
    const namespace = 'mortgage';

    // When document received was rejected by Bank
    if (transaction.nric === 'REJECTED' || transaction.creditStatements === 'REJECTED' || transaction.propertyOfferLetter === 'REJECTED' ||
    transaction.payslips === 'REJECTED' || transaction.cpfContribution === 'REJECTED') {
      const application = factory.newResource(namespace, 'Application', transaction.applicationId);
      application.applicantName = transaction.applicantName;
      application.applicantAge = transaction.applicantAge;
      application.nric = transaction.nric;
      application.creditStatements = transaction.creditStatements;
      application.propertyOfferLetter = transaction.propertyOfferLetter;
      application.payslips = transaction.payslips;
      application.cpfContribution = transaction.cpfContribution;
      application.loanTenure = transaction.loanTenure;
      application.propertyAmount = transaction.propertyAmount;
      application.loanAmount = transaction.loanAmount;  
      application.monthlyIncome = transaction.monthlyIncome;  
      application.monthlyDebtPayment = transaction.monthlyDebtPayment;

      // Save Loan Application
      const assetRegistry = await getAssetRegistry(application.getFullyQualifiedType());
      await assetRegistry.add(application);

      // Emit a notification that an application is created
      const applicationEvent = getFactory().newEvent(namespace, 'CreateLoanApplicationEvent');
      applicationEvent.applicationId = transaction.applicationId;
      applicationEvent.eventName = 'Application Rejected';
      applicationEvent.currentOrganisation = 'Bank';
      applicationEvent.date = new Date().toLocaleString();
      applicationEvent.applicantName = transaction.applicantName;
      applicationEvent.applicantAge = transaction.applicantAge;
      applicationEvent.nric = transaction.nric;
      applicationEvent.creditStatements = transaction.creditStatements;
      applicationEvent.propertyOfferLetter = transaction.propertyOfferLetter;
      applicationEvent.payslips = transaction.payslips;
      applicationEvent.cpfContribution = transaction.cpfContribution;
      applicationEvent.loanTenure = transaction.loanTenure;
      applicationEvent.propertyAmount = transaction.propertyAmount;
      applicationEvent.loanAmount = transaction.loanAmount;  
      applicationEvent.monthlyIncome = transaction.monthlyIncome;  
      applicationEvent.monthlyDebtPayment = transaction.monthlyDebtPayment;
      emit(applicationEvent);
      
    } else {
      const application = factory.newResource(namespace, 'Application', transaction.applicationId);
      application.applicantName = transaction.applicantName;
      application.applicantAge = transaction.applicantAge;
      application.nric = transaction.nric;
      application.creditStatements = transaction.creditStatements;
      application.propertyOfferLetter = transaction.propertyOfferLetter;
      application.payslips = transaction.payslips;
      application.cpfContribution = transaction.cpfContribution;
      application.loanTenure = transaction.loanTenure;
      application.propertyAmount = transaction.propertyAmount;
      application.loanAmount = transaction.loanAmount;  
      application.monthlyIncome = transaction.monthlyIncome;  
      application.monthlyDebtPayment = transaction.monthlyDebtPayment;

      // Save Loan Application
      const assetRegistry = await getAssetRegistry(application.getFullyQualifiedType());
      await assetRegistry.add(application);

      // Emit a notification that an application is created
      const applicationEvent = getFactory().newEvent(namespace, 'CreateLoanApplicationEvent');
      applicationEvent.applicationId = transaction.applicationId;
      applicationEvent.eventName = 'Application Received';
      applicationEvent.currentOrganisation = 'Bank';
      applicationEvent.date = new Date().toLocaleString();
      applicationEvent.applicantName = transaction.applicantName;
      applicationEvent.applicantAge = transaction.applicantAge;
      applicationEvent.nric = transaction.nric;
      applicationEvent.creditStatements = transaction.creditStatements;
      applicationEvent.propertyOfferLetter = transaction.propertyOfferLetter;
      applicationEvent.payslips = transaction.payslips;
      applicationEvent.cpfContribution = transaction.cpfContribution;
      applicationEvent.loanTenure = transaction.loanTenure;
      applicationEvent.propertyAmount = transaction.propertyAmount;
      applicationEvent.loanAmount = transaction.loanAmount;  
      applicationEvent.monthlyIncome = transaction.monthlyIncome;  
      applicationEvent.monthlyDebtPayment = transaction.monthlyDebtPayment;
      emit(applicationEvent);
  }
}

/**
 * Smart Contract checking on Loan Contract Regulations
 * @param {mortgage.ReviewLoanContract} reviewLoanContract
 * @transaction
 */
async function LoanContract(reviewLoanContract){

  const factory = getFactory();
  const namespace = 'mortgage';
  const application = reviewLoanContract.application;

  let loanToValue = 0;
  let loanTenureDifference = 0;
let	maxLoanAmount = 0
  let loanTenure = 0
  let totalDebtServiceRatio = application.monthlyDebtPayment/application.monthlyIncome * 100

  const applicationRegistry = await getAssetRegistry(namespace + '.Application');
  loanTenure = applicationRegistry.loanTenure;

  // Check loan Tenure is within 35 years
  if (application.loanTenure <= 35) {
      // loan tenure for age 35 below
      if (application.applicantAge < 35) {
          loanTenure = 30;
      }
      else {
          // calculating loan tenure for age above 35 and within 65
          if (application.applicantAge > 35 && application.applicantAge < 65)
              loanTenureDifference = application.applicantAge - 35;
              loanTenure = 30 - loanTenureDifference;
              console.log('Loan tenure' + loanTenure);
      }
      // calculate max loan amount for loan tenure above 30 yr
      if (loanTenure > 30) {
          loanToValue = 0.55;
          maxLoanAmount = application.propertyAmount * loanToValue;
          console.log('Max Loan' + maxLoanAmount);
      }
      // calculate max loan amount for loan tenure below 30 yr 
      else {
          loanToValue = 0.75;
          maxLoanAmount = application.propertyAmount * loanToValue;
          console.log('Max Loan' + maxLoanAmount);
      }
      //calculate monthly loan payment for mortgage
      if (totalDebtServiceRatio < 60) {
          let p = maxLoanAmount;
          let r = 0.022/12;
          let n = loanTenure * 12; // convert year to month
          var pmt = (r * p) / (1 - (Math.pow((1 + r), (-n))));
          pmt = parseFloat(pmt.toFixed(2));
      }
      else {
          throw new Error('Total Debt Servicing Ratio exceeded 60%.')
      }
  }
  // Reject loan tenure that is above 35 years
  else {
      throw new Error('Loan tenure exceeded 35 years.');
  }

  const loanContract = factory.newResource(namespace, 'LoanContract', reviewLoanContract.application.applicationId);
  loanContract.applicantName = application.applicantName;
  loanContract.loanTenure = loanTenure;
  loanContract.maxLoanAmount = maxLoanAmount;
  loanContract.propertyAmount = application.propertyAmount;
  loanContract.monthlyMortgagePayment = pmt;
  loanContract.totalDebtServicingRatio = totalDebtServiceRatio;
  loanContract.loanContractStatus = "WAITING_APPLICANT_ACCEPTANCE";
  
  // Emit an event after contract is reviewed
  const updateLoanReport = getFactory().newEvent(namespace, 'ReviewLoanContractEvent');
  updateLoanReport.applicationId = reviewLoanContract.application.applicationId;
  updateLoanReport.eventName = 'Loan Contract Generated';
  updateLoanReport.currentOrganisation = 'Bank';
  updateLoanReport.date = new Date().toLocaleString();
  updateLoanReport.applicantName = application.applicantName;
  updateLoanReport.loanTenure = loanTenure;
  updateLoanReport.maxLoanAmount = maxLoanAmount;
  updateLoanReport.propertyAmount = application.propertyAmount;
  updateLoanReport.monthlyMortgagePayment = pmt;
  updateLoanReport.totalDebtServicingRatio = totalDebtServiceRatio;
  emit(updateLoanReport);

  // Save Loan Contract
  const loanContractRegistry = await getAssetRegistry(loanContract.getFullyQualifiedType());
  await loanContractRegistry.add(loanContract);
}

/**
* Applicant signs and confirm mortgage loan
* @param {mortgage.LoanConfirmation} loanConfirmation
* @transaction
*/
async function LoanCompletion(loanConfirmation){
  
  const namespace = 'mortgage';
  const loanContract = loanConfirmation.loanContract;

    if (loanConfirmation.loanContractStatus === 'COMPLETED') {
    // Save Loan Confirmation Updates
    const loanContractRegistry = await getAssetRegistry(namespace + '.LoanContract');
    loanContract.loanContractStatus = loanConfirmation.loanContractStatus
    await loanContractRegistry.update(loanContract);

    // Emit an event when applicant signed the loan contract
    const updateLoanReport = getFactory().newEvent(namespace, 'LoanConfirmationEvent');
    updateLoanReport.eventName = 'Mortgage Loan Confirmed';
    updateLoanReport.currentOrganisation = 'Bank';
    updateLoanReport.date = new Date().toLocaleString();
    updateLoanReport.loanContractStatus = loanConfirmation.loanContractStatus;
    emit(updateLoanReport);

  } else if (loanConfirmation.loanContractStatus === 'REJECTED') {
    // Save Loan Confirmation Updates
    const loanContractRegistry = await getAssetRegistry(namespace + '.LoanContract');
    loanContract.loanContractStatus = loanConfirmation.loanContractStatus
    await loanContractRegistry.update(loanContract);

    // Emit an event when applicant signed the loan contract
    const updateLoanReport = getFactory().newEvent(namespace, 'LoanConfirmationEvent');
    updateLoanReport.eventName = 'Mortgage Loan Rejected';
    updateLoanReport.currentOrganisation = 'Bank';
    updateLoanReport.date = new Date().toLocaleString();
    updateLoanReport.loanContractStatus = loanConfirmation.loanContractStatus;
    emit(updateLoanReport);
  }
}