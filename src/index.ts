import * as csv from '@fast-csv/parse';
import { initializeApp } from "firebase/app";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";

import 'dotenv/config';

import fs from 'fs';

const firebaseConfig = {
    apiKey: process.env.VITE_FB_APIKEY,
    authDomain: process.env.VITE_FB_AUTHDOMAIN,
    projectId: process.env.VITE_FB_PROJECTID,
    storageBucket: process.env.VITE_FB_STORAGEBUCKET,
    messagingSenderId: process.env.VITE_FB_MESSAGINGSENDERID,
    appId: process.env.VITE_FB_APPID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

function cleanObj(obj: any) {
    const acceptableKeys = [
        "nome",
        "cognome",
        "abbonamento",
        "inizio",
        "fine_55",
        "fine_110",
        "correzioni_scadenze",
        "giorni",
        "saldo",
        "recuperi",
        "quota_iscrizione_2024",
        "greenpass",
        "liberatoria",
        "CF",
        "indirizzo",
        "telefono",
        "mail"
    ];

    for (let key in obj) {
        if (!acceptableKeys.includes(key) || !obj[key] || !obj['nome'] || !obj['cognome']) {
            delete obj[key];
        }
    }
    return obj;
}

const fillDatabase = () => {
    const csvData: any[] = [];
    fs.createReadStream("./tpt.csv")
        .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
        .on('data', async (row) => {
            try {
                const formattedRow = cleanObj(row);
                csvData.push(formattedRow);
                const doc = await addDoc(collection(db, "client"), { ...formattedRow, createdAt: serverTimestamp() });
                console.warn(doc);
            } catch (e) {
                console.error(e);
            }
        })
        .on('end', () => {
            console.warn(`Record inseriti: ${csvData.length}`);
        });
};

fillDatabase();