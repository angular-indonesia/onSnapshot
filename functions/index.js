"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("zone.js/dist/zone-node");
const functions = require("firebase-functions");
const express = require("express");
const fs = require("fs");
const platform_server_1 = require("@angular/platform-server");
exports.viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite(event => {
    const countRef = event.data.adminRef.root.child(`articleViewCount/${event.params.articleId}`);
    return countRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
        }
    });
});
const AppServerModuleNgFactory = require(__dirname + '/dist/main.bundle').AppServerModuleNgFactory;
const document = fs.readFileSync(__dirname + '/dist/index.html', 'utf8');
const app = express();
app.get('**', (req, res) => {
    const url = req.path;
    platform_server_1.renderModuleFactory(AppServerModuleNgFactory, { document, url }).then(html => {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
        res.send(html);
    });
});
exports.ssr = functions.https.onRequest(app);
