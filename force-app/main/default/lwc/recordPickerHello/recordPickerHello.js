import { wire, LightningElement } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';

export default class RecordPickerHello extends LightningElement {
    placeholder = 'Search...';
    label = 'Select a record';
    currentObjectApiName = 'Contact';
    selectedRecordId = '';
    contact;

    get variables() {
        return {
            selectedRecordId: this.selectedRecordId
        };
    }

    handleChange(event) {
        this.selectedRecordId = event.detail.recordId;
    }

    @wire(graphql, {
        query: gql`
            query searchContacts($selectedRecordId: ID) {
                uiapi {
                    query {
                        Contact(
                            where: { Id: { eq: $selectedRecordId } }
                            first: 1
                        ) {
                            edges {
                                node {
                                    Id
                                    Name {
                                        value
                                    }
                                    Phone {
                                        value
                                        displayValue
                                    }
                                    Title {
                                        value
                                    }
                                    Picture__c {
                                        value
                                        displayValue
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
        variables: '$variables'
    })
    wiredGraphQL({ data, errors }) {
        if (errors) {
            this.dispatchEvent(new CustomEvent('error', { error: errors }));
            return;
        }

        if (!data) {
            return;
        }

        const graphqlResults = data.uiapi.query.Contact.edges.map((edge) => ({
            Id: edge.node.Id,
            Name: edge.node.Name.value,
            Phone: edge.node.Phone.value,
            Picture__c: edge.node.Picture__c.value,
            Title: edge.node.Title.value
        }));

        this.contact =
            graphqlResults && graphqlResults.length
                ? graphqlResults[0]
                : undefined;
    }
}
