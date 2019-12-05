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
    application.personalDocuments = transaction.personalDocuments;
    application.incomeSlips = transaction.incomeSlips;
    application.financialStatements = transaction.financialStatements;

    // Save Loan Application
    const assetRegistry = await getAssetRegistry(application.getFullyQualifiedType());
    await assetRegistry.add(application);
  
  	// Emit Event
    // const createApplicationEvent = factory.newEvent(namespace, 'CreateApplicationEvent');
    // createApplicationEvent.applicationId = transaction.applicationId;
    // createApplicationEvent.applicantName = transaction.applicantName;
    // createApplicationEvent.personalDocuments = 'RECEIVED';
    // createApplicationEvent.incomeSlips = 'RECEIVED';
    // createApplicationEvent.financialStatements = 'RECEIVED';
    // emit(createApplicationEvent);
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
    creditReport.status = 'AWAITING_DOCUMENT';
    creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
    
    // Save Credit Report
    const creditRegistry = await getAssetRegistry(creditReport.getFullyQualifiedType());
    await creditRegistry.add(creditReport);

}

/**
 * Update Credit Report Transaction to PROCESSING or COMPLETED
 * @param {mortgage.UpdateCreditReport} updateCreditReport
 * @transaction
 */
async function updateCreditReport(transaction){
    console.log('Updating Credit Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Credit Report Registry
    const creditRegistry = await getAssetRegistry(namespace + '.CreditReport');
    if (transaction.status === 'AWAITING_DOCUMENT') {
        // Update Status to Processing
        const creditReport = await creditRegistry.get(transaction.applicantId);
        creditReport.status = 'PROCESSING';
        creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
        await creditRegistry.update(creditReport);

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const creditReport = await creditRegistry.get(transaction.applicantId);
        creditReport.status = 'COMPLETED';
        creditReport.riskGrade = transaction.riskGrade;
        creditReport.creditScore = transaction.creditScore;
        creditReport.riskPercentage = transaction.riskPercentage;
        creditReport.creditAssessor = factory.newRelationship(namespace, 'CreditAssessor', 'CA001');
        await creditRegistry.update(creditReport);

    }  else if (transaction.status === "COMPLETED" ) {
        throw new Error('Your request has already been approved');

    }  else if (transaction.status === "REJECTED") {
        throw new Error('Your credit request has been rejected.');
    
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
    valuationReport.status = 'AWAITING_DOCUMENT';
    valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');

    // Save Valuation Report
    const valuationRegistry = await getAssetRegistry(valuationReport.getFullyQualifiedType());
    await valuationRegistry.add(valuationReport);
}

/**
 * Update Valuation Report Transaction to PROCESSING or COMPLETED
 * @param {mortgage.UpdateValuationReport} updateValuationReport
 * @transaction
 */
async function updateValuationReport(transaction){
    console.log('Updating Valuation Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Valuation Report Registry
    const valuationRegistry = await getAssetRegistry(namespace + '.ValuationReport');
    if (transaction.status === 'AWAITING_DOCUMENT') {
        // Update Status to Processing
        const valuationReport = await valuationRegistry.get(transaction.applicantId);
        valuationReport.status = 'PROCESSING';
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const valuationReport = await valuationRegistry.get(transaction.applicantId);
        valuationReport.status = 'COMPLETED';
        valuationReport.estimatedValue = transaction.estimatedValue;
        valuationReport.marketValue = transaction.marketValue;
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

    }  else if (transaction.status === "COMPLETED" ) {
        throw new Error('Your request has already been approved');

    }  else if (transaction.status === "REJECTED") {
        throw new Error('Your credit request has been rejected.');
    
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
    titleRegistryReport.status = 'AWAITING_DOCUMENT';
    titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')

    // Save Credit Report
    const titleRegistry = await getAssetRegistry(titleRegistryReport.getFullyQualifiedType());
    await titleRegistry.add(titleRegistryReport);

}

/**
 * Update Title Registry Report Transaction to PROCESSING or COMPLETED
 * @param {mortgage.UpdateTitleRegistry} updateTitleRegistry
 * @transaction
 */
async function updateTitleRegistry(transaction){
    console.log('Updating Title Registry Report Status')

    const factory = getFactory();
    const namespace = 'mortgage';

    // Get Title Report Registry
    const titleRegistry = await getAssetRegistry(namespace + '.TitleRegistryReport');
    if (transaction.status === 'AWAITING_DOCUMENT') {
        // Update Status to Processing
        const titleRegistryReport = await titleRegistry.get(transaction.applicantId);
        titleRegistryReport.status = 'PROCESSING';
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const titleRegistryReport = await titleRegistry.get(transaction.applicantId);
        titleRegistryReport.status = 'COMPLETED';
        titleRegistryReport.propertyAddress = transaction.propertyAddress;
        titleRegistryReport.leaseDuration = transaction.leaseDuration;
        titleRegistryReport.leaseExpiry = transaction.leaseExpiry;
        titleRegistryReport.propertyExist = transaction.propertyExist;
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);

    }  else if (transaction.status === "COMPLETED" ) {
        throw new Error('Your request has already been approved');

    }  else if (transaction.status === "REJECTED") {
        throw new Error('Your credit request has been rejected.');
    
    }
}