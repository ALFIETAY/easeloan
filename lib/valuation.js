/**
 * Mortgage Loan transction processor functions for Valuation Assessor
 */

/**
 * Create Valuation Report Transaction
 * @param {mortgage.CreateValuationReport} createValuationReport
 * @transaction
 */
async function createValuationReport(transaction){
    console.log('Creating Valuation Report');

    const factory = getFactory();
    const namespace = 'mortgage';

    const valuationReport = factory.newResource(namespace, 'ValuationReport', transaction.applicationId);
    valuationReport.status = 'PROCESSING';
    valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');

    // Save Valuation Report
    const valuationRegistry = await getAssetRegistry(valuationReport.getFullyQualifiedType());
    await valuationRegistry.add(valuationReport);

    // Emit an event when valuation report is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateValuationEvent');
    reportEvent.applicationId = transaction.applicationId;
    reportEvent.eventName = 'Assessing Property Valuation';
    reportEvent.currentOrganisation = 'Property Surveyor';
    reportEvent.date = new Date().toLocaleString();
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
        const valuationReport = await valuationRegistry.get(transaction.applicationId);
        valuationReport.status = 'COMPLETED';
        valuationReport.estimatedValue = transaction.estimatedValue;
        valuationReport.marketValue = transaction.marketValue;
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

        // Emit an event when valuation report is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateValuationReportEvent');
        updateReportEvent.applicationId = transaction.applicationId;
        updateReportEvent.eventName = 'Valuation Assessment Completed';
        updateReportEvent.currentOrganisation = 'Property Surveyor';
        updateReportEvent.date = new Date().toLocaleString();
        updateReportEvent.status = 'COMPLETED';
        updateReportEvent.estimatedValue = transaction.estimatedValue;
        updateReportEvent.marketValue = transaction.marketValue;
        emit(updateReportEvent);

    }  else if (transaction.status === "REJECTED") {
      	// Valuation Report has been rejected
        const valuationReport = await valuationRegistry.get(transaction.applicationId);
        valuationReport.status = 'REJECTED';
        valuationReport.valuationAssessor = factory.newRelationship(namespace, 'ValuationAssessor', 'VA001');
        await valuationRegistry.update(valuationReport);

        // Emit an event when valuation report is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateValuationReportEvent');
        updateReportEvent.applicationId = transaction.applicationId;
        updateReportEvent.eventName = 'Valuation Assessment Rejected';
        updateReportEvent.currentOrganisation = 'Property Surveyor';
        updateReportEvent.date = new Date().toLocaleString();
        updateReportEvent.status = 'REJECTED';
        emit(updateReportEvent);
    }
}
