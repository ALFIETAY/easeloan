/**
 * Mortgage Loan transction processor functions for Land Authority
 */

/**
 * Create Title Registry Report Transaction
 * @param {mortgage.CreateTitleRegistry} createTitleRegistry
 * @transaction
 */
async function createTitleRegistry(transaction){
    console.log('Creating Title Registry Report');

    const factory = getFactory();
    const namespace = 'mortgage';

    const titleRegistryReport = factory.newResource(namespace, 'TitleRegistryReport', transaction.applicationId);
    titleRegistryReport.status = 'PROCESSING';
    titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')

    // Save Credit Report
    const titleRegistry = await getAssetRegistry(titleRegistryReport.getFullyQualifiedType());
    await titleRegistry.add(titleRegistryReport);
    
    // Emit an event when title registry is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateTitleEvent');
    reportEvent.applicationId = transaction.applicationId;
    reportEvent.eventName = 'Checking Title Deed Ownership';
    reportEvent.currentOrganisation = 'Land Authority';
    reportEvent.date = new Date().toLocaleString();
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
        const titleRegistryReport = await titleRegistry.get(transaction.applicationId);
        titleRegistryReport.status = 'COMPLETED';
        titleRegistryReport.propertyAddress = transaction.propertyAddress;
        titleRegistryReport.leaseDuration = transaction.leaseDuration;
        titleRegistryReport.leaseExpiry = transaction.leaseExpiry;
        titleRegistryReport.propertyExist = transaction.propertyExist;
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);

        // Emit an event when title registry is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicationId = transaction.applicationId;
        updateReportEvent.eventName = 'Title Deed Checks Completed';
        updateReportEvent.currentOrganisation = 'Land Authority';
        updateReportEvent.date = new Date().toLocaleString();
        updateReportEvent.status = 'COMPLETED';
        updateReportEvent.propertyAddress = transaction.propertyAddress;
        updateReportEvent.leaseDuration = transaction.leaseDuration;
        updateReportEvent.leaseExpiry = transaction.leaseExpiry;
        updateReportEvent.propertyExist = transaction.propertyExist;
        emit(updateReportEvent);

    }  else if (transaction.status === "REJECTED") {
		// Title registry has been rejected
        const titleRegistryReport = await titleRegistry.get(transaction.applicationId);
        titleRegistryReport.status = 'REJECTED';
        titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')
        await titleRegistry.update(titleRegistryReport);
        
        // Emit an event when title regitry is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicationId = transaction.applicationId;
        updateReportEvent.eventName = 'Title Deed Checks Rejected';
        updateReportEvent.currentOrganisation = 'Land Authority';
        updateReportEvent.date = new Date().toLocaleString();
        updateReportEvent.status = 'REJECTED';
        emit(updateReportEvent);
    }
}
