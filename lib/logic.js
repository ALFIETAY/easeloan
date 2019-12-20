/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Mortgage Loan transction processor functions
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

    const application = factory.newResource(namespace, 'Application', transaction.applicationId);
    application.applicantName = transaction.applicantName;
    application.applicantAge = transaction.applicantAge;
    application.personalDocuments = transaction.personalDocuments;
    application.incomeSlips = transaction.incomeSlips;
    application.financialStatements = transaction.financialStatements;
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
    applicationEvent.applicantName = transaction.applicantName;
    applicationEvent.applicantAge = transaction.applicantAge;
    applicationEvent.personalDocuments = transaction.personalDocuments;
    applicationEvent.incomeSlips = transaction.incomeSlips;
    applicationEvent.financialStatements = transaction.financialStatements;
    applicationEvent.loanTenure = transaction.loanTenure;
    applicationEvent.propertyAmount = transaction.propertyAmount;
    applicationEvent.loanAmount = transaction.loanAmount;  
    applicationEvent.monthlyIncome = transaction.monthlyIncome;  
    applicationEvent.monthlyDebtPayment = transaction.monthlyDebtPayment;
    emit(applicationEvent);

}

/**
 * Create Credit Report Transaction
 * @param {mortgage.CreateCreditReport} createCreditReport
 * @transaction
 */
async function createCreditReport(transaction){
    console.log('Creating Credit Report');

    const factory = getFactory();
    const namespace = 'mortgage';

    const creditReport = factory.newResource(namespace, 'CreditReport', transaction.applicantId);
    creditReport.status = 'PROCESSING';
    creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
  
    // Save Credit Report
    const creditRegistry = await getAssetRegistry(creditReport.getFullyQualifiedType());
    await creditRegistry.add(creditReport);

    // Emit an event when credit report is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateCreditEvent');
    reportEvent.applicantId = transaction.applicantId;
    reportEvent.status = 'PROCESSING';
    emit(reportEvent);
}

/**
 * Update Credit Report Transaction to COMPLETED or REJECTED
 * @param {mortgage.UpdateCreditReport} updateCreditReport
 * @transaction
 */
