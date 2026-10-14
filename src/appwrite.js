import { Client, Databases, Storage, Account } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://vps.kernelforge.codes/v1';
export const APPWRITE_PROJECT = '6ace99ee0034f0bbaf8c';
export const DATABASE_ID = 'plastitrace_db';
export const STORAGE_BUCKET_ID = 'plastitrace_photos';

export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export const COLLECTIONS = {
    ORGANIZATIONS: 'organizations',
    LOTS: 'lots',
    EVENTS: 'events',
    CERTIFICATES: 'certificates'
};
