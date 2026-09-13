import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";

import db from "./utils/database";

async function init() {
    try {
        const result = await db();
        console.log("database status", result);

        const app = express();
        app.use(bodyParser.json());

        const PORT = 3000;

        app.use("/api", router);

        app.listen(PORT, () => {
            console.log(`Server is Running on http://localhost:${PORT}`);
        })
                
    } catch (error) {
        console.log(error);
    }
}

init();
