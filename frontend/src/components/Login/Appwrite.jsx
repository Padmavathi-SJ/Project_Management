import { Client, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1/account/sessions/oauth2/callback') // Or your self-hosted URL
    .setProject('6833f0920027c7198b53'); // Replace with your project ID

const account = new Account(client);

export { client, account };
