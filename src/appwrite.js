import { Client, Databases, Storage, Account } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://vps.kernelforge.codes/v1';
export const APPWRITE_PROJECT = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6ace99ee0034f0bbaf8c';
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'plastitrace_db';
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'plastitrace_photos';

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

// Preset demo accounts for Arbiter Hacks V1 judges
export const DEMO_USERS = [
  {
    id: 'usr_collecteur',
    name: 'Moussa Bello',
    email: 'moussa.collecte@plastitrace.org',
    role: 'collecteur',
    roleLabel: 'Collecteur Terrain',
    organization: 'Coopérative Éco-Collecteurs Yaoundé',
    city: 'Yaoundé',
    avatar: 'MB',
    stats: { lotsCreated: 48, kgCollected: 1840.5, trustScore: 98 }
  },
  {
    id: 'usr_centre',
    name: 'Chantal Ngo',
    email: 'chantal.tri@plastitrace.org',
    role: 'centre',
    roleLabel: 'Centre de Tri & Pesée',
    organization: 'Centre de Tri Douala-Bassa',
    city: 'Douala',
    avatar: 'CN',
    stats: { lotsVerified: 112, kgTriaged: 4230.0, varianceRate: '0.4%' }
  },
  {
    id: 'usr_recycleur',
    name: 'Fabrice Kamga',
    email: 'fabrice.poly@plastitrace.org',
    role: 'recycleur',
    roleLabel: 'Usine de Recyclage',
    organization: 'Cameroon PolyRecycle',
    city: 'Douala',
    avatar: 'FK',
    stats: { lotsRecycled: 85, pelletsProducedKg: 3100, purityAvg: '97.8%' }
  },
  {
    id: 'usr_auditeur',
    name: 'Claire Dupont',
    email: 'claire.esg@plastitrace.org',
    role: 'auditeur',
    roleLabel: 'Auditeur ESG & Marque',
    organization: 'Bureau Veritas & Partenaires Boissons',
    city: 'International',
    avatar: 'CD',
    stats: { certsAudited: 24, complianceRate: '100%', standard: 'PPWR 2026' }
  }
];

// Helper to compute a deterministic or random SHA-256 hash string
export function generateHash(prefix = '') {
  const chars = '0123456789abcdef';
  let str = '';
  for (let i = 0; i < 64; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix ? `${prefix}:${str}` : str;
}
