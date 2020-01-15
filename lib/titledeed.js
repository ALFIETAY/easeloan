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

    const titleRegistryReport = factory.newResource(namespace, 'TitleRegistryReport', transaction.applicantId);
    titleRegistryReport.status = 'PROCESSING';
    titleRegistryReport.landAuthority = factory.newRelationship(namespace, 'LandAuthority', 'LA001')

    // Save Credit Report
    const titleRegistry = await getAssetRegistry(titleRegistryReport.getFullyQualifiedType());
    await titleRegistry.add(titleRegistryReport);

    // Set Status to 'Checking Title Deed Ownership'
    const statusRegistry = await getAssetRegistry(namespace + '.Status');
    const updateStatus = await statusRegistry.get(transaction.applicantId);
    updateStatus.currentOrganisation = 'Land Authority';
    updateStatus.status = 'Checking Title Deed Ownership';
    updateStatus.date = new Date().toLocaleString();
    await statusRegistry.update(updateStatus);
    
    // Emit an event when title registry is created
    const reportEvent = getFactory().newEvent(namespace, 'CreateTitleEvent');
    reportEvent.applicantId = transaction.applicantId;
    reportEvent.eventName = 'Checking Title Deed Ownership';
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

        // Set Status to 'Title Deed Checks Completed'
        const statusRegistry = await getAssetRegistry(namespace + '.Status');
        const updateStatus = await statusRegistry.get(transaction.applicantId);
        updateStatus.currentOrganisation = 'Land Authority';
        updateStatus.status = 'Title Deed Checks Completed';
        updateStatus.date = new Date().toLocaleString();
        await statusRegistry.update(updateStatus);

        // Emit an event when title registry is updated
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.eventName = 'Title Deed Checks Completed';
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

        // Set Status to 'Title Registry Rejected'
        const statusRegistry = await getAssetRegistry(namespace + '.Status');
        const updateStatus = await statusRegistry.get(transaction.applicantId);
        updateStatus.currentOrganisation = 'Land Authority';
        updateStatus.status = 'Title Deed Checks Rejected';
        updateStatus.date = new Date().toLocaleString();
        await statusRegistry.update(updateStatus);
        
        // Emit an event when title regitry is rejected
        const updateReportEvent = getFactory().newEvent(namespace, 'UpdateTitleRegistryEvent');
        updateReportEvent.applicantId = transaction.applicantId;
        updateReportEvent.eventName = 'Title Deed Checks Rejected';
        updateReportEvent.status = 'REJECTED';
        emit(updateReportEvent);
    }
}