async function updateCreditReport(transaction){
    console.log('Updating Credit Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Credit Report Registry
    const creditRegistry = await getAssetRegistry(namespace + '.CreditReport');
    if (transaction.status === 'COMPLETED') {
        // Update Status to Completed
        const creditReport = await creditRegistry.get(transaction.applicantId);
        creditReport.status = 'COMPLETED';
        creditReport.riskGrade = transaction.riskGrade;
        creditReport.creditScore = transaction.creditScore;
        creditReport.riskPercentage = transaction.riskPercentage;
        creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
        await creditRegistry.update(creditReport);

        // Emit an event when credit report is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateCreditReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'COMPLETED';
        updateReportEvent.riskGrade = transaction.riskGrade;
        updateReportEvent.creditScore = transaction.creditScore;
        updateReportEvent.riskPercentage = transaction.riskPercentage;
    	emit(updateReportEvent);
      
    }  else if (transaction.status === "REJECTED") {
      	// Credit Report has been rejected
        const creditReport = await creditRegistry.get(transaction.applicantId);
        creditReport.status = 'REJECTED';
        creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
        await creditRegistry.update(creditReport);    

        // Emit an event when credit report is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateCreditReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'REJECTED';
    	emit(updateReportEvent);
    }
}

/**
 * Create Valuation Report Transaction
 * @param {mortgage.CreateValuationReport} createValuationReport
 * @transaction
 */
async function createValuationReport(transaction){
    console.log('Creating Valuation Report');

    const factory = getFactory();
    const namespace = 'mortgage';

    const valuationReport = factory.newResource(namespace, 'ValuationReport', transaction.applicantId);
    valuationReport.status = 'PROCESSING';
    valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');

    // Save Valuation Report
    const valuationRegistry = await getAssetRegistry(valuationReport.getFullyQualifiedType());
    await valuationRegistry.add(valuationReport);

    // Emit an event when valuation report is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateValuationEvent');
    reportEvent.applicantId = transaction.applicantId;
    reportEvent.status = 'PROCESSING';
    emit(reportEvent);
}

/**
 * Update Valuation Report Transaction to COMPLETED or REJECTED
 * @param {mortgage.UpdateValuationReport} updateValuationReport
 * @transaction
 */
async function updateValuationReport(transaction){
    console.log('Updating Valuation Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Valuation Report Registry
    const valuationRegistry = await getAssetRegistry(namespace + '.ValuationReport');
    if (transaction.status === 'COMPLETED') {
        // Update Status to Completed
        const valuationReport = await valuationRegistry.get(transaction.applicantId);
        valuationReport.status = 'COMPLETED';
        valuationReport.estimatedValue = transaction.estimatedValue;
        valuationReport.marketValue = transaction.marketValue;
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

        // Emit an event when valuation report is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateValuationReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'COMPLETED';
        updateReportEvent.estimatedValue = transaction.estimatedValue;
        updateReportEvent.marketValue = transaction.marketValue;
        emit(updateReportEvent);

    }  else if (transaction.status === "REJECTED") {
      	// Valuation Report has been rejected
        const valuationReport = await valuationRegistry.get(transaction.applicantId);
        valuationReport.status = 'REJECTED';
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

        // Emit an event when valuation report is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateValuationReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'REJECTED';
        emit(updateReportEvent);
    }
}

/**
 * Create Title Registry Report Transaction
 * @param {mortgage.CreateTitleRegistry} createTitleRegistry
 * @transaction
 */
async function createTitleRegistry(transaction){
    console.log('Creating Title Registry Report');

    const factory = getFactory();
    const namespace = 'mortgage';

    const titleRegistryReport = factory.newResource(namespace, 'TitleRegistryReport', transaction.applicantId);
    titleRegistryReport.status = 'PROCESSING';
    titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')

    // Save Credit Report
    const titleRegistry = await getAssetRegistry(titleRegistryReport.getFullyQualifiedType());
    await titleRegistry.add(titleRegistryReport);

    // Emit an event when title registry is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateTitleEvent');
    reportEvent.applicantId = transaction.applicantId;
    reportEvent.status = 'PROCESSING';
    emit(reportEvent);
}

/**
 * Update Title Registry Report Transaction to COMPLETED or REJECTED
 * @param {mortgage.UpdateTitleRegistry} updateTitleRegistry
 * @transaction
 */
async function updateTitleRegistry(transaction){
    console.log('Updating Title Registry Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Title Report Registry
    const titleRegistry = await getAssetRegistry(namespace + '.TitleRegistryReport');
    if (transaction.status === 'COMPLETED') {
        // Update Status to Processing
        const titleRegistryReport = await titleRegistry.get(transaction.applicantId);
        titleRegistryReport.status = 'COMPLETED';
        titleRegistryReport.propertyAddress = transaction.propertyAddress;
        titleRegistryReport.leaseDuration = transaction.leaseDuration;
        titleRegistryReport.leaseExpiry = transaction.leaseExpiry;
        titleRegistryReport.propertyExist = transaction.propertyExist;
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);

        // Emit an event when title registry is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'COMPLETED';
        updateReportEvent.propertyAddress = transaction.propertyAddress;
        updateReportEvent.leaseDuration = transaction.leaseDuration;
        updateReportEvent.leaseExpiry = transaction.leaseExpiry;
        updateReportEvent.propertyExist = transaction.propertyExist;
        emit(updateReportEvent);

    }  else if (transaction.status === "REJECTED") {
		// Title registry has been rejected
        const titleRegistryReport = await titleRegistry.get(transaction.applicantId);
        titleRegistryReport.status = 'REJECTED';
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);
        
        // Emit an event when title regitry is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.status = 'REJECTED';
        emit(updateReportEvent);
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

    const loanContract = factory.newResource(namespace, 'LoanContract', 'LC00' + reviewLoanContract.application.applicationId);
    loanContract.applicantName = application.applicantName;
    loanContract.loanTenure = loanTenure;
    loanContract.maxLoanAmount = maxLoanAmount;
    loanContract.propertyAmount = application.propertyAmount;
    loanContract.monthlyMortgagePayment = pmt;
    loanContract.totalDebtServicingRatio = totalDebtServiceRatio;
    loanContract.loanContractStatus = "WAITING_APPLICANT_ACCEPTANCE";

    // Emit an event after contract is reviewed
    const updateLoanReport = getFactory().newEvent(namespace, 'ReviewLoanContractEvent');
    updateLoanReport.applicantId = reviewLoanContract.application.applicationId;
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

    // Save Loan Confirmation Updates
    const loanContractRegistry = await getAssetRegistry(namespace + '.LoanContract');
    loanContract.loanContractStatus = 'COMPLETED';
    await loanContractRegistry.update(loanContract);

    // Emit an event when applicant signed the loan contract
    const updateLoanReport = getFactory().newEvent(namespace, 'LoanCofirmationEvent');
    updateLoanReport.loanContractStatus = 'COMPLETED';
    emit(updateLoanReport);
}