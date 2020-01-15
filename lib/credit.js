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
 * Mortgage Loan transction processor functions for Credit Assessor
 */

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

    // Set Status to 'Assessing Credit Information'
    const statusRegistry = await getAssetRegistry(namespace + '.Status');
    const updateStatus = await statusRegistry.get(transaction.applicantId);
    updateStatus.currentOrganisation = 'Credit Bureau';
    updateStatus.status = 'Assessing Credit Information';
    updateStatus.date = new Date().toLocaleString();
    await statusRegistry.update(updateStatus);

    // Emit an event when credit report is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateCreditEvent');
    reportEvent.applicantId = transaction.applicantId;
    reportEvent.eventName = 'Assessing Credit Information';
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

        // Set Status to 'Credit Assessment Completed'
        const statusRegistry = await getAssetRegistry(namespace + '.Status');
        const updateStatus = await statusRegistry.get(transaction.applicantId);
        updateStatus.currentOrganisation = 'Credit Bureau';
        updateStatus.status = 'Credit Assessment Completed';
        updateStatus.date = new Date().toLocaleString();
        await statusRegistry.update(updateStatus);

        // Emit an event when credit report is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateCreditReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.eventName = 'Credit Assessment Completed';
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
        
        // Set Status to 'Credit Assessment Rejected'
        const statusRegistry = await getAssetRegistry(namespace + '.Status');
        const updateStatus = await statusRegistry.get(transaction.applicantId);
        updateStatus.currentOrganisation = 'Credit Bureau';
        updateStatus.status = 'Credit Assessment Rejected';
        updateStatus.date = new Date().toLocaleString();
        await statusRegistry.update(updateStatus);

        // Emit an event when credit report is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateCreditReportEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.eventName = 'Credit Assessment Rejected';
        updateReportEvent.status = 'REJECTED';
    	emit(updateReportEvent);
    }
}