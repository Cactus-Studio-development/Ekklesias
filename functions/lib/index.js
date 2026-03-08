"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agenda = exports.ministerios = exports.multimedia = exports.oracion = exports.informacion = exports.eventos = exports.registerAdmin = exports.session = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const https_1 = require("firebase-functions/v2/https");
const path = require("path");
const fs = require("fs");
function loadCredentials() {
    let raw = null;
    const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (envPath && fs.existsSync(envPath)) {
        raw = fs.readFileSync(envPath, "utf8");
    }
    else {
        const relativePath = path.join(__dirname, "..", "..", "json", "fb-api-79e8c-firebase-adminsdk-1miog-a209b2b185.json");
        if (fs.existsSync(relativePath)) {
            raw = fs.readFileSync(relativePath, "utf8");
        }
    }
    if (!raw)
        return undefined;
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.project_id !== "string")
            return undefined;
        return parsed;
    }
    catch {
        return undefined;
    }
}
try {
    const creds = loadCredentials();
    if (creds) {
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(creds),
            storageBucket: `${creds.project_id ?? creds.projectId}.appspot.com`,
        });
    }
    else {
        (0, app_1.initializeApp)();
    }
}
catch {
    (0, app_1.initializeApp)();
}
const auth = (0, auth_1.getAuth)();
const db = (0, firestore_1.getFirestore)();
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
};
function getToken(req) {
    const authHeader = req.headers?.authorization;
    const bearer = typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : "";
    if (bearer)
        return bearer;
    const body = req.body && typeof req.body === "object" && "token" in req.body ? req.body.token : null;
    if (typeof body === "string")
        return body;
    const q = req.query?.token;
    if (typeof q === "string")
        return q;
    if (Array.isArray(q) && q[0])
        return q[0];
    return null;
}
async function requireAdmin(req) {
    const token = getToken(req);
    if (!token)
        return null;
    try {
        const decoded = await auth.verifyIdToken(token);
        const adminDoc = await db.collection("admins").doc(decoded.uid).get();
        return adminDoc.exists ? { uid: decoded.uid } : null;
    }
    catch {
        return null;
    }
}
exports.session = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*").set("Access-Control-Allow-Methods", "GET, POST, OPTIONS").set("Access-Control-Allow-Headers", "Authorization, Content-Type").status(204).send();
        return;
    }
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? req.body?.token ?? req.query?.token;
    if (!token) {
        res.status(401).json({ error: "missing_token" });
        return;
    }
    try {
        const decoded = await auth.verifyIdToken(token);
        const uid = decoded.uid;
        const adminDoc = await db.collection("admins").doc(uid).get();
        const isAdmin = adminDoc.exists;
        res.set("Access-Control-Allow-Origin", "*").status(200).json({
            uid: decoded.uid,
            email: decoded.email ?? null,
            isAdmin,
        });
    }
    catch (e) {
        res.status(401).json({ error: "invalid_token" });
    }
});
exports.registerAdmin = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*").set("Access-Control-Allow-Methods", "POST, OPTIONS").set("Access-Control-Allow-Headers", "Authorization, Content-Type").status(204).send();
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? (req.body && typeof req.body === "object" && "token" in req.body ? req.body.token : null);
    if (!token) {
        res.status(401).json({ error: "missing_token" });
        return;
    }
    try {
        const decoded = await auth.verifyIdToken(token);
        const uid = decoded.uid;
        const email = decoded.email ?? null;
        await db.collection("admins").doc(uid).set({
            email,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        res.set("Access-Control-Allow-Origin", "*").status(200).json({ success: true });
    }
    catch (e) {
        res.status(401).json({ error: "invalid_token" });
    }
});
exports.eventos = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const snap = await db.collection("eventos").orderBy("fecha", "desc").limit(50).get();
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            res.set(CORS_HEADERS).status(200).json({ eventos: list });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "list_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const title = typeof body?.title === "string" ? body.title : "";
        const description = typeof body?.description === "string" ? body.description : "";
        const fecha = typeof body?.fecha === "string" ? body.fecha : "";
        const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";
        if (!title.trim()) {
            res.set(CORS_HEADERS).status(400).json({ error: "title_required" });
            return;
        }
        try {
            const ref = await db.collection("eventos").add({
                title: title.trim(),
                description: description.trim(),
                fecha: fecha.trim(),
                imageUrl: imageUrl.trim() || null,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            res.set(CORS_HEADERS).status(200).json({ success: true, id: ref.id });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "create_failed" });
        }
        return;
    }
    if (req.method === "DELETE") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const id = typeof req.query?.id === "string" ? req.query.id : (req.body && typeof req.body === "object" && "id" in req.body ? req.body.id : null);
        if (!id) {
            res.set(CORS_HEADERS).status(400).json({ error: "id_required" });
            return;
        }
        try {
            await db.collection("eventos").doc(id).delete();
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "delete_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
const INFO_DOC = "principal";
const ORACION_DOC = "principal";
exports.informacion = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const doc = await db.collection("informacion").doc(INFO_DOC).get();
            const data = doc.exists ? doc.data() : null;
            res.set(CORS_HEADERS).status(200).json(data ?? { title: "", body: "" });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "read_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const title = typeof body?.title === "string" ? body.title : "";
        const content = typeof body?.body === "string" ? body.body : (typeof body?.content === "string" ? body.content : "");
        try {
            await db.collection("informacion").doc(INFO_DOC).set({ title: title.trim(), body: content.trim(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "update_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
exports.oracion = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const doc = await db.collection("oracion").doc(ORACION_DOC).get();
            const data = doc.exists ? doc.data() : null;
            res.set(CORS_HEADERS).status(200).json(data ?? { verseText: "", verseRef: "", message: "" });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "read_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const verseText = typeof body?.verseText === "string" ? body.verseText : "";
        const verseRef = typeof body?.verseRef === "string" ? body.verseRef : "";
        const message = typeof body?.message === "string" ? body.message : "";
        try {
            await db.collection("oracion").doc(ORACION_DOC).set({ verseText: verseText.trim(), verseRef: verseRef.trim(), message: message.trim(), updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "update_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
exports.multimedia = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const snap = await db.collection("multimedia").orderBy("createdAt", "desc").limit(100).get();
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            res.set(CORS_HEADERS).status(200).json({ items: list });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "list_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const url = typeof body?.url === "string" ? body.url : "";
        const title = typeof body?.title === "string" ? body.title : "";
        const storagePath = typeof body?.storagePath === "string" ? body.storagePath : "";
        if (!url.trim()) {
            res.set(CORS_HEADERS).status(400).json({ error: "url_required" });
            return;
        }
        try {
            const ref = await db.collection("multimedia").add({
                url: url.trim(),
                title: (title || "Imagen").trim(),
                storagePath: storagePath.trim() || null,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            res.set(CORS_HEADERS).status(200).json({ success: true, id: ref.id });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "create_failed" });
        }
        return;
    }
    if (req.method === "DELETE") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const id = typeof req.query?.id === "string" ? req.query.id : (req.body && typeof req.body === "object" && "id" in req.body ? req.body.id : null);
        if (!id) {
            res.set(CORS_HEADERS).status(400).json({ error: "id_required" });
            return;
        }
        try {
            const doc = await db.collection("multimedia").doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                const storagePath = data?.storagePath;
                if (storagePath && typeof storagePath === "string") {
                    try {
                        const bucket = (0, storage_1.getStorage)().bucket();
                        await bucket.file(storagePath).delete();
                    }
                    catch {
                        /* ignore */
                    }
                }
                await db.collection("multimedia").doc(id).delete();
            }
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "delete_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
exports.ministerios = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const snap = await db.collection("ministerios").orderBy("createdAt", "asc").limit(50).get();
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            res.set(CORS_HEADERS).status(200).json({ items: list });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "list_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const id = typeof body?.id === "string" ? body.id : null;
        const title = typeof body?.title === "string" ? body.title : "";
        const text = typeof body?.text === "string" ? body.text : "";
        const icon = typeof body?.icon === "string" ? body.icon : "users";
        if (!title.trim()) {
            res.set(CORS_HEADERS).status(400).json({ error: "title_required" });
            return;
        }
        const iconVal = ["book", "users", "heart"].includes(icon) ? icon : "users";
        try {
            if (id) {
                await db.collection("ministerios").doc(id).set({ title: title.trim(), text: text.trim(), icon: iconVal, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
                res.set(CORS_HEADERS).status(200).json({ success: true, id });
            }
            else {
                const ref = await db.collection("ministerios").add({
                    title: title.trim(),
                    text: text.trim(),
                    icon: iconVal,
                    createdAt: firestore_1.FieldValue.serverTimestamp(),
                });
                res.set(CORS_HEADERS).status(200).json({ success: true, id: ref.id });
            }
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "save_failed" });
        }
        return;
    }
    if (req.method === "DELETE") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const id = typeof req.query?.id === "string" ? req.query.id : (req.body && typeof req.body === "object" && "id" in req.body ? req.body.id : null);
        if (!id) {
            res.set(CORS_HEADERS).status(400).json({ error: "id_required" });
            return;
        }
        try {
            await db.collection("ministerios").doc(id).delete();
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "delete_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
const AGENDA_DOC = "semanal";
exports.agenda = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    if (req.method === "OPTIONS") {
        res.set(CORS_HEADERS).status(204).send();
        return;
    }
    if (req.method === "GET") {
        try {
            const doc = await db.collection("agenda").doc(AGENDA_DOC).get();
            const data = doc.exists ? doc.data() : null;
            res.set(CORS_HEADERS).status(200).json(data ?? { slots: [], porDefinir: [] });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "read_failed" });
        }
        return;
    }
    if (req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) {
            res.set(CORS_HEADERS).status(401).json({ error: "unauthorized" });
            return;
        }
        const body = req.body;
        const slotsRaw = Array.isArray(body?.slots) ? body.slots : [];
        const porDefinirRaw = Array.isArray(body?.porDefinir) ? body.porDefinir : [];
        const slots = slotsRaw
            .filter((s) => s && typeof s === "object" && "day" in s && "event" in s && "hour" in s)
            .map((s) => ({
            day: String(s.day ?? "").trim(),
            event: String(s.event ?? "").trim(),
            hour: String(s.hour ?? "").trim(),
            icon: String(s.icon ?? "users").trim() || "users",
        }))
            .filter((s) => s.day && s.event);
        const porDefinir = porDefinirRaw
            .filter((x) => typeof x === "string" && x.trim())
            .map((x) => x.trim());
        try {
            await db.collection("agenda").doc(AGENDA_DOC).set({ slots, porDefinir, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
            res.set(CORS_HEADERS).status(200).json({ success: true });
        }
        catch (e) {
            res.set(CORS_HEADERS).status(500).json({ error: "update_failed" });
        }
        return;
    }
    res.set(CORS_HEADERS).status(405).json({ error: "method_not_allowed" });
});
