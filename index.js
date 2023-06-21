import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js";
import { google } from "googleapis";
import { sendEmails } from "./controllers/userController.js";
import cron from "node-cron";

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());
dotenv.config();

const PORT = process.env.PORT;
const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL;

app.use("/api/v1/user", userRoutes);

mongoose
  .connect(MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server listening to the port : ${PORT}`)
    )
  )
  .catch((error) => console.log(error.message))
  .finally(() => console.log("Mongo DB Connection Successful"));

const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLEINT_SECRET);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

cron.schedule(`0 0 * * 1`, () => {
  sendEmails(oAuth2Client);
});

// sendEmails(oAuth2Client);
