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
    application.personalDocuments = 'RECEIVED';
    application.incomeSlips = 'RECEIVED';
    application.financialStatements = 'RECEIVED';
    application.applicant = factory.newRelationship(namespace, 'Applicant', transaction.applicant.getIdentifier());

    // Save Loan Application
    const assetRegistry = await getAssetRegistry(application.getFullyQualifiedType());
    await assetRegistry.add(application);

    // Emit the event
    const createApplicationEvent = factory.newEvent(namespace, 'CreateApplicationEvent');
    createApplicationEvent.applicationId = transaction.applicationId;
    createApplicationEvent.applicantName = transaction.applicantName;
    createApplicationEvent.personalDocuments = 'RECEIVED';
    createApplicationEvent.incomeSlips = 'RECEIVED';
    createApplicationEvent.financialStatements = 'RECEIVED';
    createApplicationEvent.applicant = factory.newRelationship(namespace, 'Applicant', transaction.applicant.getIdentifier());
    emit(createApplicationEvent);
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
    creditReport.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());

    // Save Credit Report
    const creditRegistry = await getAssetRegistry(creditReport.getFullyQualifiedType());
    await creditRegistry.add(creditReport);

    // // Emit the event
    const createCreditReportEvent = factory.newEvent(namespace, 'CreateCreditReportEvent');
    createCreditReportEvent.applicantId = transaction.applicantId;
    createCreditReportEvent.status = 'AWAITING_DOCUMENT';
    createCreditReportEvent.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());
    emit(createCreditReportEvent);
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
        creditReport.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());
        await creditRegistry.update(creditReport);

        // Emit the event
        const updateCreditReportEvent = factory.newEvent(namespace, 'UpdateCreditReportEvent');
        updateCreditReportEvent.applicantId = transaction.applicantId
        updateCreditReportEvent.status = 'PROCESSING';
        updateCreditReportEvent.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());
        emit(updateCreditReportEvent)

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const creditReport = await creditRegistry.get(transaction.applicantId);
        creditReport.status = 'COMPLETED';
        creditReport.riskGrade = transaction.riskGrade;
        creditReport.creditScore = transaction.creditScore;
        creditReport.riskPercentage = transaction.riskPercentage;
        creditReport.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());
        await creditRegistry.update(creditReport);

        // Emit the event
        const updateCreditReportEvent = factory.newEvent(namespace, 'UpdateCreditReportEvent');
        updateCreditReportEvent.applicantId = transaction.applicantId
        updateCreditReportEvent.status = 'COMPLETED';
        updateCreditReportEvent.riskGrade = transaction.riskGrade;
        updateCreditReportEvent.creditScore = transaction.creditScore;
        updateCreditReportEvent.riskPercentage = transaction.riskPercentage;
        updateCreditReportEvent.creditAssessor = factory.newRelationship(namespace, 'creditAssessor', transaction.creditAssessor.getIdentifier());
        emit(updateCreditReportEvent)
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
    valuationReport.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());

    // Save Valuation Report
    const valuationRegistry = await getAssetRegistry(valuationReport.getFullyQualifiedType());
    await valuationRegistry.add(valuationReport);

    // // Emit the event
    const createValuationReportEvent = factory.newEvent(namespace, 'CreateValuationReportEvent');
    createValuationReportEvent.applicantId = transaction.applicantId;
    createValuationReportEvent.status = 'AWAITING_DOCUMENT';
    createValuationReportEvent.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());
    emit(createValuationReportEvent);
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
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());
        await valuationRegistry.update(valuationReport);

        // Emit the event
        const updateValuationReportEvent = factory.newEvent(namespace, 'UpdateValuationReportEvent');
        updateValuationReportEvent.applicantId = transaction.applicantId
        updateValuationReportEvent.status = 'PROCESSING';
        updateValuationReportEvent.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());
        emit(updateValuationReportEvent)

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const valuationReport = await valuationRegistry.get(transaction.applicantId);
        valuationReport.status = 'COMPLETED';
        valuationReport.estimatedValue = transaction.estimatedValue;
        valuationReport.marketValue = transaction.marketValue;
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());
        await valuationRegistry.update(valuationReport);

        // Emit the event
        const updateValuationReportEvent = factory.newEvent(namespace, 'UpdateValuationReportEvent');
        updateValuationReportEvent.applicantId = transaction.applicantId
        updateValuationReportEvent.status = 'COMPLETED';
        updateValuationReportEvent.estimatedValue = transaction.estimatedValue;
        updateValuationReportEvent.marketValue = transaction.marketValue;
        updateValuationReportEvent.valuationAssessor = factory.newRelationship(namespace, 'valuationAssessor', transaction.valuationAssessor.getIdentifier());
        emit(updateValuationReportEvent)
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
    titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());

    // Save Credit Report
    const titleRegistry = await getAssetRegistry(titleRegistryReport.getFullyQualifiedType());
    await titleRegistry.add(titleRegistryReport);

    // // Emit the event
    const createTitleRegistryEvent = factory.newEvent(namespace, 'CreateTitleRegistryEvent');
    createTitleRegistryEvent.applicantId = transaction.applicantId;
    createTitleRegistryEvent.status = 'AWAITING_DOCUMENT';
    createTitleRegistryEvent.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());
    emit(createTitleRegistryEvent);
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
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());
        await titleRegistry.update(titleRegistryReport);

        // Emit the event
        const updateTitleRegistryEvent = factory.newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateTitleRegistryEvent.applicantId = transaction.applicantId
        updateTitleRegistryEvent.status = 'PROCESSING';
        updateTitleRegistryEvent.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());
        emit(updateTitleRegistryEvent)

    } else if (transaction.status === 'PROCESSING') {
        // Update Status to Processing
        const titleRegistryReport = await titleRegistry.get(transaction.applicantId);
        titleRegistryReport.status = 'COMPLETED';
        titleRegistryReport.propertyAddress = transaction.propertyAddress;
        titleRegistryReport.leaseDuration = transaction.leaseDuration;
        titleRegistryReport.leaseExpiry = transaction.leaseExpiry;
        titleRegistryReport.propertyExist = transaction.propertyExist;
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());
        await titleRegistry.update(titleRegistryReport);

        // Emit the event
        const updateTitleRegistryEvent = factory.newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateTitleRegistryEvent.applicantId = transaction.applicantId
        updateTitleRegistryEvent.status = 'COMPLETED';
        updateTitleRegistryEvent.propertyAddress = transaction.propertyAddress;
        updateTitleRegistryEvent.leaseDuration = transaction.leaseDuration;
        updateTitleRegistryEvent.leaseExpiry = transaction.leaseExpiry;
        updateTitleRegistryEvent.propertyExist = transaction.propertyExist;
        updateTitleRegistryEvent.landAuthority = factory.newRelationship(namespace, 'landAuthority', transaction.landAuthority.getIdentifier());
        emit(updateTitleRegistryEvent)
    }
}