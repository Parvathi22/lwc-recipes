import { createElement } from 'lwc';
import EventWithData from 'c/eventWithData';
import { registerApexTestWireAdapter } from '@salesforce/sfdx-lwc-jest';
import getContactList from '@salesforce/apex/ContactController.getContactList';

// Realistic data with a list of records
const mockGetContactList = require('./data/getContactList.json');

// An empty list of records to verify the component does something reasonable
// when there is no data to display
const mockGetContactListNoRecords = require('./data/getContactListNoRecords.json');

// Register as Apex wire adapter. Some tests verify that provisioned values trigger desired behavior.
const getContactListAdapter = registerApexTestWireAdapter(getContactList);

describe('c-event-with-data', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    async function flushPromises() {
        return Promise.resolve();
    }

    describe('getContactList @wire data', () => {
        it('renders two c-contact-list-item elements', async () => {
            // Create initial element
            const element = createElement('c-event-with-data', {
                is: EventWithData
            });
            document.body.appendChild(element);

            // Emit data from @wire
            getContactListAdapter.emit(mockGetContactList);

            // Wait for any asynchronous DOM updates
            await flushPromises();

            // Select elements for validation
            const contactListItemEls = element.shadowRoot.querySelectorAll(
                'c-contact-list-item'
            );
            expect(contactListItemEls.length).toBe(mockGetContactList.length);
        });

        it('renders no c-contact-list-item-bubbling elements when no data', async () => {
            // Create initial element
            const element = createElement('c-event-with-data', {
                is: EventWithData
            });
            document.body.appendChild(element);

            // Emit data from @wire
            getContactListAdapter.emit(mockGetContactListNoRecords);

            // Wait for any asynchronous DOM updates
            await flushPromises();

            // Select elements for validation
            const contactListItemEls = element.shadowRoot.querySelectorAll(
                'c-contact-list-item'
            );
            expect(contactListItemEls.length).toBe(
                mockGetContactListNoRecords.length
            );
        });
    });

    describe('getContactList @wire error', () => {
        it('shows error panel element', async () => {
            // Create initial element
            const element = createElement('c-event-with-data', {
                is: EventWithData
            });
            document.body.appendChild(element);

            // Emit error from @wire
            getContactListAdapter.error();

            // Wait for any asynchronous DOM updates
            await flushPromises();

            const errorPanelEl =
                element.shadowRoot.querySelector('c-error-panel');
            expect(errorPanelEl).not.toBeNull();
        });
    });

    it('shows selected contact data after event', async () => {
        // Create initial element
        const element = createElement('c-event-with-data', {
            is: EventWithData
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getContactListAdapter.emit(mockGetContactList);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Select element for validation
        const contactListItemEls = element.shadowRoot.querySelectorAll(
            'c-contact-list-item'
        );
        expect(contactListItemEls.length).toBe(mockGetContactList.length);
        // Dispatch event from child element to validate
        // behavior in current component.
        contactListItemEls[0].dispatchEvent(
            new CustomEvent('select', {
                detail: mockGetContactList[0].Id
            })
        );
        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Select element for validation
        const contactNameEl = element.shadowRoot.querySelector('p');
        expect(contactNameEl.textContent).toBe(mockGetContactList[0].Name);
    });

    it('is accessible when data is returned', async () => {
        // Create initial element
        const element = createElement('c-event-with-data', {
            is: EventWithData
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getContactListAdapter.emit(mockGetContactList);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });

    it('is accessible when error is returned', async () => {
        // Create initial element
        const element = createElement('c-event-with-data', {
            is: EventWithData
        });
        document.body.appendChild(element);

        // Emit error from @wire
        getContactListAdapter.error();

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });

    it('is accessible when contact is selected', async () => {
        // Create initial element
        const element = createElement('c-event-with-data', {
            is: EventWithData
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getContactListAdapter.emit(mockGetContactList);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Select element for validation
        const contactListItemEls = element.shadowRoot.querySelectorAll(
            'c-contact-list-item'
        );
        expect(contactListItemEls.length).toBe(mockGetContactList.length);
        // Dispatch event from child element to validate
        // behavior in current component.
        contactListItemEls[0].dispatchEvent(
            new CustomEvent('select', {
                detail: mockGetContactList[0].Id
            })
        );

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });
});
