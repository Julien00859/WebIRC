// Importation des dépendances
const fs = require("fs");
const http = require("http");
const io = require("socket.io")(http);
const pathlib = require("path");
const urllib = require("url");

// Fait la liste des extensions disponible et les lie à leur header html
const availableExtension = {
    ".html":"text/html",
    ".css":"text/css",
    ".txt":"text/plain",
    ".js":"text/javascript",
    ".json":"text/plain"
};

// Récupération du dossier client statique, remonte d'un dossier à la hard et entre dans le dossier client à la hard
const clientPath = pathlib.join(process.cwd().slice(0, process.cwd().lastIndexOf(pathlib.sep)), "client")

http.createServer(function(req, res){
    var uri = pathlib.join(clientPath, urllib.parse(req.url).pathname); // Récupère le fichier ciblé par l'URL et ajoute le path en préfix
    var ext = pathlib.extname(uri); // Récupère l'extention du fichier

    console.log("Access to " + uri);

    if (fs.statSync(uri).isDirectory()) { // Si il s'avère que c'était un répertoire
        uri = pathlib.join(uri, "index.html"); // On récupère le index.html de ce répertoire
        ext = ".html"; // On met l'extention sur .html
    }

    fs.access(uri, fs.R_OK, function(err){ // Tente d'accéder au fichier en lecture
        if (!err) { // Si le fichier est accessible
            if (ext in availableExtension) {  // et d'extention connue
                fs.readFile(uri, "utf-8", function(err, data) { // On essaie de l'ouvrir en format unicode
                    if (!err) { // Si pas d'erreur, on l'envoie
                        res.writeHead(200, {"Content-type": availableExtension[ext]});
                        res.write(data);
                        res.end();
                    } else { // Sinon on renvoie une erreur 500
                        res.writeHead(500, {"Content-type": "text/plain"});
                        res.end("500 - Internal error");
                    }
                });
            } else { // mais d'extention inconnue
                fs.readFile(uri, "binary", function(err, data) { // On essaie de l'ouvrir en format binaire
                    if (!err) { // Si pas d'erreur on l'envoie
                        res.writeHead(200, {"Content-type": "binary"});
                        res.write(data, "binary");
                    } else { // Sinon on renvoie une erreur 500
                        res.writeHead(500, {"Content-type": "text/plain"});
                        res.end("500 - Internal error");
                    }
                });
            }
        } else { // Si le fichier est introuvable on renvoie une erreur 404
            res.writeHead(404, {"Content-type": "text/plain"});
            res.end("404 - Page not found");
        }
    });
}).listen(8080); // Écoute sur le port 8080

console.log("Server path: " + process.cwd());
console.log("Client path: " + clientPath);
console.log("Server running on localhost:8080\n");
