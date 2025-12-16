import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // montée progressive à 10 VUs
    { duration: '3m', target: 10 },  // palier nominal
    { duration: '2m', target: 30 },  // petit stress à 30 VUs
    { duration: '3m', target: 30 },  // palier stress
    { duration: '1m', target: 0 },   // descente
  ],
};

// Depuis le réseau docker compose, on parle directement au service backend
const BASE_URL = __ENV.BASE_URL || 'http://backend:8080';
const TOKEN = __ENV.TOKEN || ''; // mets ici un JWT si nécessaire, ou passe-le via env

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  };

  // TODO: remplace ce endpoint par un endpoint métier représentatif
  const res = http.get(`${BASE_URL}/api/health`, params);

  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  sleep(1);
}


